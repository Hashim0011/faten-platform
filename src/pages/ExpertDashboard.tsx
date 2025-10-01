import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, MessageSquare, BookOpen, Users, Plus, Trash2, Ban, UserX, CreditCard as Edit, Eye, Video, FileText, Book, Search, Filter, Settings, LogOut, Bell } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';

interface Message {
  id: number;
  user: string;
  content: string;
  timestamp: string;
  userId: number;
}

interface Discussion {
  id: number;
  title: string;
  date: string;
  messages: Message[];
  participants: number;
}

interface Content {
  id: number;
  title: string;
  type: 'book' | 'video' | 'article';
  description: string;
  date: string;
  likes: number;
  image: string;
}

const ExpertDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('discussions');
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [showAddContent, setShowAddContent] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications] = useState(3); // عدد الإشعارات غير المقروءة للخبير

  const discussions: Discussion[] = [
    {
      id: 1,
      title: "دور الأسرة في تعزيز الأمن الفكري",
      date: "2024/03/15",
      participants: 24,
      messages: [
        { id: 1, user: "أحمد محمد", content: "موضوع مهم جداً، الأسرة هي الأساس في بناء الشخصية", timestamp: "14:30", userId: 101 },
        { id: 2, user: "فاطمة السالم", content: "أتفق معك، التربية الصحيحة تبدأ من البيت", timestamp: "14:35", userId: 102 },
        { id: 3, user: "محمد العتيبي", content: "هل يمكن تطبيق هذا في العصر الرقمي؟", timestamp: "14:40", userId: 103 }
      ]
    },
    {
      id: 2,
      title: "التحديات المعاصرة للشباب",
      date: "2024/03/14",
      participants: 18,
      messages: [
        { id: 4, user: "سارة أحمد", content: "الشباب يواجهون تحديات كبيرة في وسائل التواصل", timestamp: "16:20", userId: 104 },
        { id: 5, user: "خالد الرشيد", content: "التوجيه الصحيح مهم جداً", timestamp: "16:25", userId: 105 }
      ]
    },
    {
      id: 3,
      title: "الوسطية في الإسلام",
      date: "2024/03/13",
      participants: 32,
      messages: [
        { id: 6, user: "عبدالله النمر", content: "الوسطية منهج حياة شامل", timestamp: "10:15", userId: 106 },
        { id: 7, user: "نورا الحربي", content: "كيف نطبق الوسطية في حياتنا اليومية؟", timestamp: "10:20", userId: 107 }
      ]
    }
  ];

  const [contentList, setContentList] = useState<Content[]>([
    {
      id: 1,
      title: "أسس الأمن الفكري",
      type: "book",
      description: "دليل شامل لفهم وتطبيق مبادئ الأمن الفكري",
      date: "2024/03/01",
      likes: 167,
      image: "https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg"
    },
    {
      id: 2,
      title: "الوسطية في الإسلام",
      type: "video",
      description: "سلسلة تعليمية عن مفهوم الوسطية",
      date: "2024/03/13",
      likes: 278,
      image: "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg"
    },
    {
      id: 3,
      title: "التحديات المعاصرة للأمن الفكري",
      type: "article",
      description: "تحليل للتحديات التي تواجه الشباب",
      date: "2024/03/10",
      likes: 203,
      image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg"
    }
  ]);

  const handleDeleteMessage = (messageId: number) => {
    if (selectedDiscussion) {
      const updatedMessages = selectedDiscussion.messages.filter(msg => msg.id !== messageId);
      setSelectedDiscussion({
        ...selectedDiscussion,
        messages: updatedMessages
      });
    }
  };

  const handleBlockUser = (userId: number) => {
    console.log(`Blocking user ${userId}`);
    // Implement block user logic
  };

  const handleRemoveUser = (userId: number) => {
    console.log(`Removing user ${userId}`);
    // Implement remove user logic
  };

  const handleDeleteContent = (contentId: number) => {
    setContentList(contentList.filter(content => content.id !== contentId));
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'book': return <Book className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'article': return <FileText className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'book': return 'كتاب';
      case 'video': return 'فيديو';
      case 'article': return 'مقال';
      default: return 'محتوى';
    }
  };

  const handleLogout = () => {
    navigate('/');
  };
  return (
    <div className="min-h-screen bg-pattern flex">
      {/* Sidebar */}
      <div className="w-80 glass-effect border-r border-[#8B7355]/20 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#8B7355]/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B7355] to-[#654321] flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">لوحة الخبير</h1>
              <p className="text-sm text-[#6B7280]">إدارة المحتوى والنقاشات</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveSection('discussions')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl text-right transition-all ${
                activeSection === 'discussions'
                  ? 'bg-gradient-to-r from-[#8B7355] to-[#654321] text-white shadow-lg'
                  : 'text-[#8B7355] hover:bg-[#8B7355]/10'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">النقاشات الأسبوعية</span>
            </button>

            <button
              onClick={() => setActiveSection('content')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl text-right transition-all ${
                activeSection === 'content'
                  ? 'bg-gradient-to-r from-[#8B7355] to-[#654321] text-white shadow-lg'
                  : 'text-[#8B7355] hover:bg-[#8B7355]/10'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">إدارة المحتوى</span>
            </button>

            <button
              onClick={() => setActiveSection('users')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl text-right transition-all ${
                activeSection === 'users'
                  ? 'bg-gradient-to-r from-[#8B7355] to-[#654321] text-white shadow-lg'
                  : 'text-[#8B7355] hover:bg-[#8B7355]/10'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">قائمة المستخدمين</span>
            </button>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#8B7355]/20">
          <div className="flex gap-2">
            <button className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2">
              <Settings className="w-4 h-4" />
              <span>الإعدادات</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="glass-effect border-b border-[#8B7355]/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#2D2D2D]">
                {activeSection === 'discussions' && 'النقاشات الأسبوعية'}
                {activeSection === 'content' && 'إدارة المحتوى'}
                {activeSection === 'users' && 'قائمة المستخدمين'}
              </h2>
              <p className="text-[#6B7280] mt-1">
                {activeSection === 'discussions' && 'إدارة ومراقبة النقاشات'}
                {activeSection === 'content' && 'إضافة وحذف المحتوى التعليمي'}
                {activeSection === 'users' && 'إدارة المستخدمين والصلاحيات'}
              </p>
            </div>
            <div className="flex items-center gap-3">
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
              {activeSection === 'content' && (
                <button
                  onClick={() => setShowAddContent(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة محتوى</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Discussions Section */}
          {activeSection === 'discussions' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Discussions List */}
              <div className="content-card">
                <h3 className="text-xl font-bold text-[#2D2D2D] mb-6">مواضيع النقاش</h3>
                <div className="space-y-4">
                  {discussions.map(discussion => (
                    <button
                      key={discussion.id}
                      onClick={() => setSelectedDiscussion(discussion)}
                      className={`w-full p-4 rounded-xl text-right transition-all border-2 ${
                        selectedDiscussion?.id === discussion.id
                          ? 'border-[#8B7355] bg-[#8B7355]/5'
                          : 'border-transparent hover:border-[#8B7355]/30 hover:bg-[#8B7355]/5'
                      }`}
                    >
                      <h4 className="font-semibold text-[#2D2D2D] mb-2">{discussion.title}</h4>
                      <div className="flex items-center justify-between text-sm text-[#6B7280]">
                        <span>{discussion.date}</span>
                        <div className="flex items-center gap-4">
                          <span>{discussion.messages.length} رسالة</span>
                          <span>{discussion.participants} مشارك</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Discussion Messages */}
              <div className="content-card">
                {selectedDiscussion ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-[#2D2D2D]">{selectedDiscussion.title}</h3>
                      <span className="text-sm text-[#6B7280]">{selectedDiscussion.messages.length} رسالة</span>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {selectedDiscussion.messages.map(message => (
                        <div key={message.id} className="p-4 rounded-xl bg-[#8B7355]/5 border border-[#8B7355]/10">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#8B7355] text-white flex items-center justify-center text-sm font-semibold">
                                {message.user[0]}
                              </div>
                              <div>
                                <span className="font-semibold text-[#2D2D2D]">{message.user}</span>
                                <span className="text-sm text-[#6B7280] mr-2">{message.timestamp}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleBlockUser(message.userId)}
                                className="p-1 rounded hover:bg-yellow-100 text-yellow-600"
                                title="حظر المستخدم"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveUser(message.userId)}
                                className="p-1 rounded hover:bg-red-100 text-red-600"
                                title="إزالة المستخدم"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="p-1 rounded hover:bg-red-100 text-red-600"
                                title="حذف الرسالة"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[#2D2D2D]">{message.content}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-64 text-[#6B7280]">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>اختر نقاشاً لعرض الرسائل</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content Management Section */}
          {activeSection === 'content' && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="البحث في المحتوى..."
                    className="input-modern w-full has-right-icon"
                  />
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5 pointer-events-none" />
                </div>
                <button className="btn-secondary flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span>تصفية</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contentList.map(content => (
                  <div key={content.id} className="content-card card-hover group">
                    <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
                      <img
                        src={content.image}
                        alt={content.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="status-badge status-new">{getContentTypeLabel(content.type)}</span>
                      </div>
                      <div className="absolute top-3 left-3 flex gap-2">
                        <button className="p-2 rounded-lg bg-white/90 hover:bg-white text-[#8B7355] transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteContent(content.id)}
                          className="p-2 rounded-lg bg-white/90 hover:bg-red-500 hover:text-white text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {getContentIcon(content.type)}
                        <h3 className="text-[#2D2D2D] font-bold text-lg leading-tight">{content.title}</h3>
                      </div>
                      <p className="text-[#6B7280] text-sm leading-relaxed">{content.description}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-[#8B7355]/10">
                        <span className="text-sm text-[#6B7280]">{content.date}</span>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-[#8B7355] font-semibold">{content.likes}</span>
                          <span className="text-red-500">❤️</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Section */}
          {activeSection === 'users' && (
            <div className="content-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#2D2D2D]">قائمة المستخدمين</h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="البحث عن مستخدم..."
                     className="input-modern has-right-icon"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-4 h-4 pointer-events-none" />
                  </div>
                  <button className="btn-secondary flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>تصفية</span>
                  </button>
                </div>
              </div>
              <div className="text-center py-12 text-[#6B7280]">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>قائمة المستخدمين قيد التطوير</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Content Modal */}
      {showAddContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-[#8B7355]/20">
              <h3 className="text-xl font-bold text-[#2D2D2D]">إضافة محتوى جديد</h3>
            </div>
            <div className="p-6">
              <form className="space-y-6">
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">عنوان المحتوى</label>
                  <input
                    type="text"
                    className="input-modern w-full"
                    placeholder="أدخل عنوان المحتوى"
                  />
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">نوع المحتوى</label>
                  <select className="input-modern w-full">
                    <option value="book">كتاب</option>
                    <option value="video">فيديو</option>
                    <option value="article">مقال</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">الوصف</label>
                  <textarea
                    className="input-modern w-full h-24 resize-none"
                    placeholder="أدخل وصف المحتوى"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">رابط الصورة</label>
                  <input
                    type="url"
                    className="input-modern w-full"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-[#8B7355]/20 flex gap-3">
              <button className="btn-primary flex-1">إضافة المحتوى</button>
              <button
                onClick={() => setShowAddContent(false)}
                className="btn-secondary flex-1"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        userRole="expert"
      />
    </div>
  );
};

export default ExpertDashboard;