import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeUser } from '../helpers/supabaseMock';

const mock = await vi.hoisted(async () => {
  const { createSupabaseMock } = await import('../helpers/supabaseMock');
  return createSupabaseMock();
});

vi.mock('../../src/lib/supabase', () => ({ supabase: mock.client }));

import {
  addContent,
  deleteContent,
  getContent,
  getMyContent,
  getPublishedContent,
  updateContent,
} from '../../src/lib/content';

beforeEach(() => mock.reset());

const signedIn = (id = 'author-1') =>
  mock.auth.getUser.mockResolvedValueOnce({ data: { user: fakeUser({ id }) }, error: null });

const signedOut = () =>
  mock.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

describe('addContent — إضافة محتوى تعليمي', () => {
  it('ينجح ويسند المحتوى إلى المؤلف الحالي', async () => {
    signedIn('author-9');
    mock.queue(
      { data: { id: 'content-1', title: 'كتاب' }, error: null }, // insert
      { data: [{ id: 'u1' }], error: null }, // جلب المستخدمين للإشعار
      { data: [{ id: 'n1' }], error: null } // إدراج الإشعارات
    );

    const result = await addContent({ title: 'كتاب', content_type: 'book' });

    expect(result.success).toBe(true);
    const insert = mock.calls.find((c) => c.method === 'insert');
    expect(insert?.args[0]).toMatchObject({ title: 'كتاب', author_id: 'author-9' });
  });

  it('🔒 يرفض الإضافة بلا تسجيل دخول', async () => {
    signedOut();

    const result = await addContent({ title: 'كتاب', content_type: 'book' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('يجب تسجيل الدخول');
  });

  it("يضبط الحالة الافتراضية 'منشور' عند عدم تحديدها", async () => {
    signedIn();
    mock.queue({ data: { id: 'c1' }, error: null }, { data: [], error: null });

    await addContent({ title: 'مقال', content_type: 'article' });

    const insert = mock.calls.find((c) => c.method === 'insert');
    expect(insert?.args[0]).toMatchObject({ status: 'منشور' });
  });

  it('يحترم الحالة الصريحة عند تمريرها', async () => {
    signedIn();
    mock.queue({ data: { id: 'c1' }, error: null }, { data: [], error: null });

    await addContent({ title: 'مسودة', content_type: 'article', status: 'مسودة' });

    const insert = mock.calls.find((c) => c.method === 'insert');
    expect(insert?.args[0]).toMatchObject({ status: 'مسودة' });
  });

  it('يُشعر جميع المستخدمين بالمحتوى الجديد', async () => {
    signedIn();
    mock.queue(
      { data: { id: 'c-77', title: 'دورة' }, error: null },
      { data: [{ id: 'u1' }, { id: 'u2' }, { id: 'u3' }], error: null },
      { data: [{}, {}, {}], error: null }
    );

    await addContent({ title: 'دورة', content_type: 'course' });

    // آخر insert هو إدراج الإشعارات — إشعار لكل مستخدم
    const inserts = mock.calls.filter((c) => c.method === 'insert');
    // ملاحظة: Array.at يتطلب lib ES2022؛ المشروع على ES2020
    const notifications = inserts[inserts.length - 1]?.args[0] as unknown[];
    expect(notifications).toHaveLength(3);
    expect(notifications[0]).toMatchObject({
      user_id: 'u1',
      type: 'new_content',
      related_id: 'c-77',
      is_read: false,
    });
  });

  it('ينجح رغم فشل إرسال الإشعارات — الإشعار ثانوي لا يُسقط العملية', async () => {
    signedIn();
    mock.queue(
      { data: { id: 'c1', title: 'كتاب' }, error: null },
      { data: null, error: new Error('notifications table down') }
    );

    expect((await addContent({ title: 'كتاب', content_type: 'book' })).success).toBe(true);
  });

  it('يفشل عند فشل إدراج المحتوى نفسه', async () => {
    signedIn();
    mock.queue({ data: null, error: new Error('constraint violation') });

    const result = await addContent({ title: 'كتاب', content_type: 'book' });

    expect(result.success).toBe(false);
    expect(result.error).toBe('constraint violation');
  });
});

describe('getPublishedContent — المحتوى المنشور', () => {
  it('يعيد المحتوى المنشور فقط، مرتّباً بالأحدث', async () => {
    mock.queue({ data: [{ id: 'c1' }, { id: 'c2' }], error: null });

    const result = await getPublishedContent();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    // 🔒 بدون هذا الشرط تظهر المسودات والمؤرشفات للمستخدمين
    expect(mock.calls).toContainEqual({ method: 'eq', args: ['status', 'منشور'] });
    expect(mock.calls).toContainEqual({
      method: 'order',
      args: ['created_at', { ascending: false }],
    });
  });

  it('يعيد مصفوفة فارغة عند الخطأ — الواجهة لا تنهار', async () => {
    mock.queue({ data: null, error: new Error('db down') });

    expect(await getPublishedContent()).toMatchObject({ success: false, data: [] });
  });
});

describe('getContent — محتوى واحد', () => {
  it('يعيد المحتوى المطلوب', async () => {
    mock.queue({ data: { id: 'c1', title: 'كتاب' }, error: null });

    expect(await getContent('c1')).toMatchObject({ success: true });
    expect(mock.calls).toContainEqual({ method: 'eq', args: ['id', 'c1'] });
  });

  it('يفشل بلطف عند عدم وجود المحتوى', async () => {
    mock.queue({ data: null, error: new Error('No rows found') });

    expect((await getContent('missing')).success).toBe(false);
  });
});

describe('updateContent — تحديث محتوى', () => {
  it('يحدّث الحقول ويضبط updated_at', async () => {
    mock.queue({ data: { id: 'c1', title: 'جديد' }, error: null });

    const result = await updateContent('c1', { title: 'جديد' });

    expect(result.success).toBe(true);
    const update = mock.calls.find((c) => c.method === 'update');
    expect(update?.args[0]).toMatchObject({ title: 'جديد' });
    expect(update?.args[0]).toHaveProperty('updated_at');
  });

  it('يستهدف السجل المطلوب فقط', async () => {
    mock.queue({ data: { id: 'c5' }, error: null });

    await updateContent('c5', { description: 'وصف' });

    expect(mock.calls).toContainEqual({ method: 'eq', args: ['id', 'c5'] });
  });

  it('يعيد الخطأ عند فشل التحديث', async () => {
    mock.queue({ data: null, error: new Error('permission denied') });

    expect((await updateContent('c1', { title: 'x' })).success).toBe(false);
  });
});

describe('deleteContent — حذف محتوى', () => {
  it('يحذف بالمعرّف المحدّد', async () => {
    mock.queue({ data: null, error: null });

    expect((await deleteContent('c1')).success).toBe(true);
    expect(mock.calls).toContainEqual({ method: 'eq', args: ['id', 'c1'] });
  });

  it('يعيد الخطأ عند فشل الحذف', async () => {
    mock.queue({ data: null, error: new Error('foreign key constraint') });

    expect((await deleteContent('c1')).success).toBe(false);
  });
});

describe('getMyContent — محتوى المؤلف الحالي', () => {
  it('يعيد محتوى المؤلف الحالي فقط', async () => {
    signedIn('author-3');
    mock.queue({ data: [{ id: 'c1' }], error: null });

    const result = await getMyContent();

    expect(result.success).toBe(true);
    // 🔒 بدون هذا الشرط يرى كل خبير محتوى الآخرين
    expect(mock.calls).toContainEqual({ method: 'eq', args: ['author_id', 'author-3'] });
  });

  it('🔒 يرفض بلا تسجيل دخول ويعيد مصفوفة فارغة', async () => {
    signedOut();

    expect(await getMyContent()).toMatchObject({ success: false, data: [] });
  });
});
