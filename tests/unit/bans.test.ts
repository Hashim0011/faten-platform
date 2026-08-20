import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeUser } from '../helpers/supabaseMock';

const mock = await vi.hoisted(async () => {
  const { createSupabaseMock } = await import('../helpers/supabaseMock');
  return createSupabaseMock();
});

vi.mock('../../src/lib/supabase', () => ({ supabase: mock.client }));

import {
  banUserFromDiscussion,
  getBannedUsersInDiscussion,
  isUserBanned,
  unbanUserFromDiscussion,
} from '../../src/lib/bans';

beforeEach(() => mock.reset());

/** يهيّئ مستخدماً مسجّلاً بدور محدّد */
const asRole = (role: string, id = 'moderator-1') => {
  mock.auth.getUser.mockResolvedValueOnce({ data: { user: fakeUser({ id }) }, error: null });
  mock.queue({ data: { role }, error: null });
};

// ═══════════════════════════════════════════════════════════
//  الحظر — أخطر عملية إشراف: تمنع مستخدماً من المشاركة.
//  التحقق من الصلاحية هنا هو الحد الأمني الأهم في الملف.
// ═══════════════════════════════════════════════════════════
describe('banUserFromDiscussion — حظر مستخدم من نقاش', () => {
  it('يسمح للخبير بالحظر', async () => {
    asRole('expert');
    mock.queue({ data: { id: 'ban-1' }, error: null });

    const result = await banUserFromDiscussion('bad-user', 'disc-1', 'إساءة');

    expect(result.success).toBe(true);
  });

  it('يسمح للمدير بالحظر', async () => {
    asRole('admin');
    mock.queue({ data: { id: 'ban-2' }, error: null });

    expect((await banUserFromDiscussion('bad-user', 'disc-1')).success).toBe(true);
  });

  it('🔒 يمنع المستخدم العادي من الحظر', async () => {
    asRole('user');

    const result = await banUserFromDiscussion('victim', 'disc-1');

    expect(result.success).toBe(false);
    expect(result.error).toContain('ليس لديك صلاحية');
  });

  it('🔒 يمنع الحظر بلا تسجيل دخول', async () => {
    mock.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const result = await banUserFromDiscussion('victim', 'disc-1');

    expect(result.success).toBe(false);
    expect(result.error).toContain('يجب تسجيل الدخول');
  });

  it('🔒 يمنع الحظر عندما يتعذّر قراءة دور المستخدم (fail-closed)', async () => {
    mock.auth.getUser.mockResolvedValueOnce({
      data: { user: fakeUser() },
      error: null,
    });
    mock.queue({ data: null, error: null });

    expect((await banUserFromDiscussion('victim', 'disc-1')).success).toBe(false);
  });

  it('يسجّل من نفّذ الحظر ولماذا (أثر تدقيق)', async () => {
    asRole('admin', 'admin-77');
    mock.queue({ data: { id: 'ban-3' }, error: null });

    await banUserFromDiscussion('bad-user', 'disc-9', 'تكرار الإساءة');

    const insert = mock.calls.find((c) => c.method === 'insert');
    expect(insert?.args[0]).toMatchObject({
      user_id: 'bad-user',
      discussion_id: 'disc-9',
      banned_by: 'admin-77',
      reason: 'تكرار الإساءة',
    });
  });

  it('يستخدم سبباً افتراضياً عند عدم تحديده', async () => {
    asRole('expert');
    mock.queue({ data: { id: 'ban-4' }, error: null });

    await banUserFromDiscussion('bad-user', 'disc-1');

    const insert = mock.calls.find((c) => c.method === 'insert');
    expect(insert?.args[0]).toMatchObject({ reason: 'مخالفة قواعد النقاش' });
  });

  it('يعيد الخطأ عند فشل كتابة سجل الحظر', async () => {
    asRole('admin');
    mock.queue({ data: null, error: new Error('constraint violation') });

    const result = await banUserFromDiscussion('bad-user', 'disc-1');

    expect(result.success).toBe(false);
    expect(result.error).toBe('constraint violation');
  });
});

describe('unbanUserFromDiscussion — رفع الحظر', () => {
  it('ينجح ويحذف السجل المطابق للمستخدم والنقاش معاً', async () => {
    mock.queue({ data: null, error: null });

    const result = await unbanUserFromDiscussion('u-1', 'disc-1');

    expect(result.success).toBe(true);
    expect(mock.calls).toContainEqual({ method: 'eq', args: ['user_id', 'u-1'] });
    expect(mock.calls).toContainEqual({ method: 'eq', args: ['discussion_id', 'disc-1'] });
  });

  it('يعيد الخطأ عند فشل الحذف', async () => {
    mock.queue({ data: null, error: new Error('row not found') });
    expect((await unbanUserFromDiscussion('u-1', 'disc-1')).success).toBe(false);
  });
});

describe('isUserBanned — التحقق من الحظر', () => {
  it('يعيد isBanned=true عند وجود سجل', async () => {
    mock.queue({ data: { id: 'ban-1', reason: 'إساءة' }, error: null });

    const result = await isUserBanned('u-1', 'disc-1');

    expect(result).toMatchObject({ success: true, isBanned: true });
    expect(result.banData).toMatchObject({ reason: 'إساءة' });
  });

  it('يعيد isBanned=false عند غياب السجل', async () => {
    mock.queue({ data: null, error: null });
    expect(await isUserBanned('u-1', 'disc-1')).toMatchObject({
      success: true,
      isBanned: false,
    });
  });

  it('🔒 يعيد isBanned=false عند الخطأ — لا يمنع مستخدماً بسبب عطل تقني', async () => {
    mock.queue({ data: null, error: new Error('db timeout') });

    const result = await isUserBanned('u-1', 'disc-1');

    expect(result.isBanned).toBe(false);
    expect(result.success).toBe(false);
  });
});

describe('getBannedUsersInDiscussion — قائمة المحظورين', () => {
  it('يعيد القائمة مع بيانات المستخدمين', async () => {
    mock.queue({
      data: [{ id: 'b1', user: { full_name: 'مستخدم' } }],
      error: null,
    });

    const result = await getBannedUsersInDiscussion('disc-1');

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
  });

  it('يعيد مصفوفة فارغة عند الخطأ — لا يعيد undefined', async () => {
    mock.queue({ data: null, error: new Error('boom') });

    const result = await getBannedUsersInDiscussion('disc-1');

    expect(result.success).toBe(false);
    expect(result.data).toEqual([]);
  });
});
