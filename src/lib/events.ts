import { supabase } from './supabase';

export type EventType = 'course' | 'workshop' | 'seminar' | 'webinar';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface EventData {
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
  status?: EventStatus;
}

/**
 * إضافة فعالية جديدة
 */
export async function addEvent(eventData: EventData) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    const { data, error } = await supabase
      .from('events')
      .insert({
        ...eventData,
        created_by: user.id,
        status: eventData.status || 'upcoming',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error adding event:', error);
    return { success: false, error: error.message };
  }
}

/**
 * الحصول على جميع الفعاليات
 */
export async function getAllEvents() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        creator:created_by (
          full_name,
          role
        )
      `)
      .order('start_date', { ascending: true });

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * الحصول على الفعاليات القادمة
 */
export async function getUpcomingEvents() {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'upcoming')
      .gte('start_date', now)
      .order('start_date', { ascending: true })
      .limit(10);

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching upcoming events:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * الحصول على فعالية معينة
 */
export async function getEvent(id: string) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        creator:created_by (
          full_name,
          role
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching event:', error);
    return { success: false, error: error.message };
  }
}

/**
 * تحديث فعالية
 */
export async function updateEvent(id: string, eventData: Partial<EventData>) {
  try {
    const { data, error } = await supabase
      .from('events')
      .update({
        ...eventData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating event:', error);
    return { success: false, error: error.message };
  }
}

/**
 * حذف فعالية
 */
export async function deleteEvent(id: string) {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return { success: false, error: error.message };
  }
}
