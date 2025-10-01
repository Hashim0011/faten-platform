import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string
          phone: string | null
          role: 'parent' | 'teacher' | 'student' | 'other'
          status: 'active' | 'suspended' | 'deleted'
          created_at: string
          updated_at: string
          last_active: string
          hours_spent: number
          engagement_rate: number
          content_engaged: number
          discussions_participated: number
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name: string
          phone?: string | null
          role?: 'parent' | 'teacher' | 'student' | 'other'
          status?: 'active' | 'suspended' | 'deleted'
          created_at?: string
          updated_at?: string
          last_active?: string
          hours_spent?: number
          engagement_rate?: number
          content_engaged?: number
          discussions_participated?: number
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string
          phone?: string | null
          role?: 'parent' | 'teacher' | 'student' | 'other'
          status?: 'active' | 'suspended' | 'deleted'
          created_at?: string
          updated_at?: string
          last_active?: string
          hours_spent?: number
          engagement_rate?: number
          content_engaged?: number
          discussions_participated?: number
        }
      }
      experts: {
        Row: {
          id: string
          user_id: string
          specialization: string
          bio: string | null
          rating: number
          discussions_handled: number
          activity_hours: number
          engagement_rate: number
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          specialization: string
          bio?: string | null
          rating?: number
          discussions_handled?: number
          activity_hours?: number
          engagement_rate?: number
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          specialization?: string
          bio?: string | null
          rating?: number
          discussions_handled?: number
          activity_hours?: number
          engagement_rate?: number
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string
          permissions: any
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name: string
          permissions?: any
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string
          permissions?: any
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      content: {
        Row: {
          id: string
          title: string
          description: string | null
          type: 'book' | 'video' | 'article'
          category: string
          author: string
          image_url: string | null
          content_url: string | null
          status: 'published' | 'draft' | 'archived'
          views: number
          likes: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type: 'book' | 'video' | 'article'
          category: string
          author: string
          image_url?: string | null
          content_url?: string | null
          status?: 'published' | 'draft' | 'archived'
          views?: number
          likes?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: 'book' | 'video' | 'article'
          category?: string
          author?: string
          image_url?: string | null
          content_url?: string | null
          status?: 'published' | 'draft' | 'archived'
          views?: number
          likes?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      discussions: {
        Row: {
          id: string
          title: string
          description: string | null
          created_by: string | null
          expert_id: string | null
          status: 'active' | 'closed' | 'archived'
          participants_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          created_by?: string | null
          expert_id?: string | null
          status?: 'active' | 'closed' | 'archived'
          participants_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          created_by?: string | null
          expert_id?: string | null
          status?: 'active' | 'closed' | 'archived'
          participants_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      discussion_messages: {
        Row: {
          id: string
          discussion_id: string | null
          user_id: string | null
          content: string
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          discussion_id?: string | null
          user_id?: string | null
          content: string
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          discussion_id?: string | null
          user_id?: string | null
          content?: string
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          type: 'workshop' | 'course' | 'lecture' | 'seminar'
          date: string
          time: string
          duration: number
          location: string | null
          max_participants: number
          current_participants: number
          instructor_id: string | null
          status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type: 'workshop' | 'course' | 'lecture' | 'seminar'
          date: string
          time: string
          duration?: number
          location?: string | null
          max_participants?: number
          current_participants?: number
          instructor_id?: string | null
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: 'workshop' | 'course' | 'lecture' | 'seminar'
          date?: string
          time?: string
          duration?: number
          location?: string | null
          max_participants?: number
          current_participants?: number
          instructor_id?: string | null
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      content_views: {
        Row: {
          id: string
          user_id: string | null
          content_id: string | null
          view_duration: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          content_id?: string | null
          view_duration?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          content_id?: string | null
          view_duration?: number
          created_at?: string
        }
      }
      content_likes: {
        Row: {
          id: string
          user_id: string | null
          content_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          content_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          content_id?: string | null
          created_at?: string
        }
      }
      event_registrations: {
        Row: {
          id: string
          user_id: string | null
          event_id: string | null
          status: 'registered' | 'attended' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_id?: string | null
          status?: 'registered' | 'attended' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_id?: string | null
          status?: 'registered' | 'attended' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}