import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeUser } from '../helpers/supabaseMock';

const mock = await vi.hoisted(async () => {
  const { createSupabaseMock } = await import('../helpers/supabaseMock');
  return createSupabaseMock();
});

vi.mock('../../src/lib/supabase', () => ({ supabase: mock.client }));

import {
  getAllContentLikes,
  getContentLikesCount,
  getUserLikesStatus,
  isContentLiked,
  likeContent,
  unlikeContent,
} from '../../src/lib/likes';

beforeEach(() => mock.reset());

const signedIn = (id = 'user-1') =>
  mock.auth.getUser.mockResolvedValueOnce({ data: { user: fakeUser({ id }) }, error: null });

const signedOut = () =>
  mock.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

describe('likeContent — إضافة إعجاب', () => {
  it('ينجح للمستخدم المسجّل', async () => {
    signedIn();
    mock.queue({ data: { id: 'like-1' }, error: null });

    expect((await likeContent('content-1')).success).toBe(true);
  });

  it('يربط الإعجاب بالمستخدم والمحتوى الصحيحين', async () => {
    signedIn('user-42');
    mock.queue({ data: { id: 'like-2' }, error: null });

    await likeContent('content-9');

    const insert = mock.calls.find((c) => c.method === 'insert');
    expect(insert?.args[0]).toMatchObject({ user_id: 'user-42', content_id: 'content-9' });
  });

  it('🔒 يرفض الإعجاب بلا تسجيل دخول', async () => {
    signedOut();

    const result = await likeContent('content-1');

    expect(result.success).toBe(false);
    expect(result.error).toContain('يجب تسجيل الدخول');
  });

  it('يعيد الخطأ عند الإعجاب المكرر (قيد فريد في القاعدة)', async () => {
    signedIn();
    mock.queue({ data: null, error: new Error('duplicate key value') });

    const result = await likeContent('content-1');

    expect(result.success).toBe(false);
    expect(result.error).toContain('duplicate key');
  });
});

describe('unlikeContent — إزالة الإعجاب', () => {
  it('يحذف إعجاب هذا المستخدم على هذا المحتوى فقط', async () => {
    signedIn('user-7');
    mock.queue({ data: null, error: null });

    const result = await unlikeContent('content-3');

    expect(result.success).toBe(true);
    // ⚠️ الشرطان معاً ضروريان: بدون user_id يحذف إعجابات الجميع
    expect(mock.calls).toContainEqual({ method: 'eq', args: ['user_id', 'user-7'] });
    expect(mock.calls).toContainEqual({ method: 'eq', args: ['content_id', 'content-3'] });
  });

  it('🔒 يرفض الإزالة بلا تسجيل دخول', async () => {
    signedOut();
    expect((await unlikeContent('content-1')).success).toBe(false);
  });
});

describe('isContentLiked — هل أعجب المستخدم بالمحتوى؟', () => {
  it('يعيد true عند وجود سجل', async () => {
    signedIn();
    mock.queue({ data: { id: 'like-1' }, error: null });

    expect(await isContentLiked('content-1')).toMatchObject({ success: true, isLiked: true });
  });

  it('يعيد false عند عدم وجود سجل', async () => {
    signedIn();
    mock.queue({ data: null, error: null });

    expect(await isContentLiked('content-1')).toMatchObject({ isLiked: false });
  });

  it('يعيد false للزائر بلا خطأ — الزائر يتصفّح بحرية', async () => {
    signedOut();

    expect(await isContentLiked('content-1')).toEqual({ success: true, isLiked: false });
  });

  it('يعيد false عند فشل الاستعلام بدل الانهيار', async () => {
    signedIn();
    mock.queue({ data: null, error: new Error('db down') });

    expect(await isContentLiked('content-1')).toMatchObject({ success: false, isLiked: false });
  });
});

describe('getContentLikesCount — عدد الإعجابات', () => {
  it('يعيد العدد الفعلي', async () => {
    mock.queue({ data: null, error: null, count: 42 });
    expect(await getContentLikesCount('content-1')).toMatchObject({ success: true, count: 42 });
  });

  it('يعيد صفراً عندما يكون العدد null', async () => {
    mock.queue({ data: null, error: null, count: null });
    expect(await getContentLikesCount('content-1')).toMatchObject({ count: 0 });
  });

  it('يعيد صفراً عند الخطأ — الواجهة لا تنهار على عدّاد', async () => {
    mock.queue({ data: null, error: new Error('timeout') });
    expect(await getContentLikesCount('content-1')).toMatchObject({ success: false, count: 0 });
  });
});

describe('getAllContentLikes — عدّادات دفعة واحدة', () => {
  it('يحوّل الصفوف إلى خريطة id → count', async () => {
    mock.queue({
      data: [
        { id: 'c1', likes_count: 5 },
        { id: 'c2', likes_count: 0 },
        { id: 'c3', likes_count: null },
      ],
      error: null,
    });

    const result = await getAllContentLikes(['c1', 'c2', 'c3']);

    expect(result.likesCount).toEqual({ c1: 5, c2: 0, c3: 0 });
  });

  it('يستعلم بدفعة واحدة عبر in() بدل استعلام لكل عنصر (N+1)', async () => {
    mock.queue({ data: [], error: null });

    await getAllContentLikes(['c1', 'c2', 'c3']);

    expect(mock.calls).toContainEqual({ method: 'in', args: ['id', ['c1', 'c2', 'c3']] });
    expect(mock.calls.filter((c) => c.method === 'from')).toHaveLength(1);
  });

  it('يعيد خريطة فارغة عند الخطأ', async () => {
    mock.queue({ data: null, error: new Error('boom') });
    expect(await getAllContentLikes(['c1'])).toMatchObject({ success: false, likesCount: {} });
  });
});

describe('getUserLikesStatus — إعجابات المستخدم على مجموعة محتويات', () => {
  it('يعيد قائمة المعرّفات التي أعجب بها', async () => {
    signedIn('user-5');
    mock.queue({ data: [{ content_id: 'c1' }, { content_id: 'c3' }], error: null });

    expect(await getUserLikesStatus(['c1', 'c2', 'c3'])).toMatchObject({
      success: true,
      likedContent: ['c1', 'c3'],
    });
  });

  it('يعيد قائمة فارغة للزائر', async () => {
    signedOut();
    expect(await getUserLikesStatus(['c1'])).toEqual({ success: true, likedContent: [] });
  });

  it('يعيد قائمة فارغة عند الخطأ', async () => {
    signedIn();
    mock.queue({ data: null, error: new Error('boom') });

    expect(await getUserLikesStatus(['c1'])).toMatchObject({
      success: false,
      likedContent: [],
    });
  });
});
