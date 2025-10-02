import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getUserProfile = async (userId) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, status, avatar_url, bio, specialization, permissions')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    if (!profile) {
      console.warn('No profile found for user:', userId);
      return null;
    }

    if (profile.status !== 'active') {
      console.warn('User profile is not active:', userId);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const getUserRole = async (userId) => {
  const profile = await getUserProfile(userId);
  return profile ? profile.role : null;
};

export const redirectByRole = (role, navigate) => {
  switch (role) {
    case 'admin':
      navigate('/admin-dashboard');
      break;
    case 'expert':
      navigate('/expert-dashboard');
      break;
    case 'user':
      navigate('/dashboard');
      break;
    default:
      navigate('/role-selection');
      break;
  }
};
