import React, { useState, useEffect } from 'react';
import { X, Heart, Download, ExternalLink, Book, Video, FileText, Calendar, User } from 'lucide-react';
import { likeContent, unlikeContent, isContentLiked, getContentLikesCount } from '../lib/likes';

interface ContentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    id: string;
    title: string;
    content_type: string;
    description: string;
    image_url?: string;
    file_url?: string;
    created_at: string;
    author_id?: string;
  };
}

const ContentDetailModal: React.FC<ContentDetailModalProps> = ({ isOpen, onClose, content }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && content.id) {
      loadLikeStatus();
      loadLikesCount();
    }
  }, [isOpen, content.id]);

  const loadLikeStatus = async () => {
    const result = await isContentLiked(content.id);
    if (result.success) {
      setIsLiked(result.isLiked);
    }
  };

  const loadLikesCount = async () => {
    const result = await getContentLikesCount(content.id);
    if (result.success) {
      setLikesCount(result.count);
    }
  };

  const handleLikeToggle = async () => {
    setLoading(true);

    if (isLiked) {
      const result = await unlikeContent(content.id);
      if (result.success) {
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      }
    } else {
      const result = await likeContent(content.id);
      if (result.success) {
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    }

    setLoading(false);
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'book': return <Book className="w-6 h-6" />;
      case 'video': return <Video className="w-6 h-6" />;
      case 'article': return <FileText className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'book': return 'كتاب';
      case 'video': return 'فيديو';
      case 'article': return 'مقال';
      case 'course': return 'دورة';
      default: return 'محتوى';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="glass-effect rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header Image */}
        <div className="relative h-64 sm:h-80 overflow-hidden">
          <img
            src={content.image_url || 'https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg'}
            alt={content.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 bg-white/90 hover:bg-white rounded-full transition-all shadow-lg"
          >
            <X className="w-5 h-5 text-[#654321]" />
          </button>

          {/* Type Badge */}
          <div className="absolute top-4 right-4">
            <span className="status-badge status-new text-white bg-[#8B7355]/90 backdrop-blur-sm px-4 py-2">
              {getContentTypeLabel(content.content_type)}
            </span>
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B7355] to-[#654321] flex items-center justify-center text-white shadow-lg">
                {getContentIcon(content.content_type)}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-1">
                  {content.title}
                </h2>
                <div className="flex items-center gap-4 text-white/80 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(content.created_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{likesCount} إعجاب</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {/* Description */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[#654321] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              الوصف
            </h3>
            <p className="text-[#2D2D2D] leading-relaxed text-lg">
              {content.description || 'لا يوجد وصف متاح لهذا المحتوى'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Like Button */}
            <button
              onClick={handleLikeToggle}
              disabled={loading}
              className={`btn-secondary flex items-center justify-center gap-3 py-4 text-lg transition-all ${
                isLiked
                  ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-300 text-red-600 hover:from-red-100 hover:to-pink-100'
                  : 'hover:border-[#8B7355]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-semibold">{isLiked ? 'تم الإعجاب' : 'أعجبني'}</span>
            </button>

            {/* View/Download Button */}
            {content.file_url ? (
              <a
                href={content.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center justify-center gap-3 py-4 text-lg"
              >
                {content.content_type === 'book' ? (
                  <>
                    <Download className="w-5 h-5" />
                    <span className="font-semibold">تحميل {getContentTypeLabel(content.content_type)}</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5" />
                    <span className="font-semibold">مشاهدة {getContentTypeLabel(content.content_type)}</span>
                  </>
                )}
              </a>
            ) : (
              <button
                disabled
                className="btn-secondary flex items-center justify-center gap-3 py-4 text-lg opacity-50 cursor-not-allowed"
              >
                <ExternalLink className="w-5 h-5" />
                <span className="font-semibold">الرابط غير متوفر</span>
              </button>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#8B7355]/10 to-[#654321]/10 border border-[#8B7355]/20">
              <div className="flex items-center gap-2 text-[#8B7355] mb-2">
                <Heart className="w-5 h-5" />
                <span className="font-semibold">الإعجابات</span>
              </div>
              <p className="text-2xl font-bold text-[#654321]">{likesCount}</p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                {getContentIcon(content.content_type)}
                <span className="font-semibold">النوع</span>
              </div>
              <p className="text-xl font-bold text-blue-700">{getContentTypeLabel(content.content_type)}</p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">تاريخ النشر</span>
              </div>
              <p className="text-sm font-bold text-green-700">
                {new Date(content.created_at).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetailModal;
