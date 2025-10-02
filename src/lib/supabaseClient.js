import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getUserRole = async (userId) => {
  try {
    const { data: admin } = await supabase
      .from('admins')
      .select('user_id, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (admin) return 'admin';

    const { data: expert } = await supabase
      .from('experts')
      .select('user_id, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (expert) return 'expert';

    const { data: user } = await supabase
      .from('users')
      .select('user_id, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (user) return 'user';

    return null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
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
