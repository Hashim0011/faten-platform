import React, { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { useContent } from '../hooks/useContent';
import ContentGrid from '../components/ContentGrid';
import AddContentModal from '../components/AddContentModal';

const ExpertDashboardContent = () => {
  const { content, loading, loadContent, deleteContent } = useContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddContent, setShowAddContent] = useState(false);

  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-1 relative max-w-xl">
            <input
              type="text"
              placeholder="البحث في المحتوى..."
              className="input-modern w-full has-right-icon"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5 pointer-events-none" />
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span>تصفية</span>
          </button>
        </div>
        <button
          onClick={() => setShowAddContent(true)}
          className="btn-primary flex items-center gap-2 mr-4"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة محتوى</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#6B7280]">
          <p>جاري التحميل...</p>
        </div>
      ) : (
        <ContentGrid content={filteredContent} onDelete={deleteContent} />
      )}

      <AddContentModal
        isOpen={showAddContent}
        onClose={() => setShowAddContent(false)}
        onContentAdded={loadContent}
      />
    </div>
  );
};

export default ExpertDashboardContent;
