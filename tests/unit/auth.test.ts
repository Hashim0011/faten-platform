import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeUser } from '../helpers/supabaseMock';

// ⚠️ Vitest يرفع vi.mock إلى أعلى الملف قبل أي تعريف، فلا يمكن أن
//    يشير مصنعه إلى متغيّر عادي (ReferenceError: Cannot access before
//    initialization). الحل الرسمي: vi.hoisted — يُنفَّذ قبل الرفع.
const mock = await vi.hoisted(async () => {
  const { createSupabaseMock } = await import('../helpers/supabaseMock');
  return createSupabaseMock();
});

vi.mock('../../src/lib/supabase', () => ({ supabase: mock.client }));

import {
  getCurrentUser,
  getDashboardRoute,
  loginAdmin,
  loginExpert,
  loginUser,
  logout,
  registerUser,
} from '../../src/lib/auth';

beforeEach(() => mock.reset());

// ═══════════════════════════════════════════════════════════
//  دالة صرفة — بلا تبعيات
// ═══════════════════════════════════════════════════════════
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

  it('يعيد أقل صلاحية عند دور غير معروف (fail-safe)', () => {
    // @ts-expect-error اختبار متعمّد لقيمة خارج النوع
    expect(getDashboardRoute('super-hacker')).toBe('/dashboard');
    // @ts-expect-error اختبار متعمّد لقيمة فارغة
    expect(getDashboardRoute(undefined)).toBe('/dashboard');
  });
});

// ═══════════════════════════════════════════════════════════
//  تسجيل الدخول — الحد الأمني الأهم في التطبيق
//
//  كل دالة دخول تتحقق من الدور بعد المصادقة. اختبار هذه
//  الحدود ضروري: خطأ هنا يعني وصول مستخدم عادي إلى لوحة
//  الإدارة. هذا بالضبط نوع الباق الذي يبرّر وجود الاختبارات.
// ═══════════════════════════════════════════════════════════
describe('loginUser — دخول المستخدم العادي', () => {
  it('ينجح عندما يكون الدور user', async () => {
    mock.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: fakeUser() },
      error: null,
    });
    mock.queue({ data: { role: 'user' }, error: null });

    const result = await loginUser('test@faten.sa', 'pass1234');

    expect(result.success).toBe(true);
    expect(result.user).toMatchObject({ id: 'user-123' });
  });

  it('🔒 يرفض حساب المدير من بوابة المستخدمين', async () => {
    mock.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: fakeUser() },
      error: null,
    });
    mock.queue({ data: { role: 'admin' }, error: null });

    const result = await loginUser('admin@faten.sa', 'pass1234');

    expect(result.success).toBe(false);
    expect(result.error).toContain('ليس حساب مستخدم عادي');
  });

  it('🔒 يرفض حساب الخبير من بوابة المستخدمين', async () => {
    mock.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: fakeUser() },
      error: null,
    });
    mock.queue({ data: { role: 'expert' }, error: null });

    const result = await loginUser('expert@faten.sa', 'pass1234');

    expect(result.success).toBe(false);
  });

  it('يعيد رسالة الخطأ عند فشل المصادقة', async () => {
    mock.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Invalid login credentials'),
    });

    const result = await loginUser('wrong@faten.sa', 'bad');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid login credentials');
  });

  it('يستعلم عن الدور من جدول users بمعرّف المستخدم', async () => {
    mock.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: fakeUser({ id: 'abc-999' }) },
      error: null,
    });
    mock.queue({ data: { role: 'user' }, error: null });

    await loginUser('test@faten.sa', 'pass1234');

    expect(mock.calls).toContainEqual({ method: 'from', args: ['users'] });
    expect(mock.calls).toContainEqual({ method: 'eq', args: ['id', 'abc-999'] });
  });
});

describe('loginExpert — دخول الخبير', () => {
  it('ينجح عندما يكون الدور expert', async () => {
    mock.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: fakeUser() },
      error: null,
    });
    mock.queue({ data: { role: 'expert' }, error: null });

    expect((await loginExpert('e@faten.sa', 'pass1234')).success).toBe(true);
  });

  it('🔒 يرفض المستخدم العادي من بوابة الخبراء', async () => {
    mock.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: fakeUser() },
      error: null,
    });
    mock.queue({ data: { role: 'user' }, error: null });

    const result = await loginExpert('u@faten.sa', 'pass1234');

    expect(result.success).toBe(false);
    expect(result.error).toContain('ليس حساب خبير');
  });
});

