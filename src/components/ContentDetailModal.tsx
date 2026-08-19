import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Download,
  ExternalLink,
  Book,
  Video,
  FileText,
  Calendar,
  User,
  Eye,
} from 'lucide-react';
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
        setLikesCount((prev) => Math.max(0, prev - 1));
      }
    } else {
      const result = await likeContent(content.id);
      if (result.success) {
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    }

    setLoading(false);
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'book':
        return <Book className="h-6 w-6" />;
      case 'video':
        return <Video className="h-6 w-6" />;
      case 'article':
        return <FileText className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'book':
        return 'كتاب';
      case 'video':
        return 'فيديو';
      case 'article':
        return 'مقال';
      case 'course':
        return 'دورة';
      default:
        return 'محتوى';
    }
  };

  if (!isOpen) return null;

  // منع إغلاق النافذة عند النقر على المحتوى نفسه
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="glass-effect flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl shadow-2xl sm:max-h-[90vh] sm:rounded-3xl"
        onClick={handleContentClick}
      >
        {/* Header Image */}
        <div className="relative h-48 overflow-hidden sm:h-64 lg:h-80">
          <img
            src={
              content.image_url ||
              'https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg'
            }
            alt={content.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute left-2 top-2 z-10 rounded-full border-2 border-[#8B7355]/20 bg-white p-2 shadow-2xl transition-all hover:scale-110 hover:bg-gray-100 hover:shadow-xl sm:left-4 sm:top-4 sm:p-3"
            title="إغلاق (ESC)"
          >
            <X className="h-5 w-5 text-[#654321] sm:h-6 sm:w-6" />
          </button>

          {/* Type Badge */}
          <div className="absolute right-2 top-2 sm:right-4 sm:top-4">
            <span className="status-badge status-new bg-[#8B7355]/90 px-3 py-1.5 text-xs text-white backdrop-blur-sm sm:px-4 sm:py-2 sm:text-sm">
              {getContentTypeLabel(content.content_type)}
            </span>
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
            <div className="mb-2 flex items-start gap-2 sm:gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B7355] to-[#654321] text-white shadow-lg sm:h-12 sm:w-12">
                {getContentIcon(content.content_type)}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="mb-1 line-clamp-2 text-lg font-bold leading-tight text-white sm:text-2xl lg:text-3xl">
                  {content.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-white/80 sm:gap-4 sm:text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{new Date(content.created_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart
                      className={`h-3 w-3 sm:h-4 sm:w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
                    />
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
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-[#654321] sm:mb-4 sm:text-lg lg:text-xl">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              الوصف
            </h3>
            <p className="text-sm leading-relaxed text-[#2D2D2D] sm:text-base lg:text-lg">
              {content.description || 'لا يوجد وصف متاح لهذا المحتوى'}
            </p>
          </div>

          {/* Content Viewer */}
          {content.file_url && content.file_url !== '#' && (
            <div className="mb-6 sm:mb-8">
              <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-[#654321] sm:mb-4 sm:text-lg lg:text-xl">
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                معاينة المحتوى
              </h3>

              {/* Video Content */}
              {content.content_type === 'video' && content.file_url.includes('youtube') && (
                <div className="aspect-video overflow-hidden rounded-lg bg-black sm:rounded-xl">
                  <iframe
                    src={content.file_url.replace('watch?v=', 'embed/')}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              {/* PDF Content */}
              {(content.content_type === 'book' || content.content_type === 'article') &&
                content.file_url.endsWith('.pdf') && (
                  <div
                    className="overflow-hidden rounded-lg border-2 border-[#8B7355]/20 sm:rounded-xl"
                    style={{ height: '400px', maxHeight: '60vh' }}
                  >
                    <iframe
                      src={content.file_url}
                      className="h-full w-full"
                      title={content.title}
                    ></iframe>
                  </div>
                )}

              {/* Other Video Platforms */}
              {content.content_type === 'video' && !content.file_url.includes('youtube') && (
                <div className="aspect-video overflow-hidden rounded-lg bg-black sm:rounded-xl">
                  <video controls className="h-full w-full">
                    <source src={content.file_url} type="video/mp4" />
                    متصفحك لا يدعم تشغيل الفيديو
                  </video>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {/* Like Button */}
            <button
              onClick={handleLikeToggle}
              disabled={loading}
              className={`btn-secondary flex items-center justify-center gap-2 py-3 text-sm transition-all sm:gap-3 sm:py-4 sm:text-base lg:text-lg ${
                isLiked
                  ? 'border-red-300 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 hover:from-red-100 hover:to-pink-100'
                  : 'hover:border-[#8B7355]'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-semibold">{isLiked ? 'تم الإعجاب' : 'أعجبني'}</span>
            </button>

            {/* View Button */}
            {content.file_url && content.file_url !== '#' ? (
              <a
                href={content.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center justify-center gap-2 py-3 text-sm hover:bg-[#8B7355]/20 sm:gap-3 sm:py-4 sm:text-base lg:text-lg"
              >
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-semibold">عرض</span>
              </a>
            ) : (
              <button
                disabled
                className="btn-secondary flex cursor-not-allowed items-center justify-center gap-2 py-3 text-sm opacity-50 sm:gap-3 sm:py-4 sm:text-base lg:text-lg"
              >
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-semibold">غير متوفر</span>
              </button>
            )}

            {/* Download Button */}
            {content.file_url && content.file_url !== '#' ? (
              <a
                href={content.file_url}
                download
                className="btn-primary flex items-center justify-center gap-2 py-3 text-sm sm:gap-3 sm:py-4 sm:text-base lg:text-lg"
              >
                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-semibold">تحميل</span>
              </a>
            ) : (
              <button
                disabled
                className="btn-secondary flex cursor-not-allowed items-center justify-center gap-2 py-3 text-sm opacity-50 sm:gap-3 sm:py-4 sm:text-base lg:text-lg"
              >
                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-semibold">غير متوفر</span>
              </button>
            )}
          </div>

          {/* Info Cards */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4">
            <div className="rounded-xl border border-[#8B7355]/20 bg-gradient-to-br from-[#8B7355]/10 to-[#654321]/10 p-3 sm:p-4">
              <div className="mb-2 flex items-center gap-2 text-[#8B7355]">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs font-semibold sm:text-sm">الإعجابات</span>
              </div>
              <p className="text-xl font-bold text-[#654321] sm:text-2xl">{likesCount}</p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-4">
              <div className="mb-2 flex items-center gap-2 text-blue-600">
                {getContentIcon(content.content_type)}
                <span className="text-xs font-semibold sm:text-sm">النوع</span>
              </div>
              <p className="text-base font-bold text-blue-700 sm:text-lg lg:text-xl">
                {getContentTypeLabel(content.content_type)}
              </p>
            </div>

            <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-3 sm:p-4">
              <div className="mb-2 flex items-center gap-2 text-green-600">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs font-semibold sm:text-sm">تاريخ النشر</span>
              </div>
              <p className="text-xs font-bold text-green-700 sm:text-sm">
                {new Date(content.created_at).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
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
