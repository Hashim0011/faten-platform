import { expect, test } from '@playwright/test';

/**
 * اختبارات التنقّل — رحلة المستخدم عبر الأدوار الثلاثة.
 * تتحقق أيضاً من عمل توجيه SPA (public/_redirects على Netlify).
 */
test.describe('التنقّل بين الأدوار', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('تُعرض بطاقات الأدوار الثلاثة', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'مستخدم' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'خبير' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'مدير' })).toBeVisible();
  });

  test('بطاقة "مستخدم" تفتح صفحة إنشاء الحساب', async ({ page }) => {
    await page.getByRole('heading', { name: 'مستخدم' }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole('heading', { name: 'إنشاء حساب مستخدم' })).toBeVisible();
  });

  test('بطاقة "خبير" تفتح دخول الخبراء', async ({ page }) => {
    await page.getByRole('heading', { name: 'خبير' }).click();
    await expect(page).toHaveURL(/\/expert-login$/);
  });

  test('بطاقة "مدير" تفتح دخول الإدارة', async ({ page }) => {
    await page.getByRole('heading', { name: 'مدير' }).click();
    await expect(page).toHaveURL(/\/admin-login$/);
  });

  test('التوجيه المباشر لمسار داخلي يعمل (SPA fallback)', async ({ page }) => {
    // هذا يفشل لو كان public/_redirects مفقوداً على Netlify
    const response = await page.goto('/login');
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('#root')).not.toBeEmpty();
  });
});
