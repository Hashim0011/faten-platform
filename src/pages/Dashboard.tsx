import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Search, Book, Video, FileText, Mail, LogOut, MessageCircle, Bell, Settings, Clock, Filter, Users, Star } from 'lucide-react';
import DiscussionModal from '../components/DiscussionModal';
import AiChatModal from '../components/AiChatModal';

type Topic = { id: number; title: string; date: string };

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'books' | 'videos' | 'articles'>('books');
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const parseDate = (d: string) => {
    const [y, m, day] = d.split('/').map(Number);
    return new Date(y, m - 1, day);
  };

  const isWithinDays = (d: Date, days: number) => {
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= days && diff >= 0;
  };

  const formatInt = (n: number) => n.toLocaleString('en-US');

  const discussionTopics: Topic[] = [
    { id: 1, title: "دور الأسرة في تعزيز الأمن الفكري", date: "2026/03/15" },
    { id: 2, title: "التحديات المعاصرة للشباب", date: "2026/03/14" },
    { id: 3, title: "الوسطية في الإسلام", date: "2026/03/13" }
  ];

  const upcomingEvents = [
    { id: 1, title: "ورشة عمل تعزيز الهوية الوطنية", date: "2026/03/20", type: "ورشة" },
    { id: 2, title: "دورة مهارات التفكير النقدي", date: "2026/03/25", type: "دورة" },
    { id: 3, title: "محاضرة الأمن الفكري في العصر الرقمي", date: "2026/03/28", type: "محاضرة" }
  ];

  const libraryContent = {
    books: [
      { id: 1, title: "أسس الأمن الفكري", desc: "دليل شامل لفهم وتطبيق مبادئ الأمن الفكري", date: "2026/03/01", likes: 167, image: "https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg" },
      { id: 2, title: "تعزيز الهوية الوطنية", desc: "دراسة عن أهمية الهوية الوطنية وحمايتها", date: "2026/03/20", likes: 189, image: "https://images.pexels.com/photos/5834/nature-grass-leaf-green.jpg" },
      { id: 3, title: "التربية الإسلامية والأمن الفكري", desc: "العلاقة بين التربية الإسلامية وتحقيق الأمن الفكري", date: "2026/03/05", likes: 145, image: "https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg" },
      { id: 4, title: "مهارات التفكير النقدي", desc: "دليل عملي لتنمية مهارات التفكير النقدي", date: "2024/03/10", likes: 178, image: "https://images.pexels.com/photos/3755755/pexels-photo-3755755.jpeg" }
    ],
    videos: [
      { id: 1, title: "الوسطية في الإسلام", desc: "سلسلة تعليمية عن مفهوم الوسطية", date: "2026/03/13", likes: 278, image: "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg" },
      { id: 2, title: "محاضرة عن التطرف الفكري", desc: "محاضرة توعوية حول مخاطر التطرف", date: "2026/03/15", likes: 312, image: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg" },
      { id: 3, title: "دور الأسرة في التربية", desc: "حلقة نقاشية عن دور الأسرة", date: "2026/03/18", likes: 245, image: "https://images.pexels.com/photos/7282476/pexels-photo-7282476.jpeg" },
      { id: 4, title: "حماية الشباب من الانحراف", desc: "ندوة حول حماية الشباب", date: "2026/03/20", likes: 198, image: "https://images.pexels.com/photos/3760529/pexels-photo-3760529.jpeg" }
    ],
    articles: [
      { id: 1, title: "التحديات المعاصرة للأمن الفكري", desc: "تحليل للتحديات التي تواجه الشباب", date: "2026/03/10", likes: 203, image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg" },
      { id: 2, title: "دور الأسرة في تعزيز الأمن الفكري", desc: "مقال يناقش أهمية دور الأسرة", date: "2026/03/18", likes: 156, image: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg" },
      { id: 3, title: "الإعلام والأمن الفكري", desc: "تأثير وسائل الإعلام على الأمن الفكري", date: "2026/03/15", likes: 167, image: "https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg" },
      { id: 4, title: "التعليم ودوره في الأمن الفكري", desc: "أهمية التعليم في تحقيق الأمن الفكري", date: "2026/03/12", likes: 189, image: "https://images.pexels.com/photos/3769714/pexels-photo-3769714.jpeg" }
    ]
  };

  const counts = useMemo(() => {
    const books = libraryContent.books.length;
    const videos = libraryContent.videos.length;
    const articles = libraryContent.articles.length;
    const total = books + videos + articles;

    
    const activeUsers = Math.max(300, total * 75);

    const rating = 4.6;

    return { books, videos, articles, total, activeUsers, rating };
  }, [libraryContent]);

  const filteredContent = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return libraryContent[activeTab];

    return libraryContent[activeTab].filter((item: any) =>
      [item.title, item.desc].some((t: string) => t.toLowerCase().includes(q.toLowerCase()))
    );
  }, [activeTab, searchQuery, libraryContent]);

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setShowDiscussion(true);
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
            <button className="p-2 rounded-xl hover:bg-[#8B7355]/10 transition-colors relative">
              <Bell className="w-5 h-5 text-[#8B7355]" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
            </button>
            <button className="btn-secondary text-xs sm:text-sm flex items-center gap-2 px-2 sm:px-4">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">تواصل معنا</span>
            </button>
            <button className="p-2 rounded-xl hover:bg-[#8B7355]/10 transition-colors hidden sm:block">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Sidebar - النقاشات والفعاليات */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6 lg:order-2">
            {/* Discussion Topics */}
            <div className="content-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-[#2D2D2D]">مواضيع النقاش</h3>
                <MessageCircle className="w-5 h-5 text-[#8B7355]" />
              </div>
              <div className="space-y-3">
                {discussionTopics.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicClick(topic)}
                    className="w-full p-4 rounded-xl hover:bg-[#8B7355]/5 transition-all text-right group border border-transparent hover:border-[#8B7355]/20"
                  >
                    <h4 className="font-semibold text-sm sm:text-base text-[#2D2D2D] group-hover:text-[#8B7355] transition-colors mb-2">{topic.title}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#6B7280]">{topic.date}</span>
                      <span className="text-xs bg-[#8B7355]/10 text-[#8B7355] px-2 py-1 rounded-full">نشط</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="content-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-[#2D2D2D]">الفعاليات القادمة</h3>
                <Bell className="w-5 h-5 text-[#8B7355]" />
              </div>
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="p-4 rounded-xl bg-gradient-to-r from-[#8B7355]/5 to-[#D4AF37]/5 border border-[#8B7355]/10 hover:border-[#8B7355]/30 transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`status-badge ${
                        event.type === 'ورشة' ? 'status-new' : 
                        event.type === 'دورة' ? 'status-featured' : 'status-popular'
                      }`}>
                        {event.type}
                      </span>
                      <span className="text-sm text-[#6B7280] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.date}
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base text-[#2D2D2D] font-semibold group-hover:text-[#8B7355] transition-colors">{event.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - المحتوى الرئيسي */}
          <div className="lg:col-span-8 xl:col-span-9 lg:order-1">
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
                const d = parseDate(item.date);
                const isNew = isWithinDays(d, 30);
                return (
                  <div key={item.id} className="content-card card-hover group overflow-hidden">
                    <div className="relative h-40 sm:h-48 mb-4 rounded-xl overflow-hidden">
                      <img
                        src={item.image}
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
                      <p className="text-[#6B7280] text-xs sm:text-sm leading-relaxed line-clamp-2">{item.desc}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-[#8B7355]/10">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#6B7280]">
                          <Clock className="w-4 h-4" />
                          <span>{item.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <span className="text-[#8B7355] font-semibold">{formatInt(item.likes)}</span>
                          <span className="text-red-500">❤️</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
    </div>
  );
};

export default Dashboard;
