import { supabase } from './supabase';

/**
 * حظر مستخدم من نقاش معين
 */
export async function banUserFromDiscussion(userId: string, discussionId: string, reason?: string) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    // التحقق من أن المستخدم الحالي خبير أو مدير
    const { data: currentUserData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (
      !currentUserData ||
      (currentUserData.role !== 'expert' && currentUserData.role !== 'admin')
    ) {
      throw new Error('ليس لديك صلاحية لحظر المستخدمين');
    }

    // إضافة سجل الحظر
    const { data, error } = await supabase
      .from('banned_users')
      .insert({
        user_id: userId,
        discussion_id: discussionId,
        banned_by: user.id,
        reason: reason || 'مخالفة قواعد النقاش',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error banning user:', error);
    return { success: false, error: error.message };
  }
}

/**
 * إلغاء حظر مستخدم من نقاش معين
 */
export async function unbanUserFromDiscussion(userId: string, discussionId: string) {
  try {
    const { error } = await supabase
      .from('banned_users')
      .delete()
      .eq('user_id', userId)
      .eq('discussion_id', discussionId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error unbanning user:', error);
    return { success: false, error: error.message };
  }
}

/**
 * التحقق من حظر مستخدم في نقاش معين
 */
export async function isUserBanned(userId: string, discussionId: string) {
  try {
    const { data, error } = await supabase
      .from('banned_users')
      .select('*')
      .eq('user_id', userId)
      .eq('discussion_id', discussionId)
      .maybeSingle();

    if (error) throw error;

    return { success: true, isBanned: !!data, banData: data };
  } catch (error: any) {
    console.error('Error checking ban status:', error);
    return { success: false, isBanned: false, error: error.message };
  }
}

/**
 * جلب جميع المستخدمين المحظورين في نقاش معين
 */
export async function getBannedUsersInDiscussion(discussionId: string) {
  try {
    const { data, error } = await supabase
      .from('banned_users')
      .select('*, user:users(*)')
      .eq('discussion_id', discussionId);

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error getting banned users:', error);
    return { success: false, error: error.message, data: [] };
  }
}
