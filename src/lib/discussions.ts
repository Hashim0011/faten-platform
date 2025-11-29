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
 * الحصول على جميع النقاشات - نسخة محسّنة للأداء
 */
export async function getAllDiscussions() {
  try {
    console.log('⚡ جلب النقاشات بطريقة محسّنة...');
    const startTime = Date.now();

    // جلب كل النقاشات
    const { data: discussions, error: discussionsError } = await supabase
      .from('discussions')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('📊 نتيجة جلب النقاشات:', { discussions, error: discussionsError });

    if (discussionsError) {
      console.error('❌ خطأ في جلب النقاشات:', discussionsError);
      throw discussionsError;
    }

    if (!discussions || discussions.length === 0) {
      console.log('✅ لا توجد نقاشات');
      return { success: true, data: [] };
    }

    // جلب جميع المنشئين دفعة واحدة
    const creatorIds = [...new Set(discussions.map(d => d.created_by))];
    const { data: creators } = await supabase
      .from('users')
      .select('id, full_name, role')
      .in('id', creatorIds);

    const creatorsMap = new Map(creators?.map(c => [c.id, c]) || []);

    // جلب كل الرسائل لجميع النقاشات دفعة واحدة
    const discussionIds = discussions.map(d => d.id);
    const { data: allMessages } = await supabase
      .from('messages')
      .select('*')
      .in('discussion_id', discussionIds)
      .order('created_at', { ascending: true });

    // جلب جميع المرسلين دفعة واحدة
    const senderIds = [...new Set(allMessages?.map(m => m.sender_id) || [])];
    const { data: senders } = await supabase
      .from('users')
      .select('id, full_name, email, role')
      .in('id', senderIds);

    const sendersMap = new Map(senders?.map(s => [s.id, s]) || []);

    // تجميع الرسائل حسب النقاش
    const messagesByDiscussion: Record<string, any[]> = {};
    allMessages?.forEach(message => {
      if (!messagesByDiscussion[message.discussion_id]) {
        messagesByDiscussion[message.discussion_id] = [];
      }
      messagesByDiscussion[message.discussion_id].push({
        ...message,
        sender: sendersMap.get(message.sender_id) || { full_name: 'مستخدم محذوف', role: 'user' }
      });
    });

    // دمج البيانات
    const discussionsWithDetails = discussions.map(discussion => ({
      ...discussion,
      creator: creatorsMap.get(discussion.created_by) || { full_name: 'مستخدم محذوف', role: 'user' },
      messages: messagesByDiscussion[discussion.id] || [],
      messageCount: (messagesByDiscussion[discussion.id] || []).length
    }));

    const endTime = Date.now();
    console.log(`✅ تم جلب ${discussions.length} نقاش في ${endTime - startTime}ms`);

    return { success: true, data: discussionsWithDetails };
  } catch (error: any) {
    console.error('💥 Error fetching discussions:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * الحصول على نقاش معين مع رسائله - نسخة محسّنة
 */
export async function getDiscussion(id: string) {
  try {
    console.log('⚡ جلب النقاش:', id);
    const startTime = Date.now();

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

    // جلب المرسلين دفعة واحدة
    const senderIds = [...new Set(messages?.map(m => m.sender_id) || [])];
    const { data: senders } = await supabase
      .from('users')
      .select('id, full_name, email, role')
      .in('id', senderIds);

    const sendersMap = new Map(senders?.map(s => [s.id, s]) || []);

    // إضافة بيانات المرسل لكل رسالة
    const messagesWithSender = messages?.map(message => ({
      ...message,
      sender: sendersMap.get(message.sender_id) || { full_name: 'مستخدم محذوف', role: 'user' }
    })) || [];

    const discussionWithDetails = {
      ...discussion,
      creator: creator || { full_name: 'مستخدم محذوف', role: 'user' },
      messages: messagesWithSender
    };

    const endTime = Date.now();
    console.log(`✅ تم جلب النقاش في ${endTime - startTime}ms`);

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
    console.log('🔧 محاولة حذف الرسالة من قاعدة البيانات:', messageId);

    const { data, error, count } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .select();

    console.log('📋 نتيجة عملية الحذف:', { data, error, count });

    if (error) {
      console.error('❌ خطأ في الحذف:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ لم يتم حذف أي رسالة - قد تكون الرسالة غير موجودة أو لا توجد صلاحيات');
      return { success: false, error: 'لم يتم العثور على الرسالة أو ليس لديك صلاحية لحذفها' };
    }

    console.log('✅ تم حذف الرسالة بنجاح من قاعدة البيانات');
    return { success: true };
  } catch (error: any) {
    console.error('💥 Error deleting message:', error);
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
