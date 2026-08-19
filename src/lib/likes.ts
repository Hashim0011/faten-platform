import { supabase } from './supabase';

/**
 * إضافة لايك على محتوى
 */
export async function likeContent(contentId: string) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    const { data, error } = await supabase
      .from('likes')
      .insert({
        user_id: user.id,
        content_id: contentId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error liking content:', error);
    return { success: false, error: error.message };
  }
}

/**
 * إزالة لايك من محتوى
 */
export async function unlikeContent(contentId: string) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', user.id)
      .eq('content_id', contentId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error unliking content:', error);
    return { success: false, error: error.message };
  }
}

/**
 * التحقق من لايك المستخدم على محتوى معين
 */
export async function isContentLiked(contentId: string) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: true, isLiked: false };
    }

    const { data, error } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', user.id)
      .eq('content_id', contentId)
      .maybeSingle();

    if (error) throw error;

    return { success: true, isLiked: !!data };
  } catch (error: any) {
    console.error('Error checking like status:', error);
    return { success: false, isLiked: false, error: error.message };
  }
}

/**
 * الحصول على عدد اللايكات لمحتوى معين
 */
export async function getContentLikesCount(contentId: string) {
  try {
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('content_id', contentId);

    if (error) throw error;

    return { success: true, count: count || 0 };
  } catch (error: any) {
    console.error('Error getting likes count:', error);
    return { success: false, count: 0, error: error.message };
  }
}

/**
 * الحصول على جميع اللايكات مع عدد اللايكات لكل محتوى
 * يستخدم likes_count من جدول content مباشرة (أسرع بكثير!)
 */
export async function getAllContentLikes(contentIds: string[]) {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('id, likes_count')
      .in('id', contentIds);

    if (error) throw error;

    // تحويل البيانات إلى object بـ content_id كمفتاح
    const likesCount: { [key: string]: number } = {};
    data?.forEach((content) => {
      likesCount[content.id] = content.likes_count || 0;
    });

    return { success: true, likesCount };
  } catch (error: any) {
    console.error('Error getting all content likes:', error);
    return { success: false, likesCount: {}, error: error.message };
  }
}

/**
 * الحصول على حالة اللايكات لمستخدم على عدة محتويات
 */
export async function getUserLikesStatus(contentIds: string[]) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: true, likedContent: [] };
    }

    const { data, error } = await supabase
      .from('likes')
      .select('content_id')
      .eq('user_id', user.id)
      .in('content_id', contentIds);

    if (error) throw error;

    const likedContent = data?.map((like) => like.content_id) || [];

    return { success: true, likedContent };
  } catch (error: any) {
    console.error('Error getting user likes status:', error);
    return { success: false, likedContent: [], error: error.message };
  }
}
