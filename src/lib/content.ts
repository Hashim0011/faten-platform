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
    const { data: { user }, error: userError } = await supabase.auth.getUser();

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

    return { success: true, data };
  } catch (error: any) {
    console.error('Error adding content:', error);
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
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('id', id)
      .single();

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
    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', id);

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
    const { data: { user }, error: userError } = await supabase.auth.getUser();

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
