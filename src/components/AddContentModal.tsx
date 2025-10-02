import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContentAdded: () => void;
}

const AddContentModal = ({ isOpen, onClose, onContentAdded }: AddContentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expertId, setExpertId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'article' as 'article' | 'video' | 'ebook',
    category: '',
    author: '',
    image_url: '',
    content_url: '',
    status: 'published' as 'published' | 'draft'
  });

  useEffect(() => {
    const getExpertId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: expert } = await supabase
          .from('experts')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (expert) {
          setExpertId(expert.id);
        }
      }
    };

    if (isOpen) {
      getExpertId();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('content')
        .insert({
          title: formData.title,
          description: formData.description,
          content_type: formData.content_type,
          category: formData.category,
          author: formData.author,
          image_url: formData.image_url || 'https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg',
          content_url: formData.content_url,
          status: formData.status,
          created_by_expert_id: expertId,
          published_at: formData.status === 'published' ? new Date().toISOString() : null
        });

      if (insertError) {
        throw insertError;
      }

      setFormData({
        title: '',
        description: '',
        content_type: 'article',
        category: '',
        author: '',
        image_url: '',
        content_url: '',
        status: 'published'
      });

      onContentAdded();
      onClose();
    } catch (err: any) {
      console.error('Content creation error:', err);
      setError(err.message || 'حدث خطأ أثناء إضافة المحتوى');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-[#8B7355]/20">
          <h3 className="text-xl font-bold text-[#2D2D2D]">إضافة محتوى جديد</h3>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-[#2D2D2D] font-semibold mb-3">عنوان المحتوى</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-modern w-full"
                placeholder="أدخل عنوان المحتوى"
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#2D2D2D] font-semibold mb-3">نوع المحتوى</label>
                <select
                  name="content_type"
                  value={formData.content_type}
                  onChange={handleChange}
                  className="input-modern w-full"
                  disabled={loading}
                >
                  <option value="ebook">كتاب</option>
                  <option value="video">فيديو</option>
                  <option value="article">مقال</option>
                </select>
              </div>
              <div>
                <label className="block text-[#2D2D2D] font-semibold mb-3">الفئة</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-modern w-full"
                  placeholder="مثال: الأمن الفكري"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-[#2D2D2D] font-semibold mb-3">المؤلف</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="input-modern w-full"
                placeholder="اسم المؤلف أو المنشئ"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-[#2D2D2D] font-semibold mb-3">الوصف</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-modern w-full h-24 resize-none"
                placeholder="أدخل وصف المحتوى"
                required
                disabled={loading}
              ></textarea>
            </div>

            <div>
              <label className="block text-[#2D2D2D] font-semibold mb-3">رابط الصورة (اختياري)</label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="input-modern w-full"
                placeholder="https://example.com/image.jpg"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-[#2D2D2D] font-semibold mb-3">رابط المحتوى (اختياري)</label>
              <input
                type="url"
                name="content_url"
                value={formData.content_url}
                onChange={handleChange}
                className="input-modern w-full"
                placeholder="https://example.com/content"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-[#2D2D2D] font-semibold mb-3">الحالة</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-modern w-full"
                disabled={loading}
              >
                <option value="published">منشور</option>
                <option value="draft">مسودة</option>
              </select>
            </div>
          </form>
        </div>
        <div className="p-6 border-t border-[#8B7355]/20 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? 'جاري الإضافة...' : 'إضافة المحتوى'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-secondary flex-1"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddContentModal;
