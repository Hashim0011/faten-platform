import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for database tables
export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
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

export interface Expert {
  id: string
  user_id: string
  specialization: string
  bio?: string
  rating: number
  discussions_handled: number
  activity_hours: number
  engagement_rate: number
  verified: boolean
  created_at: string
  updated_at: string
}

export interface Content {
  id: string
  title: string
  description?: string
  type: 'book' | 'video' | 'article'
  category: string
  author: string
  image_url?: string
  content_url?: string
  status: 'published' | 'draft' | 'archived'
  views: number
  likes: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Discussion {
  id: string
  title: string
  description?: string
  created_by: string
  expert_id?: string
  status: 'active' | 'closed' | 'archived'
  participants_count: number
  created_at: string
  updated_at: string
}

export interface DiscussionMessage {
  id: string
  discussion_id: string
  user_id: string
  content: string
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description?: string
  type: 'workshop' | 'course' | 'lecture' | 'seminar'
  date: string
  time: string
  duration: number
  location?: string
  max_participants: number
  current_participants: number
  instructor_id?: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  created_by?: string
  created_at: string
  updated_at: string
}

// Database functions
export const db = {
  // Users
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as User[]
  },

  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single()
    
    if (error) throw error
    return data as User
  },

  // Content
  async getContent(type?: 'book' | 'video' | 'article') {
    let query = supabase
      .from('content')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
    
    if (type) {
      query = query.eq('type', type)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data as Content[]
  },

  async createContent(content: Omit<Content, 'id' | 'created_at' | 'updated_at' | 'views' | 'likes'>) {
    const { data, error } = await supabase
      .from('content')
      .insert([content])
      .select()
      .single()
    
    if (error) throw error
    return data as Content
  },

  // Discussions
  async getDiscussions() {
    const { data, error } = await supabase
      .from('discussions')
      .select(`
        *,
        expert:experts(
          user:users(full_name)
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getDiscussionMessages(discussionId: string) {
    const { data, error } = await supabase
      .from('discussion_messages')
      .select(`
        *,
        user:users(full_name)
      `)
      .eq('discussion_id', discussionId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Events
  async getEvents() {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        instructor:experts(
          user:users(full_name)
        )
      `)
      .in('status', ['upcoming', 'ongoing'])
      .order('date', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Interactions
  async likeContent(contentId: string, userId: string) {
    const { data, error } = await supabase
      .from('content_likes')
      .insert([{ content_id: contentId, user_id: userId }])
    
    if (error) throw error
    return data
  },

  async viewContent(contentId: string, userId: string, duration: number = 0) {
    const { data, error } = await supabase
      .from('content_views')
      .insert([{ content_id: contentId, user_id: userId, view_duration: duration }])
    
    if (error) throw error
    return data
  }
}