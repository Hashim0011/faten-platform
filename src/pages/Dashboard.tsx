import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Search, Book, Video, FileText, Mail, LogOut, MessageCircle, Bell, Settings, Clock, Filter, Users, Star, Heart } from 'lucide-react';
import DiscussionModal from '../components/DiscussionModal';
import AiChatModal from '../components/AiChatModal';
import NotificationModal from '../components/NotificationModal';
import ContentDetailModal from '../components/ContentDetailModal';
import { getPublishedContent } from '../lib/content';
import { getAllDiscussions } from '../lib/discussions';
import { getUpcomingEvents } from '../lib/events';
import { getAllUsers } from '../lib/users';
import { getUnreadCount } from '../lib/notifications';
import { likeContent, unlikeContent, getAllContentLikes, getUserLikesStatus } from '../lib/likes';

type Topic = { id: number; title: string; date: string };

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'books' | 'videos' | 'articles'>('books');
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [libraryContent, setLibraryContent] = useState<any>({
    books: [],
    videos: [],
    articles: [],
    course: []
  });
  const [discussionTopics, setDiscussionTopics] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [showContentDetail, setShowContentDetail] = useState(false);
  const [likesCount, setLikesCount] = useState<{ [key: string]: number }>({});
  const [likedContent, setLikedContent] = useState<string[]>([]);

  // تحميل جميع البيانات من الداتا بيس
  useEffect(() => {
    loadAllData();
    loadUnreadCount();
  }, []);

  const loadUnreadCount = async () => {
    const result = await getUnreadCount();
    if (result.success) {
      setUnreadNotifications(result.count);
    }
  };

  const loadAllData = async () => {
    // تحميل المحتوى
    const contentResult = await getPublishedContent();
    if (contentResult.success && contentResult.data) {
      const content = {
        books: contentResult.data.filter((item: any) => item.content_type === 'book'),
        videos: contentResult.data.filter((item: any) => item.content_type === 'video'),
        articles: contentResult.data.filter((item: any) => item.content_type === 'article'),
        course: contentResult.data.filter((item: any) => item.content_type === 'course'),
      };
      setLibraryContent(content);

      // تحميل اللايكات
      const contentIds = contentResult.data.map((item: any) => item.id);
      const likesResult = await getAllContentLikes(contentIds);
      if (likesResult.success) {
        setLikesCount(likesResult.likesCount);
      }

      const userLikesResult = await getUserLikesStatus(contentIds);
      if (userLikesResult.success) {
        setLikedContent(userLikesResult.likedContent);
      }
    }

    // تحميل النقاشات
    const discussionsResult = await getAllDiscussions();
    console.log('💬 Discussions result (Dashboard):', discussionsResult);
    if (discussionsResult.success && discussionsResult.data) {
      console.log('✅ Setting discussions:', discussionsResult.data.length, 'discussions');
      setDiscussionTopics(discussionsResult.data.slice(0, 3)); // أحدث 3 نقاشات
    } else {
      console.error('❌ Failed to load discussions:', discussionsResult.error);
    }

    // تحميل الفعاليات القادمة
    const eventsResult = await getUpcomingEvents();
    console.log('📅 Events result (Dashboard):', eventsResult);
    if (eventsResult.success && eventsResult.data) {
      console.log('✅ Setting events:', eventsResult.data.length, 'events');
      console.log('Events data:', eventsResult.data);
      setUpcomingEvents(eventsResult.data.slice(0, 3)); // أقرب 3 فعاليات
    } else {
      console.error('❌ Failed to load events:', eventsResult.error);
    }

    // تحميل عدد المستخدمين
    const usersResult = await getAllUsers();
    if (usersResult.success && usersResult.data) {
      setTotalUsers(usersResult.data.length);
    }
  };

  const formatInt = (n: number) => n.toLocaleString('en-US');

  const counts = useMemo(() => {
    const books = libraryContent.books.length;
    const videos = libraryContent.videos.length;
    const articles = libraryContent.articles.length;
    const total = books + videos + articles;

    // حساب عدد المستخدمين النشطين من قاعدة البيانات
    const activeUsers = totalUsers;

    // حساب متوسط التقييم من المحتوى (إذا كان موجود حقل rating)
    const allContent = [...libraryContent.books, ...libraryContent.videos, ...libraryContent.articles];
    const totalRating = allContent.reduce((sum: number, item: any) => sum + (item.rating || 0), 0);
    const rating = allContent.length > 0 ? (totalRating / allContent.length) || 4.5 : 4.5;

    return { books, videos, articles, total, activeUsers, rating };
  }, [libraryContent, totalUsers]);

  const filteredContent = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return libraryContent[activeTab];

    return libraryContent[activeTab].filter((item: any) =>
      [item.title, item.description].some((t: string) => t && t.toLowerCase().includes(q.toLowerCase()))
    );
  }, [activeTab, searchQuery, libraryContent]);

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setShowDiscussion(true);
  };

  const handleLikeToggle = async (contentId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // منع فتح التفاصيل

    const isLiked = likedContent.includes(contentId);

    if (isLiked) {
      const result = await unlikeContent(contentId);
      if (result.success) {
        setLikedContent(prev => prev.filter(id => id !== contentId));
        setLikesCount(prev => ({ ...prev, [contentId]: Math.max(0, (prev[contentId] || 0) - 1) }));
      }
    } else {
      const result = await likeContent(contentId);
      if (result.success) {
        setLikedContent(prev => [...prev, contentId]);
        setLikesCount(prev => ({ ...prev, [contentId]: (prev[contentId] || 0) + 1 }));
      }
    }
  };

  const handleContentClick = (content: any) => {
    setSelectedContent(content);
    setShowContentDetail(true);
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-pattern">
      {/* Header */}
      <div className="glass-effect border-b border-[#8B7355]/10 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B7355] to-[#654321] flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text" style={{fontFeatureSettings: '"liga" 1, "calt" 1'}}>فطن</h1>
            </div>
            <div className="bg-gradient-to-r from-[#8B7355]/10 to-[#D4AF37]/10 rounded-xl py-2 px-4 max-w-xl overflow-hidden border border-[#8B7355]/20 hidden sm:block">
              <p className="animate-marquee whitespace-nowrap text-sm text-[#654321] font-medium">
                🎓 ورشة عمل: "تعزيز الأمن الفكري" - السبت القادم | 📚 دورة: "مهارات التفكير النقدي" - التسجيل مفتوح | 🌟 محاضرة: "الهوية الوطنية" - الأربعاء القادم
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button 
              onClick={() => setShowNotifications(true)}
              className="p-2 rounded-xl hover:bg-[#8B7355]/10 transition-colors relative"
            >
              <Bell className="w-5 h-5 text-[#8B7355]" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </button>
            <button className="btn-secondary text-xs sm:text-sm flex items-center gap-2 px-2 sm:px-4">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">تواصل معنا</span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="p-2 rounded-xl hover:bg-[#8B7355]/10 transition-colors hidden sm:block"
              title="الإعدادات"
            >
              <Settings className="w-5 h-5 text-[#8B7355]" />
            </button>
            <button 
              onClick={handleLogout}
              className="btn-secondary text-xs sm:text-sm flex items-center gap-2 px-2 sm:px-4"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col lg:flex-row-reverse gap-6 lg:gap-8">
          {/* Main Content - المحتوى الرئيسي */}
          <main className="flex-1 min-w-0">
            {/* Search Bar */}
            <div className="content-card mb-8">
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="flex gap-2 order-2 sm:order-1">
                  <button className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2">
                    جميع المحتويات
                  </button>
                  <button className="btn-secondary text-xs sm:text-sm px-3 sm:px-4 py-2 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">تصفية</span>
                  </button>
                </div>
                <div className="flex-1 relative order-1 sm:order-2">
                  <input
                    type="text"
                    placeholder="ابحث في المكتبة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-modern w-full has-right-icon"
                  />
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Stats Cards (dynamic & consistent) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="content-card text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
                  <Book className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#2D2D2D] mb-1">{formatInt(counts.total)}</h3>
                <p className="text-[#6B7280] text-sm">محتوى تعليمي</p>
              </div>
              <div className="content-card text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#2D2D2D] mb-1">{counts.rating.toFixed(1)}</h3>
                <p className="text-[#6B7280] text-sm">تقييم المحتوى</p>
              </div>
              <div className="content-card text-center sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#2D2D2D] mb-1">{formatInt(counts.activeUsers)}</h3>
                <p className="text-[#6B7280] text-sm">مستخدم نشط</p>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="content-card mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab('books')}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    activeTab === 'books' 
                      ? 'bg-gradient-to-r from-[#8B7355] to-[#654321] text-white shadow-lg' 
                      : 'text-[#8B7355] hover:bg-[#8B7355]/10'
                  }`}
                >
                  <Book className="w-4 h-4" />
                  <span>الكتب</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs hidden sm:inline">{counts.books}</span>
                </button>
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    activeTab === 'videos' 
                      ? 'bg-gradient-to-r from-[#8B7355] to-[#654321] text-white shadow-lg' 
                      : 'text-[#8B7355] hover:bg-[#8B7355]/10'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>مقاطع الفيديو</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs hidden sm:inline">{counts.videos}</span>
                </button>
                <button
                  onClick={() => setActiveTab('articles')}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    activeTab === 'articles' 
                      ? 'bg-gradient-to-r from-[#8B7355] to-[#654321] text-white shadow-lg' 
                      : 'text-[#8B7355] hover:bg-[#8B7355]/10'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>المقالات</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs hidden sm:inline">{counts.articles}</span>
                </button>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredContent.map((item: any) => {
                const createdAt = new Date(item.created_at);
                const now = new Date();
                const daysDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
                const isNew = daysDiff <= 30 && daysDiff >= 0;
                const formattedDate = createdAt.toLocaleDateString('ar-SA');

                const isLiked = likedContent.includes(item.id);
                const likes = likesCount[item.id] || 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleContentClick(item)}
                    className="content-card card-hover group overflow-hidden cursor-pointer"
                  >
                    <div className="relative h-40 sm:h-48 mb-4 rounded-xl overflow-hidden">
                      <img
                        src={item.image_url || 'https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        {isNew && <span className="status-badge status-new">جديد</span>}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-[#2D2D2D] font-bold text-base sm:text-lg leading-tight group-hover:text-[#8B7355] transition-colors">{item.title}</h3>
                      <p className="text-[#6B7280] text-xs sm:text-sm leading-relaxed line-clamp-2">{item.description || 'لا يوجد وصف'}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-[#8B7355]/10">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#6B7280]">
                          <Clock className="w-4 h-4" />
                          <span>{formattedDate}</span>
                        </div>
                        <button
                          onClick={(e) => handleLikeToggle(item.id, e)}
                          className={`flex items-center gap-2 text-xs sm:text-sm px-3 py-1.5 rounded-lg transition-all ${
                            isLiked
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'text-[#8B7355] hover:bg-[#8B7355]/10'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                          <span className="font-semibold">{likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>

          {/* Sidebar - النقاشات والفعاليات */}
          <aside className="w-full lg:w-1/4 lg:min-w-[300px] space-y-6">
            {/* Discussion Topics */}
            <div className="content-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-[#2D2D2D]">مواضيع النقاش</h3>
                <MessageCircle className="w-5 h-5 text-[#8B7355]" />
              </div>
              <div className="space-y-3">
                {discussionTopics.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 mx-auto text-[#8B7355]/30 mb-3" />
                    <p className="text-sm text-[#6B7280]">لا توجد نقاشات حالياً</p>
                  </div>
                ) : (
                  discussionTopics.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicClick(topic)}
                      className="w-full p-4 rounded-xl hover:bg-[#8B7355]/5 transition-all text-right group border border-transparent hover:border-[#8B7355]/20"
                    >
                      <h4 className="font-semibold text-sm sm:text-base text-[#2D2D2D] group-hover:text-[#8B7355] transition-colors mb-2">{topic.title}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#6B7280]">
                          {new Date(topic.created_at).toLocaleDateString('ar-SA')}
                        </span>
                        <span className="text-xs bg-[#8B7355]/10 text-[#8B7355] px-2 py-1 rounded-full">
                          {topic.messages?.length || 0} رسالة
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="content-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-[#2D2D2D]">الفعاليات القادمة</h3>
                <Bell className="w-5 h-5 text-[#8B7355]" />
              </div>
              <div className="space-y-4">
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 mx-auto text-[#8B7355]/30 mb-3" />
                    <p className="text-sm text-[#6B7280]">لا توجد فعاليات قادمة</p>
                  </div>
                ) : (
                  upcomingEvents.map(event => {
                    const eventDate = new Date(event.start_date);
                    const formattedDate = eventDate.toLocaleDateString('ar-SA', {
                      month: 'short',
                      day: 'numeric'
                    });

                    const eventTypeLabel =
                      event.event_type === 'course' ? 'دورة' :
                      event.event_type === 'workshop' ? 'ورشة عمل' :
                      event.event_type === 'seminar' ? 'ندوة' : 'ويبينار';

                    return (
                      <div key={event.id} className="p-4 rounded-xl bg-gradient-to-r from-[#8B7355]/5 to-[#D4AF37]/5 border border-[#8B7355]/10 hover:border-[#8B7355]/30 transition-all group">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`status-badge ${
                            event.event_type === 'workshop' ? 'status-new' :
                            event.event_type === 'course' ? 'status-featured' : 'status-popular'
                          }`}>
                            {eventTypeLabel}
                          </span>
                          <span className="text-sm text-[#6B7280] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formattedDate}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base text-[#2D2D2D] font-semibold group-hover:text-[#8B7355] transition-colors">{event.title}</h4>
                        {event.instructor_name && (
                          <p className="text-xs text-[#6B7280] mt-2">المدرب: {event.instructor_name}</p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* AI Chat Button */}
      <button
        onClick={() => setShowAiChat(true)}
        className="fixed bottom-4 left-4 sm:bottom-8 sm:left-8 p-3 sm:p-4 glass-effect rounded-2xl shadow-xl hover:shadow-2xl transition-all group"
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-[#8B7355] group-hover:scale-110 transition-transform" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center">
            <Brain className="w-2 h-2 text-white" />
          </div>
        </div>
      </button>

      {/* Modals */}
      {selectedTopic && (
        <DiscussionModal
          isOpen={showDiscussion}
          onClose={() => setShowDiscussion(false)}
          topic={selectedTopic}
        />
      )}
      
      <AiChatModal
        isOpen={showAiChat}
        onClose={() => setShowAiChat(false)}
      />
      
      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        userRole="user"
      />

      {selectedContent && (
        <ContentDetailModal
          isOpen={showContentDetail}
          onClose={() => {
            setShowContentDetail(false);
            setSelectedContent(null);
            // إعادة تحميل اللايكات بعد إغلاق المودال
            loadAllData();
          }}
          content={selectedContent}
        />
      )}
    </div>
  );
};

export default Dashboard;
