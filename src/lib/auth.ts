import { supabase } from './supabase'

export interface SignUpData {
  email: string
  password: string
  fullName: string
  phone?: string
}

export interface SignInData {
  email: string
  password: string
}

// تسجيل مستخدم جديد (للمستخدمين العاديين فقط)
export async function signUp(userData: SignUpData) {
  try {
    // إنشاء حساب في Supabase Auth (دور المستخدم العادي فقط)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          role: 'user', // دائماً مستخدم عادي
          full_name: userData.fullName,
          phone: userData.phone
        }
      }
    })

    if (authError) throw authError

    // سيتم إضافة المستخدم تلقائياً عبر trigger في قاعدة البيانات

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
      const role = await getUserRole(user.id)
      
      let userData = null
      
      // الحصول على بيانات المستخدم حسب دوره
      if (role === 'admin') {
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (!error) userData = { ...data, role: 'admin' }
      } else if (role === 'expert') {
        const { data, error } = await supabase
          .from('experts')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (!error) userData = { ...data, role: 'expert' }
      } else {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (!error) userData = { ...data, role: 'user' }
      }

      if (!userData) {
        console.error('لم يتم العثور على بيانات المستخدم')
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
    // التحقق من الإدارة أولاً
    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (adminData) {
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

    // التحقق من المستخدمين العاديين
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (userData) {
      return 'user'
    }

    // افتراضي
    return 'user'
  } catch (error) {
    console.error('خطأ في التحقق من دور المستخدم:', error)
    return 'user'
  }
}