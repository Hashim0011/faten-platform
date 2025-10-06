import { supabase } from './supabase';
import type { UserRole } from './supabase';

/**
 * تسجيل مستخدم جديد
 */
export async function registerUser(
  email: string,
  password: string,
  fullName: string,
  phone?: string
) {
  try {
    // 1. إنشاء المستخدم في Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || '',
          role: 'user' as UserRole,
        },
        emailRedirectTo: window.location.origin + '/dashboard',
      },
    });

    if (authError) throw authError;

    // 2. إضافة بيانات المستخدم في جدول users
    if (authData.user) {
      const { error: dbError } = await supabase.from('users').insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        phone: phone || null,
        role: 'user' as UserRole,
      });

      if (dbError) throw dbError;
    }

    return { success: true, user: authData.user };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * تسجيل دخول المستخدم العادي
 */
export async function loginUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // التحقق من أن الدور هو "user"
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (userError) throw userError;

    if (userData.role !== 'user') {
      throw new Error('هذا الحساب ليس حساب مستخدم عادي');
    }

    return { success: true, user: data.user };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * تسجيل دخول الخبير
 */
export async function loginExpert(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // التحقق من أن الدور هو "expert"
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (userError) throw userError;

    if (userData.role !== 'expert') {
      throw new Error('هذا الحساب ليس حساب خبير');
    }

    return { success: true, user: data.user };
  } catch (error: any) {
    console.error('Expert login error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * تسجيل دخول المدير
 */
export async function loginAdmin(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // التحقق من أن الدور هو "admin"
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (userError) throw userError;

    if (userData.role !== 'admin') {
      throw new Error('هذا الحساب ليس حساب مدير');
    }

    return { success: true, user: data.user };
  } catch (error: any) {
    console.error('Admin login error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * تسجيل الخروج
 */
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * الحصول على المستخدم الحالي
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) throw error;
    if (!user) return null;

    // الحصول على بيانات المستخدم من الجدول
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;

    return userData;
  } catch (error: any) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * الحصول على route اللوحة حسب الدور
 */
export function getDashboardRoute(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin-dashboard';
    case 'expert':
      return '/expert-dashboard';
    case 'user':
    default:
      return '/dashboard';
  }
}
