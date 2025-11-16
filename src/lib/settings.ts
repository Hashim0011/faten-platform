import { supabase } from './supabase';

// Settings Types
export interface UserSettings {
  user_id: string;
  language: 'ar' | 'en';
  theme: 'light' | 'dark' | 'auto';
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  new_content_notifications: boolean;
  discussion_notifications: boolean;
  expert_notifications: boolean;
  event_notifications: boolean;
  font_size: 'small' | 'medium' | 'large';
  privacy_profile_visible: boolean;
  privacy_show_email: boolean;
  privacy_show_phone: boolean;
  auto_play_videos: boolean;
  data_saver_mode: boolean;
  created_at?: string;
  updated_at?: string;
}

// Default settings
export const defaultSettings: Omit<UserSettings, 'user_id' | 'created_at' | 'updated_at'> = {
  language: 'ar',
  theme: 'light',
  notifications_enabled: true,
  email_notifications: true,
  push_notifications: true,
  new_content_notifications: true,
  discussion_notifications: true,
  expert_notifications: true,
  event_notifications: true,
  font_size: 'medium',
  privacy_profile_visible: true,
  privacy_show_email: false,
  privacy_show_phone: false,
  auto_play_videos: true,
  data_saver_mode: false,
};

/**
 * Get user settings from database
 * If settings don't exist, create default settings
 */
export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no settings found, create default settings
      if (error.code === 'PGRST116') {
        return await createDefaultSettings(userId);
      }
      throw error;
    }

    return data as UserSettings;
  } catch (error: any) {
    console.error('Error fetching user settings:', error);
    return null;
  }
};

/**
 * Create default settings for a new user
 */
export const createDefaultSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    const newSettings = {
      user_id: userId,
      ...defaultSettings,
    };

    const { data, error } = await supabase
      .from('user_settings')
      .insert(newSettings)
      .select()
      .single();

    if (error) throw error;

    return data as UserSettings;
  } catch (error: any) {
    console.error('Error creating default settings:', error);
    return null;
  }
};

/**
 * Update user settings
 */
export const updateUserSettings = async (
  userId: string,
  updates: Partial<Omit<UserSettings, 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return data as UserSettings;
  } catch (error: any) {
    console.error('Error updating user settings:', error);
    return null;
  }
};

/**
 * Reset settings to default
 */
export const resetToDefaultSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .update({
        ...defaultSettings,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return data as UserSettings;
  } catch (error: any) {
    console.error('Error resetting settings:', error);
    return null;
  }
};

/**
 * Delete user settings (for account deletion)
 */
export const deleteUserSettings = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_settings')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    return true;
  } catch (error: any) {
    console.error('Error deleting user settings:', error);
    return false;
  }
};

/**
 * Toggle a boolean setting
 */
export const toggleSetting = async (
  userId: string,
  settingKey: keyof Omit<UserSettings, 'user_id' | 'created_at' | 'updated_at' | 'language' | 'theme' | 'font_size'>
): Promise<UserSettings | null> => {
  try {
    // Get current settings
    const currentSettings = await getUserSettings(userId);
    if (!currentSettings) return null;

    // Toggle the boolean value
    const newValue = !currentSettings[settingKey];

    // Update settings
    return await updateUserSettings(userId, { [settingKey]: newValue });
  } catch (error: any) {
    console.error('Error toggling setting:', error);
    return null;
  }
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (
  userId: string,
  preferences: {
    email_notifications?: boolean;
    push_notifications?: boolean;
    new_content_notifications?: boolean;
    discussion_notifications?: boolean;
    expert_notifications?: boolean;
    event_notifications?: boolean;
  }
): Promise<UserSettings | null> => {
  return await updateUserSettings(userId, preferences);
};

/**
 * Update privacy settings
 */
export const updatePrivacySettings = async (
  userId: string,
  privacy: {
    privacy_profile_visible?: boolean;
    privacy_show_email?: boolean;
    privacy_show_phone?: boolean;
  }
): Promise<UserSettings | null> => {
  return await updateUserSettings(userId, privacy);
};

/**
 * Update appearance settings
 */
export const updateAppearanceSettings = async (
  userId: string,
  appearance: {
    language?: 'ar' | 'en';
    theme?: 'light' | 'dark' | 'auto';
    font_size?: 'small' | 'medium' | 'large';
  }
): Promise<UserSettings | null> => {
  return await updateUserSettings(userId, appearance);
};

/**
 * Update performance settings
 */
export const updatePerformanceSettings = async (
  userId: string,
  performance: {
    auto_play_videos?: boolean;
    data_saver_mode?: boolean;
  }
): Promise<UserSettings | null> => {
  return await updateUserSettings(userId, performance);
};
