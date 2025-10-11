import { supabase } from './supabase';

/**
 * إنشاء نقاش جديد
 */
export async function createDiscussion(title: string, description?: string) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    const { data, error } = await supabase
      .from('discussions')
      .insert({
        title,
        description,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // إرسال إشعار لجميع المستخدمين
    if (data) {
      await createNotificationForAll({
        title: 'نقاش جديد',
        message: `تم فتح نقاش جديد: ${title}`,
        type: 'new_discussion',
        related_id: data.id,
      });
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating discussion:', error);
    return { success: false, error: error.message };
  }
}

/**
 * إنشاء إشعار لجميع المستخدمين
 */
async function createNotificationForAll(notification: {
  title: string;
  message: string;
  type: string;
  related_id?: string;
}) {
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id');

    if (usersError) throw usersError;

    const notifications = users?.map(user => ({
      user_id: user.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      related_id: notification.related_id,
      is_read: false,
      created_at: new Date().toISOString(),
    })) || [];

    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifError) console.error('Notification error:', notifError);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Create notification error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * الحصول على جميع النقاشات
 */
export async function getAllDiscussions() {
  try {
    // جلب النقاشات مع عدد الرسائل فقط (بدون تفاصيل الرسائل)
    const { data: discussions, error: discussionsError } = await supabase
      .from('discussions')
      .select('*')
      .order('created_at', { ascending: false });

    if (discussionsError) throw discussionsError;

    if (!discussions || discussions.length === 0) {
      return { success: true, data: [] };
    }

    // جلب معلومات منشئ كل نقاش
    const discussionsWithDetails = await Promise.all(
      discussions.map(async (discussion) => {
        // جلب معلومات المنشئ
        const { data: creator } = await supabase
          .from('users')
          .select('full_name, role')
          .eq('id', discussion.created_by)
          .single();

        // جلب عدد الرسائل
        const { count: messageCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('discussion_id', discussion.id);

        // جلب الرسائل مع بيانات المرسل
        const { data: messages } = await supabase
          .from('messages')
          .select('*')
          .eq('discussion_id', discussion.id)
          .order('created_at', { ascending: true });

        // إضافة بيانات المرسل لكل رسالة
        let messagesWithSender = [];
        if (messages && messages.length > 0) {
          messagesWithSender = await Promise.all(
            messages.map(async (message) => {
              const { data: sender } = await supabase
                .from('users')
                .select('id, full_name, email, role')
                .eq('id', message.sender_id)
                .single();

              return {
                ...message,
                sender: sender || { full_name: 'مستخدم محذوف', role: 'user' }
              };
            })
          );
        }

        return {
          ...discussion,
          creator: creator || { full_name: 'مستخدم محذوف', role: 'user' },
          messages: messagesWithSender,
          messageCount: messageCount || 0
        };
      })
    );

    return { success: true, data: discussionsWithDetails };
  } catch (error: any) {
    console.error('Error fetching discussions:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * الحصول على نقاش معين مع رسائله
 */
export async function getDiscussion(id: string) {
  try {
    // جلب النقاش
    const { data: discussion, error: discussionError } = await supabase
      .from('discussions')
      .select('*')
      .eq('id', id)
      .single();

    if (discussionError) throw discussionError;

    // جلب معلومات المنشئ
    const { data: creator } = await supabase
      .from('users')
      .select('full_name, role')
      .eq('id', discussion.created_by)
      .single();

    // جلب الرسائل
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('discussion_id', id)
      .order('created_at', { ascending: true });

    // إضافة بيانات المرسل لكل رسالة
    let messagesWithSender = [];
    if (messages && messages.length > 0) {
      messagesWithSender = await Promise.all(
        messages.map(async (message) => {
          const { data: sender } = await supabase
            .from('users')
            .select('id, full_name, email, role')
            .eq('id', message.sender_id)
            .single();

          return {
            ...message,
            sender: sender || { full_name: 'مستخدم محذوف', role: 'user' }
          };
        })
      );
    }

    const discussionWithDetails = {
      ...discussion,
      creator: creator || { full_name: 'مستخدم محذوف', role: 'user' },
      messages: messagesWithSender
    };

    return { success: true, data: discussionWithDetails };
  } catch (error: any) {
    console.error('Error fetching discussion:', error);
    return { success: false, error: error.message };
  }
}

/**
 * إضافة رسالة لنقاش
 */
export async function addMessage(discussionId: string, content: string) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    // إضافة الرسالة
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        discussion_id: discussionId,
        sender_id: user.id,
        content,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // جلب بيانات المرسل
    const { data: sender } = await supabase
      .from('users')
      .select('id, full_name, email, role')
      .eq('id', user.id)
      .single();

    const messageWithSender = {
      ...message,
      sender: sender || { full_name: 'مستخدم', role: 'user' }
    };

    // تحديث وقت آخر تعديل للنقاش
    await supabase
      .from('discussions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', discussionId);

    return { success: true, data: messageWithSender };
  } catch (error: any) {
    console.error('Error adding message:', error);
    return { success: false, error: error.message };
  }
}

/**
 * حذف رسالة
 */
export async function deleteMessage(messageId: string) {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting message:', error);
    return { success: false, error: error.message };
  }
}

/**
 * حذف نقاش (للخبراء والأدمن فقط)
 */
export async function deleteDiscussion(discussionId: string) {
  try {
    // حذف جميع الرسائل أولاً
    await supabase
      .from('messages')
      .delete()
      .eq('discussion_id', discussionId);

    // حذف النقاش
    const { error } = await supabase
      .from('discussions')
      .delete()
      .eq('id', discussionId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting discussion:', error);
    return { success: false, error: error.message };
  }
}
