import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Search,
  Book,
  Video,
  FileText,
  Mail,
  LogOut,
  MessageCircle,
  Bell,
  Settings,
  Clock,
  Filter,
  Users,
  Star,
  Heart,
} from 'lucide-react';
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
    course: [],
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
      setDiscussionTopics(discussionsResult.data); // عرض جميع النقاشات
    } else {
      console.error('❌ Failed to load discussions:', discussionsResult.error);
    }

    // تحميل الفعاليات القادمة
    const eventsResult = await getUpcomingEvents();
    console.log('📅 Events result (Dashboard):', eventsResult);
    if (eventsResult.success && eventsResult.data) {
      console.log('✅ Setting events:', eventsResult.data.length, 'events');
      console.log('Events data:', eventsResult.data);
      setUpcomingEvents(eventsResult.data); // عرض جميع الفعاليات
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
    const allContent = [
      ...libraryContent.books,
      ...libraryContent.videos,
      ...libraryContent.articles,
    ];
    const totalRating = allContent.reduce((sum: number, item: any) => sum + (item.rating || 0), 0);
    const rating = allContent.length > 0 ? totalRating / allContent.length || 4.5 : 4.5;

    return { books, videos, articles, total, activeUsers, rating };
  }, [libraryContent, totalUsers]);

  const filteredContent = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return libraryContent[activeTab];

    return libraryContent[activeTab].filter((item: any) =>
      [item.title, item.description].some(
        (t: string) => t && t.toLowerCase().includes(q.toLowerCase())
      )
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
        setLikedContent((prev) => prev.filter((id) => id !== contentId));
        setLikesCount((prev) => ({
          ...prev,
          [contentId]: Math.max(0, (prev[contentId] || 0) - 1),
        }));
      }
    } else {
      const result = await likeContent(contentId);
      if (result.success) {
        setLikedContent((prev) => [...prev, contentId]);
        setLikesCount((prev) => ({ ...prev, [contentId]: (prev[contentId] || 0) + 1 }));
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
    <div className="bg-pattern min-h-screen">
      {/* Header */}
      <div className="glass-effect sticky top-0 z-40 border-b border-[#8B7355]/10">
        <div className="container mx-auto px-3 py-3 sm:px-6 sm:py-4">
          {/* الصف الأول: الشعار والأزرار */}
          <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B7355] to-[#654321] sm:h-10 sm:w-10">
                <Brain className="h-4 w-4 text-white sm:h-6 sm:w-6" />
              </div>
              <h1
                className="gradient-text text-lg font-bold sm:text-2xl"
                style={{ fontFeatureSettings: '"liga" 1, "calt" 1' }}
              >
                فطن
              </h1>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3 lg:gap-4">
              <button
                onClick={() => setShowNotifications(true)}
                className="relative rounded-xl p-1.5 transition-colors hover:bg-[#8B7355]/10 sm:p-2"
              >
                <Bell className="h-4 w-4 text-[#8B7355] sm:h-5 sm:w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white sm:-right-1 sm:-top-1 sm:h-5 sm:w-5 sm:text-xs">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              <button className="btn-secondary flex items-center gap-1 px-2 py-1.5 text-[10px] sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden md:inline">تواصل معنا</span>
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="hidden rounded-xl p-1.5 transition-colors hover:bg-[#8B7355]/10 sm:p-2 md:block"
                title="الإعدادات"
              >
                <Settings className="h-4 w-4 text-[#8B7355] sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="btn-secondary flex items-center gap-1 px-2 py-1.5 text-[10px] sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          </div>
          {/* الصف الثاني: شريط الأخبار - يظهر على الموبايل والديسكتوب */}
          <div className="w-full overflow-hidden rounded-lg border border-[#8B7355]/20 bg-gradient-to-r from-[#8B7355]/10 to-[#D4AF37]/10 px-3 py-1.5 sm:rounded-xl sm:px-4 sm:py-2">
            <p className="animate-marquee whitespace-nowrap text-[11px] font-medium text-[#654321] sm:text-sm">
              🎓 ورشة عمل: "تعزيز الأمن الفكري" - السبت القادم | 📚 دورة: "مهارات التفكير النقدي" -
              التسجيل مفتوح | 🌟 محاضرة: "الهوية الوطنية" - الأربعاء القادم
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row-reverse lg:gap-8">
          {/* Main Content - المحتوى الرئيسي */}
          <main className="min-w-0 flex-1">
            {/* Search Bar */}
            <div className="content-card mb-6 sm:mb-8">
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="order-2 flex w-full gap-2 sm:order-1 sm:w-auto">
                  <button className="btn-primary flex-1 whitespace-nowrap px-3 py-2 text-xs sm:flex-none sm:px-4 sm:py-2.5 sm:text-sm">
                    جميع المحتويات
                  </button>
                </div>
                <div className="relative order-1 min-w-0 flex-1 sm:order-2">
                  <input
                    type="text"
                    placeholder="ابحث في المكتبة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-modern has-right-icon w-full text-sm sm:text-base"
                    style={{
                      paddingRight: '2.75rem',
                      paddingLeft: '1rem',
                      paddingTop: '0.625rem',
                      paddingBottom: '0.625rem',
                    }}
                  />
                  <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-[#8B7355] sm:h-5 sm:w-5" />
                </div>
              </div>
            </div>

            {/* Stats Cards (dynamic & consistent) */}
            <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              <div className="content-card py-4 text-center sm:py-6">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] sm:mb-3 sm:h-12 sm:w-12">
                  <Book className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
                <h3 className="mb-1 text-lg font-bold text-[#2D2D2D] sm:text-xl lg:text-2xl">
                  {formatInt(counts.total)}
                </h3>
                <p className="text-xs text-[#6B7280] sm:text-sm">محتوى تعليمي</p>
              </div>
              <div className="content-card py-4 text-center sm:py-6">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] sm:mb-3 sm:h-12 sm:w-12">
                  <Star className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
                <h3 className="mb-1 text-lg font-bold text-[#2D2D2D] sm:text-xl lg:text-2xl">
                  {counts.rating.toFixed(1)}
                </h3>
                <p className="text-xs text-[#6B7280] sm:text-sm">تقييم المحتوى</p>
              </div>
              <div className="content-card py-4 text-center sm:col-span-2 sm:py-6 lg:col-span-1">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] sm:mb-3 sm:h-12 sm:w-12">
                  <Users className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
                <h3 className="mb-1 text-lg font-bold text-[#2D2D2D] sm:text-xl lg:text-2xl">
                  {formatInt(counts.activeUsers)}
                </h3>
                <p className="text-xs text-[#6B7280] sm:text-sm">مستخدم نشط</p>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="content-card mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab('books')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all sm:flex-none sm:gap-2 sm:px-6 sm:py-3 sm:text-sm ${
                    activeTab === 'books'
                      ? 'bg-gradient-to-r from-[#8B7355] to-[#654321] text-white shadow-lg'
                      : 'text-[#8B7355] hover:bg-[#8B7355]/10'
                  }`}
                >
                  <Book className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>الكتب</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] sm:px-2 sm:text-xs ${activeTab === 'books' ? 'bg-white/20' : 'bg-[#8B7355]/10'}`}
                  >
                    {counts.books}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all sm:flex-none sm:gap-2 sm:px-6 sm:py-3 sm:text-sm ${
                    activeTab === 'videos'
                      ? 'bg-gradient-to-r from-[#8B7355] to-[#654321] text-white shadow-lg'
                      : 'text-[#8B7355] hover:bg-[#8B7355]/10'
                  }`}
                >
                  <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>الفيديو</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] sm:px-2 sm:text-xs ${activeTab === 'videos' ? 'bg-white/20' : 'bg-[#8B7355]/10'}`}
                  >
                    {counts.videos}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('articles')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all sm:flex-none sm:gap-2 sm:px-6 sm:py-3 sm:text-sm ${
                    activeTab === 'articles'
                      ? 'bg-gradient-to-r from-[#8B7355] to-[#654321] text-white shadow-lg'
                      : 'text-[#8B7355] hover:bg-[#8B7355]/10'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>المقالات</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] sm:px-2 sm:text-xs ${activeTab === 'articles' ? 'bg-white/20' : 'bg-[#8B7355]/10'}`}
                  >
                    {counts.articles}
                  </span>
                </button>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-2 lg:gap-6 xl:grid-cols-3">
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
                    className="content-card card-hover group cursor-pointer overflow-hidden"
                  >
                    <div className="relative mb-3 h-36 overflow-hidden rounded-xl sm:mb-4 sm:h-40 lg:h-48">
                      <img
                        src={
                          item.image_url ||
                          'https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg'
                        }
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute right-2 top-2 sm:right-3 sm:top-3">
                        {isNew && (
                          <span className="status-badge status-new px-2 py-1 text-[10px] sm:px-3 sm:text-xs">
                            جديد
                          </span>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <h3 className="line-clamp-2 text-sm font-bold leading-tight text-[#2D2D2D] transition-colors group-hover:text-[#8B7355] sm:text-base lg:text-lg">
                        {item.title}
                      </h3>
                      <p className="line-clamp-2 text-xs leading-relaxed text-[#6B7280] sm:text-sm">
                        {item.description || 'لا يوجد وصف'}
                      </p>
                      <div className="flex items-center justify-between border-t border-[#8B7355]/10 pt-2">
                        <div className="flex items-center gap-1 text-xs text-[#6B7280] sm:gap-2">
                          <Clock className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                          <span className="truncate">{formattedDate}</span>
                        </div>
                        <button
                          onClick={(e) => handleLikeToggle(item.id, e)}
                          className={`flex flex-shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs transition-all sm:gap-2 sm:px-3 sm:py-1.5 ${
                            isLiked
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'text-[#8B7355] hover:bg-[#8B7355]/10'
                          }`}
                        >
                          <Heart
                            className={`h-3 w-3 sm:h-4 sm:w-4 ${isLiked ? 'fill-current' : ''}`}
                          />
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
          <aside className="w-full space-y-4 sm:space-y-6 lg:w-1/4 lg:min-w-[280px]">
            {/* Discussion Topics */}
            <div className="content-card">
              <div className="mb-4 flex items-center justify-between sm:mb-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#2D2D2D] sm:text-lg lg:text-xl">
                    مواضيع النقاش
                  </h3>
                  {discussionTopics.length > 0 && (
                    <span className="rounded-full bg-[#8B7355] px-2 py-0.5 text-[10px] font-semibold text-white sm:py-1 sm:text-xs">
                      {discussionTopics.length}
                    </span>
                  )}
                </div>
                <MessageCircle className="h-4 w-4 flex-shrink-0 text-[#8B7355] sm:h-5 sm:w-5" />
              </div>
              <div className="scrollbar-hide max-h-[400px] space-y-2 overflow-y-auto sm:max-h-[500px] sm:space-y-3">
                {discussionTopics.length === 0 ? (
                  <div className="py-6 text-center sm:py-8">
                    <MessageCircle className="mx-auto mb-2 h-10 w-10 text-[#8B7355]/30 sm:mb-3 sm:h-12 sm:w-12" />
                    <p className="text-xs text-[#6B7280] sm:text-sm">لا توجد نقاشات حالياً</p>
                  </div>
                ) : (
                  discussionTopics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicClick(topic)}
                      className="group w-full rounded-xl border border-transparent p-3 text-right transition-all hover:border-[#8B7355]/20 hover:bg-[#8B7355]/5 sm:p-4"
                    >
                      <h4 className="mb-2 line-clamp-2 text-xs font-semibold text-[#2D2D2D] transition-colors group-hover:text-[#8B7355] sm:text-sm lg:text-base">
                        {topic.title}
                      </h4>
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[10px] text-[#6B7280] sm:text-xs">
                          {new Date(topic.created_at).toLocaleDateString('ar-SA')}
                        </span>
                        <span className="whitespace-nowrap rounded-full bg-[#8B7355]/10 px-1.5 py-0.5 text-[10px] text-[#8B7355] sm:px-2 sm:py-1 sm:text-xs">
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
              <div className="mb-4 flex items-center justify-between sm:mb-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#2D2D2D] sm:text-lg lg:text-xl">
                    الفعاليات القادمة
                  </h3>
                  {upcomingEvents.length > 0 && (
                    <span className="rounded-full bg-[#8B7355] px-2 py-0.5 text-[10px] font-semibold text-white sm:py-1 sm:text-xs">
                      {upcomingEvents.length}
                    </span>
                  )}
                </div>
                <Bell className="h-4 w-4 flex-shrink-0 text-[#8B7355] sm:h-5 sm:w-5" />
              </div>
              <div className="scrollbar-hide max-h-[400px] space-y-3 overflow-y-auto sm:max-h-[500px] sm:space-y-4">
                {upcomingEvents.length === 0 ? (
                  <div className="py-6 text-center sm:py-8">
                    <Bell className="mx-auto mb-2 h-10 w-10 text-[#8B7355]/30 sm:mb-3 sm:h-12 sm:w-12" />
                    <p className="text-xs text-[#6B7280] sm:text-sm">لا توجد فعاليات قادمة</p>
                  </div>
                ) : (
                  upcomingEvents.map((event) => {
                    const eventDate = new Date(event.start_date);
                    const formattedDate = eventDate.toLocaleDateString('ar-SA', {
                      month: 'short',
                      day: 'numeric',
                    });

                    const eventTypeLabel =
                      event.event_type === 'course'
                        ? 'دورة'
                        : event.event_type === 'workshop'
                          ? 'ورشة عمل'
                          : event.event_type === 'seminar'
                            ? 'ندوة'
                            : 'ويبينار';

                    return (
                      <div
                        key={event.id}
                        className="group rounded-xl border border-[#8B7355]/10 bg-gradient-to-r from-[#8B7355]/5 to-[#D4AF37]/5 p-3 transition-all hover:border-[#8B7355]/30 sm:p-4"
                      >
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 sm:mb-3">
                          <span
                            className={`status-badge px-2 py-1 text-[10px] sm:text-xs ${
                              event.event_type === 'workshop'
                                ? 'status-trending'
                                : event.event_type === 'course'
                                  ? 'status-new'
                                  : 'status-featured'
                            }`}
                          >
                            {eventTypeLabel}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-[#6B7280] sm:text-sm">
                            <Clock className="h-3 w-3" />
                            {formattedDate}
                          </span>
                        </div>
                        <h4 className="mb-2 line-clamp-2 text-xs font-semibold text-[#2D2D2D] transition-colors group-hover:text-[#8B7355] sm:text-sm lg:text-base">
                          {event.title}
                        </h4>
                        {event.instructor_name && (
                          <p className="mb-2 truncate text-[10px] text-[#6B7280] sm:mb-3 sm:text-xs">
                            المدرب: {event.instructor_name}
                          </p>
                        )}
                        <button
                          onClick={() => {
                            if (event.registration_link) {
                              window.open(event.registration_link, '_blank');
                            } else {
                              alert('رابط التسجيل غير متوفر حالياً');
                            }
                          }}
                          className="btn-primary w-full py-1.5 text-xs sm:py-2 sm:text-sm"
                        >
                          {event.event_type === 'course'
                            ? 'دورة'
                            : event.event_type === 'workshop'
                              ? 'ورشة عمل'
                              : 'ندوة'}
                        </button>
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
        className="glass-effect group fixed bottom-3 left-3 z-40 rounded-2xl p-2.5 shadow-xl transition-all hover:shadow-2xl sm:bottom-6 sm:left-6 sm:p-3 lg:bottom-8 lg:left-8 lg:p-4"
        aria-label="فتح المساعد الذكي"
      >
        <div className="relative">
          <MessageCircle className="h-5 w-5 text-[#8B7355] transition-transform group-hover:scale-110 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
          <div className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] sm:-right-1 sm:-top-1 sm:h-4 sm:w-4">
            <Brain className="h-1.5 w-1.5 text-white sm:h-2 sm:w-2" />
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

      <AiChatModal isOpen={showAiChat} onClose={() => setShowAiChat(false)} />

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
