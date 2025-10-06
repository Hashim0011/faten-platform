import { supabase } from './supabase';

export type NotificationType = 'new_content' | 'new_discussion' | 'new_message' | 'new_event' | 'system';

export interface NotificationData {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * إنشاء إشعار جديد
 */
export async function createNotification(notificationData: NotificationData) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notificationData,
        is_read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * إنشاء إشعار لجميع المستخدمين
 */
export async function createNotificationForAll(
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) {
  try {
    // الحصول على جميع المستخدمين
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id');

    if (usersError) throw usersError;

    // إنشاء إشعارات لجميع المستخدمين
    const notifications = users.map(user => ({
      user_id: user.id,
      type,
      title,
      message,
      link,
      is_read: false,
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error creating notifications for all:', error);
    return { success: false, error: error.message };
  }
}

/**
 * الحصول على إشعارات المستخدم الحالي
 */
export async function getMyNotifications() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * عدد الإشعارات غير المقروءة
 */
export async function getUnreadCount() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: true, count: 0 };
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) throw error;

    return { success: true, count: count || 0 };
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    return { success: false, error: error.message, count: 0 };
  }
}

/**
 * تحديد إشعار كمقروء
 */
export async function markAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
}

/**
 * تحديد جميع الإشعارات كمقروءة
 */
export async function markAllAsRead() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error marking all as read:', error);
    return { success: false, error: error.message };
  }
}

/**
 * حذف إشعار
 */
export async function deleteNotification(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return { success: false, error: error.message };
  }
}
