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
        updated_at: new Date().toISOString()
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
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;

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
        updated_at: new Date().toISOString()
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
