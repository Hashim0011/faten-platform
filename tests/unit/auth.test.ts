import { describe, expect, it } from 'vitest';
import { getDashboardRoute } from '../../src/lib/auth';

describe('getDashboardRoute — توجيه المستخدم حسب دوره', () => {
  it('يوجّه المدير إلى لوحة الإدارة', () => {
    expect(getDashboardRoute('admin')).toBe('/admin-dashboard');
  });

  it('يوجّه الخبير إلى لوحة الخبراء', () => {
    expect(getDashboardRoute('expert')).toBe('/expert-dashboard');
  });

  it('يوجّه المستخدم العادي إلى اللوحة الرئيسية', () => {
    expect(getDashboardRoute('user')).toBe('/dashboard');
  });

  // اختبار أمني: دور غير معروف يجب ألّا يمنح صلاحيات مرتفعة
  it('يعيد أقل صلاحية عند دور غير معروف (fail-safe)', () => {
    // @ts-expect-error اختبار متعمّد لقيمة خارج النوع
    expect(getDashboardRoute('super-hacker')).toBe('/dashboard');
    // @ts-expect-error اختبار متعمّد لقيمة فارغة
    expect(getDashboardRoute(undefined)).toBe('/dashboard');
  });
});
