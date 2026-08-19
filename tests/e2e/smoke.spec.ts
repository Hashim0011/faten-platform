import { expect, test } from '@playwright/test';

/**
 * اختبارات الدخان (Smoke Tests)
 * الهدف: التحقق أن التطبيق "حيّ" بعد النشر — أسرع وأهم فحص بعد أي إصدار.
 * تُشغَّل مقابل الـ Deploy Preview وبيئة الإنتاج.
 */
test.describe('الدخان — التطبيق يعمل', () => {
  test('الصفحة الرئيسية تُحمّل بعنوان ولغة صحيحين', async ({ page }) => {
    const response = await page.goto('/');

    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(/فطن/);

    // التطبيق عربي: يجب أن يكون الاتجاه من اليمين لليسار
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('تطبيق React يُركّب فعلياً (ليس صفحة فارغة)', async ({ page }) => {
    await page.goto('/');
    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();
    await expect(page.getByRole('heading', { name: 'فطن', exact: true })).toBeVisible();
  });

  test('لا أخطاء JavaScript حرجة عند التحميل', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(errors, `أخطاء غير متوقعة: ${errors.join(' | ')}`).toHaveLength(0);
  });

  test('الأصول الثابتة تُحمّل بنجاح', async ({ page }) => {
    const failed: string[] = [];
    page.on('response', (r) => {
      if (r.status() >= 400 && /\.(js|css)$/.test(new URL(r.url()).pathname)) {
        failed.push(`${r.status()} ${r.url()}`);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(failed, `أصول فشلت: ${failed.join(' | ')}`).toHaveLength(0);
  });
});
