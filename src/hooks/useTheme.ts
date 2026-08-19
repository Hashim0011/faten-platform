import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getUserSettings, updateAppearanceSettings } from '../lib/settings';

export type Theme = 'light' | 'dark';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [loading, setLoading] = useState(true);

  // Load theme from user settings or localStorage
  useEffect(() => {
    loadTheme();
  }, []);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const loadTheme = async () => {
    try {
      // First check localStorage for immediate theme application
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme) {
        setTheme(savedTheme);
      }

      // Then check user settings from database
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const settings = await getUserSettings(user.id);
        if (settings && settings.theme) {
          const dbTheme =
            settings.theme === 'auto'
              ? window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'
              : settings.theme;
          setTheme(dbTheme);
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    // Update in database if user is logged in
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await updateAppearanceSettings(user.id, { theme: newTheme });
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const setThemeMode = async (newTheme: Theme) => {
    setTheme(newTheme);

    // Update in database if user is logged in
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await updateAppearanceSettings(user.id, { theme: newTheme });
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return { theme, toggleTheme, setThemeMode, loading };
};
