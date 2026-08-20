import { supabase } from './supabase';

export type ContentType = 'book' | 'video' | 'article' | 'course';
export type ContentStatus = 'مسودة' | 'منشور' | 'مؤرشف';

export interface ContentData {
  title: string;
  content_type: ContentType;
  description?: string;
  image_url?: string;
  file_url?: string;
  author_id?: string;
  status?: ContentStatus;
}

/**
 * إضافة محتوى جديد
 */
export async function addContent(contentData: ContentData) {
  try {
    // الحصول على المستخدم الحالي
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    // إضافة المحتوى
    const { data, error } = await supabase
      .from('content')
      .insert({
        ...contentData,
        author_id: user.id,
        status: contentData.status || 'منشور',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // إرسال إشعار لجميع المستخدمين
    if (data) {
      await createNotificationForAll({
        title: 'محتوى جديد متاح',
        message: `تم إضافة محتوى جديد: ${contentData.title}`,
        type: 'new_content',
        related_id: data.id,
      });
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error adding content:', error);
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
    console.log('🔔 بدء إرسال إشعار:', notification.title);

    // جلب جميع المستخدمين
    const { data: users, error: usersError } = await supabase.from('users').select('id');

    if (usersError) {
      console.error('❌ خطأ في جلب المستخدمين:', usersError);
      throw usersError;
    }

    console.log(`✅ تم جلب ${users?.length || 0} مستخدم`);

    // إنشاء إشعار لكل مستخدم
    const notifications =
      users?.map((user) => ({
        user_id: user.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        related_id: notification.related_id,
        is_read: false,
        created_at: new Date().toISOString(),
      })) || [];

    console.log(`📨 سيتم إرسال ${notifications.length} إشعار`);

    if (notifications.length > 0) {
      const { data: insertedData, error: notifError } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();

      if (notifError) {
        console.error('❌ خطأ في إرسال الإشعارات:', notifError);
      } else {
        console.log(`✅ تم إرسال ${insertedData?.length || 0} إشعار بنجاح!`);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('❌ Create notification error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * الحصول على جميع المحتويات المنشورة
 */
export async function getPublishedContent() {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('status', 'منشور')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching content:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * الحصول على محتوى معين
 */
export async function getContent(id: string) {
  try {
    const { data, error } = await supabase.from('content').select('*').eq('id', id).single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching content:', error);
    return { success: false, error: error.message };
  }
}

/**
 * تحديث محتوى
 */
export async function updateContent(id: string, contentData: Partial<ContentData>) {
  try {
    const { data, error } = await supabase
      .from('content')
      .update({
        ...contentData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating content:', error);
    return { success: false, error: error.message };
  }
}

/**
 * حذف محتوى
 */
export async function deleteContent(id: string) {
  try {
    const { error } = await supabase.from('content').delete().eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting content:', error);
    return { success: false, error: error.message };
  }
}

/**
 * الحصول على محتويات الكاتب الحالي
 */
export async function getMyContent() {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching my content:', error);
    return { success: false, error: error.message, data: [] };
  }
}
