import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (سيتم تحديثها لاحقاً)
export type UserRole = 'user' | 'expert' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Expert {
  id: string;
  user_id: string;
  specialization: string;
  bio?: string;
  verified: boolean;
  created_at: string;
}

export interface Admin {
  id: string;
  user_id: string;
  permissions: string[];
  created_at: string;
}

export type EventType = 'course' | 'workshop' | 'seminar' | 'webinar';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_type: EventType;
  image_url?: string;
  location?: string;
  is_online: boolean;
  start_date: string;
  end_date?: string;
  organizer?: string;
  registration_link?: string;
  contact_info?: string;
  instructor_name?: string;
  status: EventStatus;
  created_by?: string;
  created_at: string;
  updated_at: string;
}
