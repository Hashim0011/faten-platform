import { defineConfig, devices } from '@playwright/test';

/**
 * إعداد Playwright — اختبارات End-to-End
 * https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  // ─── التوازي: يسرّع التنفيذ كثيراً ───
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,

  // ─── في CI: امنع test.only المنسي، وأعد المحاولة مرتين للتقليل من التذبذب ───
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  // ─── التقارير ───
  reporter: process.env.CI
    ? [
        ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['junit', { outputFile: 'reports/e2e-junit.xml' }],
        ['github'], // تعليقات مباشرة على أسطر الكود في الـ PR
      ]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:4173',
    // آثار للتشخيص عند الفشل فقط — توفّر مساحة ووقتاً
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'ar-SA',
    timezoneId: 'Asia/Riyadh',
  },

  // ─── مصفوفة المتصفحات ───
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],

  // ─── يشغّل التطبيق تلقائياً قبل الاختبارات ───
  //
  //  ثلاثة سيناريوهات:
  //   ① E2E_BASE_URL مضبوط  → نختبر نشراً حقيقياً (Deploy Preview) بلا خادم محلي
  //   ② CI                   → نخدم قطعة dist المبنيّة مسبقاً فقط، بلا إعادة بناء
  //   ③ محلياً                → نبني ثم نخدم (لأن dist قد لا تكون موجودة)
  //
  //  ⚠️ السيناريو ② حرج: إعادة البناء داخل job الاختبارات تُنتج نسخة
  //  مختلفة عن التي ستُنشر (بأسرار مختلفة أو مفقودة)، وتخالف مبدأ
  //  "ابنِ مرة واحدة وانشر نفس القطعة". نختبر ما سيُنشر بالضبط.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: process.env.CI ? 'npm run preview' : 'npm run build && npm run preview',
        url: 'http://localhost:4173',
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
