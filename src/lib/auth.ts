import { supabase } from './supabase'

export interface SignUpData {
  email: string
  password: string
  fullName: string
  phone?: string
  role: 'parent' | 'teacher' | 'student' | 'other'
}

export interface SignInData {
  email: string
  password: string
}

// تسجيل مستخدم جديد
export async function signUp(userData: SignUpData) {
  try {
    // إنشاء حساب في Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.fullName,
          phone: userData.phone,
          role: userData.role
        }
      }
    })

    if (authError) throw authError

    // إضافة المستخدم إلى جدول users
    if (authData.user) {
      const { error: dbError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: userData.email,
            full_name: userData.fullName,
            phone: userData.phone,
            role: userData.role,
            status: 'active'
          }
        ])

      if (dbError) {
        console.error('خطأ في إضافة المستخدم لقاعدة البيانات:', dbError)
        throw dbError
      }
    }

    return { user: authData.user, session: authData.session }
  } catch (error) {
    console.error('خطأ في التسجيل:', error)
    throw error
  }
}

// تسجيل الدخول
export async function signIn(credentials: SignInData) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })

    if (error) throw error

    return { user: data.user, session: data.session }
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error)
    throw error
  }
}

// تسجيل الخروج
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('خطأ في تسجيل الخروج:', error)
    throw error
  }
}

// الحصول على المستخدم الحالي
export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // الحصول على بيانات المستخدم من قاعدة البيانات
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('خطأ في الحصول على بيانات المستخدم:', error)
        return null
      }

      return userData
    }

    return null
  } catch (error) {
    console.error('خطأ في الحصول على المستخدم الحالي:', error)
    return null
  }
}

// التحقق من دور المستخدم
export async function getUserRole(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role, email')
      .eq('id', userId)
      .single()

    if (error) throw error

    // التحقق من الإدارة
    if (data.email === 'admin@faten.com') {
      return 'admin'
    }

    // التحقق من الخبراء
    const { data: expertData } = await supabase
      .from('experts')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (expertData) {
      return 'expert'
    }

    return data.role
  } catch (error) {
    console.error('خطأ في التحقق من دور المستخدم:', error)
    return 'student'
  }
}