describe('loginAdmin — دخول المدير (أعلى صلاحية)', () => {
  it('ينجح عندما يكون الدور admin', async () => {
    mock.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: fakeUser() },
      error: null,
    });
    mock.queue({ data: { role: 'admin' }, error: null });

    expect((await loginAdmin('a@faten.sa', 'pass1234')).success).toBe(true);
  });

  it.each([['user'], ['expert']])(
    '🔒 يرفض الدور %s من بوابة الإدارة (تصعيد صلاحيات)',
    async (role) => {
      mock.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: fakeUser() },
        error: null,
      });
      mock.queue({ data: { role }, error: null });

      const result = await loginAdmin('x@faten.sa', 'pass1234');

      expect(result.success).toBe(false);
      expect(result.error).toContain('ليس حساب مدير');
    }
  );

  it('🔒 يرفض الدخول عند فشل قراءة الدور — لا يفترض النجاح', async () => {
    mock.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: fakeUser() },
      error: null,
    });
    mock.queue({ data: null, error: new Error('permission denied') });

    expect((await loginAdmin('a@faten.sa', 'pass1234')).success).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════
//  التسجيل
// ═══════════════════════════════════════════════════════════
describe('registerUser — إنشاء حساب', () => {
  it('ينشئ المستخدم في المصادقة ثم في جدول users', async () => {
    mock.auth.signUp.mockResolvedValueOnce({
      data: { user: fakeUser({ id: 'new-1' }) },
      error: null,
    });
    mock.queue({ data: null, error: null });

    const result = await registerUser('n@faten.sa', 'pass1234', 'اسم المستخدم', '0500000000');

    expect(result.success).toBe(true);
    expect(mock.auth.signUp).toHaveBeenCalledOnce();
    expect(mock.calls).toContainEqual({ method: 'from', args: ['users'] });
  });

  it('يعيّن الدور user دائماً — لا يمكن طلب دور أعلى عند التسجيل', async () => {
    mock.auth.signUp.mockResolvedValueOnce({
      data: { user: fakeUser({ id: 'new-2' }) },
      error: null,
    });
    mock.queue({ data: null, error: null });

    await registerUser('n@faten.sa', 'pass1234', 'اسم');

    const insert = mock.calls.find((c) => c.method === 'insert');
    expect(insert?.args[0]).toMatchObject({ role: 'user', is_verified: false });
  });

  it('يترك الهاتف فارغاً (null) عند عدم إرساله', async () => {
    mock.auth.signUp.mockResolvedValueOnce({
      data: { user: fakeUser({ id: 'new-3' }) },
      error: null,
    });
    mock.queue({ data: null, error: null });

    await registerUser('n@faten.sa', 'pass1234', 'اسم');

    const insert = mock.calls.find((c) => c.method === 'insert');
    expect(insert?.args[0]).toMatchObject({ phone: null });
  });

  it('يفشل عندما ترفض المصادقة الإنشاء', async () => {
    mock.auth.signUp.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('User already registered'),
    });

    const result = await registerUser('dup@faten.sa', 'pass1234', 'اسم');

    expect(result.success).toBe(false);
    expect(result.error).toBe('User already registered');
  });

  it('يفشل عند فشل الإدراج في قاعدة البيانات', async () => {
    mock.auth.signUp.mockResolvedValueOnce({
      data: { user: fakeUser({ id: 'new-4' }) },
      error: null,
    });
    mock.queue({ data: null, error: new Error('duplicate key') });

    expect((await registerUser('n@faten.sa', 'pass1234', 'اسم')).success).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════
//  الجلسة
// ═══════════════════════════════════════════════════════════
describe('logout — تسجيل الخروج', () => {
  it('ينجح ويستدعي signOut', async () => {
    expect((await logout()).success).toBe(true);
    expect(mock.auth.signOut).toHaveBeenCalledOnce();
  });

  it('يعيد الخطأ عند فشل إنهاء الجلسة', async () => {
    mock.auth.signOut.mockResolvedValueOnce({ error: new Error('network down') });
    const result = await logout();
    expect(result.success).toBe(false);
    expect(result.error).toBe('network down');
  });
});

describe('getCurrentUser — قراءة المستخدم الحالي', () => {
  it('يعيد بيانات المستخدم من جدول users', async () => {
    mock.auth.getUser.mockResolvedValueOnce({
      data: { user: fakeUser({ id: 'cur-1' }) },
      error: null,
    });
    mock.queue({ data: { id: 'cur-1', role: 'expert', full_name: 'خبير' }, error: null });

    expect(await getCurrentUser()).toMatchObject({ id: 'cur-1', role: 'expert' });
  });

  it('يعيد null عند عدم وجود جلسة', async () => {
    mock.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    expect(await getCurrentUser()).toBeNull();
  });

  it('يعيد null بدل الانهيار عند فشل قاعدة البيانات', async () => {
    mock.auth.getUser.mockResolvedValueOnce({
      data: { user: fakeUser() },
      error: null,
    });
    mock.queue({ data: null, error: new Error('table missing') });

    expect(await getCurrentUser()).toBeNull();
  });
});
