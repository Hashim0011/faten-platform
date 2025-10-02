import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ContentItem } from './useContent';

export const usePublicContent = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setContent(data);
        }
      } catch (err) {
        console.error('Error loading content:', err);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  const books = content.filter(item => item.content_type === 'ebook');
  const videos = content.filter(item => item.content_type === 'video');
  const articles = content.filter(item => item.content_type === 'article');

  return {
    content,
    books,
    videos,
    articles,
    loading
  };
};
