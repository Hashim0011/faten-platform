#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════
 *  مُشغّل تحليل SonarQube + التحقق من بوابة الجودة
 *
 *  يعمل في سياقين:
 *   ① محلياً    — مقابل docker-compose.sonar.yml على localhost:9000
 *   ② في CI     — مقابل Service Container داخل GitHub Actions
 *
 *  المراحل:
 *   1. الانتظار حتى يصبح السيرفر جاهزاً (UP)
 *   2. تهيئة أولية: تغيير كلمة المرور الافتراضية + توليد توكن
 *   3. تشغيل الماسح
 *   4. استطلاع بوابة الجودة والخروج بحالة فشل إذا لم تُجتَز
 * ═══════════════════════════════════════════════════════════
 */
import scanner from 'sonarqube-scanner';
import { readFileSync } from 'node:fs';

const HOST = process.env.SONAR_HOST_URL || 'http://localhost:9000';
const PROJECT_KEY = 'faten-platform';
const DEFAULT_PW = 'admin';
const NEW_PW = process.env.SONAR_ADMIN_PASSWORD || 'FatenCI!2026';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (msg) => console.log(`[sonar] ${msg}`);

/** ① انتظار جاهزية السيرفر — SonarQube يحتاج دقيقة أو أكثر للإقلاع */
async function waitForServer(timeoutMs = 300_000) {
  const deadline = Date.now() + timeoutMs;
  let lastStatus = '';
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${HOST}/api/system/status`);
      const body = await res.json();
      if (body.status !== lastStatus) {
        lastStatus = body.status;
        log(`الحالة: ${body.status}`);
      }
      if (body.status === 'UP') return;
    } catch {
      /* السيرفر لم يبدأ بعد */
    }
    await sleep(5000);
  }
  throw new Error(`SonarQube لم يصبح جاهزاً خلال ${timeoutMs / 1000} ثانية`);
}

const basic = (user, pass) => 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');

/** ② التهيئة: تغيير كلمة المرور الافتراضية ثم توليد توكن تحليل */
async function bootstrapToken() {
  if (process.env.SONAR_TOKEN) {
    log('استخدام SONAR_TOKEN من البيئة');
    return process.env.SONAR_TOKEN;
  }

  // SonarQube يرفض العمل بكلمة المرور الافتراضية — نغيّرها أولاً
  const change = await fetch(`${HOST}/api/users/change_password`, {
    method: 'POST',
    headers: {
      Authorization: basic('admin', DEFAULT_PW),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ login: 'admin', previousPassword: DEFAULT_PW, password: NEW_PW }),
  });
  log(change.ok ? 'كلمة مرور admin غُيّرت' : 'كلمة المرور مضبوطة مسبقاً');

  // توليد توكن باسم فريد (SonarQube يرفض الأسماء المكررة)
  const name = `ci-${process.env.GITHUB_RUN_ID || Date.now()}`;
  const res = await fetch(`${HOST}/api/user_tokens/generate`, {
    method: 'POST',
    headers: {
      Authorization: basic('admin', NEW_PW),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ name }),
  });
  if (!res.ok) throw new Error(`فشل توليد التوكن: ${res.status} ${await res.text()}`);

  log('تم توليد توكن التحليل');
  return (await res.json()).token;
}

/** ③ تشغيل الماسح */
async function runScan(token) {
  const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
  log('بدء التحليل...');

  await scanner.scan({
    serverUrl: HOST,
    options: {
      'sonar.token': token,
      'sonar.projectVersion': version,
      // في CI نمرّر معلومات الفرع/الـ PR ليعمل Clean as You Code بدقة
      ...(process.env.GITHUB_SHA ? { 'sonar.scm.revision': process.env.GITHUB_SHA } : {}),
    },
  });

  log('اكتمل التحليل');
}

/** ④ استطلاع بوابة الجودة */
async function checkQualityGate(token) {
  log('انتظار نتيجة بوابة الجودة...');
  const auth = basic(token, '');

  for (let i = 0; i < 30; i++) {
    await sleep(4000);
    const res = await fetch(
      `${HOST}/api/qualitygates/project_status?projectKey=${PROJECT_KEY}`,
      { headers: { Authorization: auth } }
    );
    if (!res.ok) continue;

    const { projectStatus } = await res.json();
    if (!projectStatus || projectStatus.status === 'NONE') continue;

    console.log('\n' + '═'.repeat(60));
    console.log(`  بوابة الجودة: ${projectStatus.status === 'OK' ? '✅ نجحت' : '❌ فشلت'}`);
    console.log('═'.repeat(60));

    for (const c of projectStatus.conditions || []) {
      const icon = c.status === 'OK' ? '✅' : '❌';
      console.log(`  ${icon} ${c.metricKey}: ${c.actualValue} (الحد: ${c.comparator} ${c.errorThreshold})`);
    }
    console.log('═'.repeat(60));
    console.log(`  التقرير الكامل: ${HOST}/dashboard?id=${PROJECT_KEY}\n`);

    return projectStatus.status === 'OK';
  }

  throw new Error('انتهت مهلة انتظار بوابة الجودة');
}

// ─── التنفيذ ───
try {
  await waitForServer();
  const token = await bootstrapToken();
  await runScan(token);
  const passed = await checkQualityGate(token);

  if (!passed && process.env.SONAR_ENFORCE_GATE !== 'false') {
    console.error('❌ بوابة الجودة لم تُجتَز — إيقاف البايب لاين');
    process.exit(1);
  }
  process.exit(0);
} catch (err) {
  console.error(`❌ فشل تحليل Sonar: ${err.message}`);
  process.exit(1);
}
