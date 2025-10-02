import React from 'react';
import { Eye, Trash2, CreditCard as Edit, Video, FileText, Book } from 'lucide-react';
import type { ContentItem } from '../hooks/useContent';

interface ContentGridProps {
  content: ContentItem[];
  onDelete: (id: string) => void;
}

const ContentGrid = ({ content, onDelete }: ContentGridProps) => {
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'ebook':
        return <Book className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'article':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="status-badge status-new">منشور</span>;
      case 'draft':
        return <span className="status-badge" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white' }}>مسودة</span>;
      case 'archived':
        return <span className="status-badge" style={{ background: 'linear-gradient(135deg, #6B7280, #4B5563)', color: 'white' }}>أرشيف</span>;
      default:
        return <span className="status-badge status-featured">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  if (content.length === 0) {
    return (
      <div className="text-center py-12 text-[#6B7280]">
        <Book className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>لا يوجد محتوى حالياً</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {content.map((item) => (
        <div key={item.id} className="content-card card-hover group">
          <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute top-3 right-3">
              {getStatusBadge(item.status)}
            </div>
            <div className="absolute top-3 left-3 flex gap-2">
              <button className="p-2 rounded-lg bg-white/90 hover:bg-white text-[#8B7355] transition-colors">
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg bg-white/90 hover:bg-white text-[#8B7355] transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm('هل أنت متأكد من حذف هذا المحتوى؟')) {
                    onDelete(item.id);
                  }
                }}
                className="p-2 rounded-lg bg-white/90 hover:bg-red-500 hover:text-white text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getContentIcon(item.content_type)}
              <h3 className="text-[#2D2D2D] font-bold text-lg leading-tight">{item.title}</h3>
            </div>
            <p className="text-[#6B7280] text-sm line-clamp-2">{item.description}</p>
            <div className="flex items-center justify-between text-sm text-[#6B7280]">
              <span>{item.author}</span>
              <span>{item.category}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[#8B7355]/10">
              <span className="text-sm text-[#6B7280]">{formatDate(item.created_at)}</span>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-[#8B7355]" />
                  <span>{item.views_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-red-500">❤️</span>
                  <span>{item.likes_count}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContentGrid;
