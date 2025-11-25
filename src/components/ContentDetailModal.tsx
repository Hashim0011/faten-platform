import React, { useState, useEffect } from 'react';
import { X, Heart, Download, ExternalLink, Book, Video, FileText, Calendar, User, Eye } from 'lucide-react';
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

  // إغلاق عند الضغط على ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

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

  // منع إغلاق النافذة عند النقر على المحتوى نفسه
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="glass-effect rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={handleContentClick}
      >
        {/* Header Image */}
        <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden">
          <img
            src={content.image_url || 'https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg'}
            alt={content.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 left-2 sm:top-4 sm:left-4 p-2 sm:p-3 bg-white hover:bg-gray-100 rounded-full transition-all shadow-2xl hover:shadow-xl hover:scale-110 z-10 border-2 border-[#8B7355]/20"
            title="إغلاق (ESC)"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#654321]" />
          </button>

          {/* Type Badge */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
            <span className="status-badge status-new text-white bg-[#8B7355]/90 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
              {getContentTypeLabel(content.content_type)}
            </span>
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
            <div className="flex items-start gap-2 sm:gap-3 mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#8B7355] to-[#654321] flex items-center justify-center text-white shadow-lg flex-shrink-0">
                {getContentIcon(content.content_type)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white leading-tight mb-1 line-clamp-2">
                  {content.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-white/80 text-xs sm:text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{new Date(content.created_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{likesCount} إعجاب</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Description */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#654321] mb-3 sm:mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              الوصف
            </h3>
            <p className="text-[#2D2D2D] leading-relaxed text-sm sm:text-base lg:text-lg">
              {content.description || 'لا يوجد وصف متاح لهذا المحتوى'}
            </p>
          </div>

          {/* Content Viewer */}
          {content.file_url && content.file_url !== '#' && (
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#654321] mb-3 sm:mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                معاينة المحتوى
              </h3>

              {/* Video Content */}
              {content.content_type === 'video' && content.file_url.includes('youtube') && (
                <div className="aspect-video rounded-lg sm:rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={content.file_url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              {/* PDF Content */}
              {(content.content_type === 'book' || content.content_type === 'article') && content.file_url.endsWith('.pdf') && (
                <div className="rounded-lg sm:rounded-xl overflow-hidden border-2 border-[#8B7355]/20" style={{ height: '400px', maxHeight: '60vh' }}>
                  <iframe
                    src={content.file_url}
                    className="w-full h-full"
                    title={content.title}
                  ></iframe>
                </div>
              )}

              {/* Other Video Platforms */}
              {content.content_type === 'video' && !content.file_url.includes('youtube') && (
                <div className="aspect-video rounded-lg sm:rounded-xl overflow-hidden bg-black">
                  <video controls className="w-full h-full">
                    <source src={content.file_url} type="video/mp4" />
                    متصفحك لا يدعم تشغيل الفيديو
                  </video>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Like Button */}
            <button
              onClick={handleLikeToggle}
              disabled={loading}
              className={`btn-secondary flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 text-sm sm:text-base lg:text-lg transition-all ${
                isLiked
                  ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-300 text-red-600 hover:from-red-100 hover:to-pink-100'
                  : 'hover:border-[#8B7355]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-semibold">{isLiked ? 'تم الإعجاب' : 'أعجبني'}</span>
            </button>

            {/* View Button */}
            {content.file_url && content.file_url !== '#' ? (
              <a
                href={content.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 text-sm sm:text-base lg:text-lg hover:bg-[#8B7355]/20"
              >
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold">عرض</span>
              </a>
            ) : (
              <button
                disabled
                className="btn-secondary flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 text-sm sm:text-base lg:text-lg opacity-50 cursor-not-allowed"
              >
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold">غير متوفر</span>
              </button>
            )}

            {/* Download Button */}
            {content.file_url && content.file_url !== '#' ? (
              <a
                href={content.file_url}
                download
                className="btn-primary flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 text-sm sm:text-base lg:text-lg"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold">تحميل</span>
              </a>
            ) : (
              <button
                disabled
                className="btn-secondary flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 text-sm sm:text-base lg:text-lg opacity-50 cursor-not-allowed"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold">غير متوفر</span>
              </button>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-[#8B7355]/10 to-[#654321]/10 border border-[#8B7355]/20">
              <div className="flex items-center gap-2 text-[#8B7355] mb-2">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold text-xs sm:text-sm">الإعجابات</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-[#654321]">{likesCount}</p>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                {getContentIcon(content.content_type)}
                <span className="font-semibold text-xs sm:text-sm">النوع</span>
              </div>
              <p className="text-base sm:text-lg lg:text-xl font-bold text-blue-700">{getContentTypeLabel(content.content_type)}</p>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold text-xs sm:text-sm">تاريخ النشر</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-green-700">
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