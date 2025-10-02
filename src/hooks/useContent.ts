import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  content_type: string;
  category: string;
  author: string;
  image_url: string;
  content_url: string | null;
  status: string;
  views_count: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export const useContent = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setContent(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error loading content:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContent(content.filter(item => item.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error deleting content:', err);
      return false;
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  return {
    content,
    loading,
    error,
    loadContent,
    deleteContent
  };
};
