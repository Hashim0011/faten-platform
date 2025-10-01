import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export type UserRole = 'user' | 'expert' | 'admin'

export interface AuthUser extends User {
  role?: UserRole
}

// Sign up function (only for regular users)
export async function signUp(email: string, password: string, userData: {
  full_name: string
  phone?: string
  role?: 'parent' | 'teacher' | 'student' | 'other'
}) {
  try {
    // Create auth user with metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'user', // Always set to 'user' for signups
          full_name: userData.full_name,
          phone: userData.phone
        }
      }
    })

    if (authError) throw authError

    // If auth user created successfully, create user profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          user_id: authData.user.id,
          email: email,
          full_name: userData.full_name,
          phone: userData.phone,
          role: userData.role || 'student'
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Note: Auth user is already created, so we don't throw here
        // The trigger should handle this automatically
      }
    }

    return { data: authData, error: null }
  } catch (error) {
    console.error('Sign up error:', error)
    return { data: null, error }
  }
}

// Sign in function (for all user types)
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Sign in error:', error)
    return { data: null, error }
  }
}

// Sign out function
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Sign out error:', error)
    return { error }
  }
}

// Get current user with role
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) return null

    // Get role from user metadata
    const role = user.user_metadata?.role as UserRole || 'user'

    return {
      ...user,
      role
    }
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

// Get user role from database
export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    // Check if user is admin
    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (adminData) return 'admin'

    // Check if user is expert
    const { data: expertData } = await supabase
      .from('experts')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (expertData) return 'expert'

    // Check if user is regular user
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (userData) return 'user'

    return null
  } catch (error) {
    console.error('Get user role error:', error)
    return null
  }
}

// Update user profile
export async function updateUserProfile(userId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Update profile error:', error)
    return { data: null, error }
  }
}

// Check if user can access admin features
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', userId)
      .single()

    return !!data
  } catch {
    return false
  }
}

// Check if user can access expert features
export async function isExpert(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('experts')
      .select('id')
      .eq('user_id', userId)
      .single()

    return !!data
  } catch {
    return false
  }
}

// Create expert account (admin only)
export async function createExpertAccount(expertData: {
  email: string
  password: string
  full_name: string
  specialization: string
  bio?: string
}) {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: expertData.email,
      password: expertData.password,
      user_metadata: {
        role: 'expert',
        full_name: expertData.full_name
      },
      email_confirm: true
    })

    if (authError) throw authError

    // Create expert profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('experts')
        .insert({
          user_id: authData.user.id,
          specialization: expertData.specialization,
          bio: expertData.bio,
          verified: true
        })

      if (profileError) throw profileError
    }

    return { data: authData, error: null }
  } catch (error) {
    console.error('Create expert error:', error)
    return { data: null, error }
  }
}

// Create admin account (super admin only)
export async function createAdminAccount(adminData: {
  email: string
  password: string
  full_name: string
  permissions?: any
}) {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminData.email,
      password: adminData.password,
      user_metadata: {
        role: 'admin',
        full_name: adminData.full_name
      },
      email_confirm: true
    })

    if (authError) throw authError

    // Create admin profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('admins')
        .insert({
          user_id: authData.user.id,
          email: adminData.email,
          full_name: adminData.full_name,
          permissions: adminData.permissions || { full_access: true }
        })

      if (profileError) throw profileError
    }

    return { data: authData, error: null }
  } catch (error) {
    console.error('Create admin error:', error)
    return { data: null, error }
  }
}

// Auth state change listener
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const role = session.user.user_metadata?.role as UserRole || 'user'
      callback({
        ...session.user,
        role
      })
    } else {
      callback(null)
    }
  })
}