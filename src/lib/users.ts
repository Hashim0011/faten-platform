import { supabase } from './supabase';

export type UserRole = 'admin' | 'expert' | 'user';

export interface UserData {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  phone?: string;
  avatar_url?: string;
}

/**
 * الحصول على جميع المستخدمين
 */
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * الحصول على جميع الخبراء
 */
export async function getAllExperts() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'expert')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching experts:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * الحصول على جميع المستخدمين العاديين
 */
export async function getRegularUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'user')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching regular users:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * تحديث دور المستخدم
 */
export async function updateUserRole(userId: string, newRole: UserRole) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return { success: false, error: error.message };
  }
}

/**
 * حذف مستخدم
 */
export async function deleteUser(userId: string) {
  try {
    console.log('Attempting to delete user with ID:', userId);

    // First, delete user's related data to avoid foreign key constraints
    // Delete user's messages
    const { error: messagesError } = await supabase.from('messages').delete().eq('user_id', userId);

    if (messagesError) {
      console.error('Error deleting user messages:', messagesError);
    }

    // Delete user's discussions
    const { error: discussionsError } = await supabase
      .from('discussions')
      .delete()
      .eq('user_id', userId);

    if (discussionsError) {
      console.error('Error deleting user discussions:', discussionsError);
    }

    // Delete user's likes
    const { error: likesError } = await supabase.from('likes').delete().eq('user_id', userId);

    if (likesError) {
      console.error('Error deleting user likes:', likesError);
    }

    // Delete user's notifications
    const { error: notificationsError } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (notificationsError) {
      console.error('Error deleting user notifications:', notificationsError);
    }

    // Delete user's bans
    const { error: bansError } = await supabase.from('banned_users').delete().eq('user_id', userId);

    if (bansError) {
      console.error('Error deleting user bans:', bansError);
    }

    // Finally, delete the user
    const { error } = await supabase.from('users').delete().eq('id', userId);

    if (error) {
      console.error('Error deleting user from users table:', error);
      throw error;
    }

    console.log('User deleted successfully:', userId);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
}

/**
 * تحديث معلومات المستخدم
 */
export async function updateUser(userId: string, userData: Partial<UserData>) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...userData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating user:', error);
    return { success: false, error: error.message };
  }
}
