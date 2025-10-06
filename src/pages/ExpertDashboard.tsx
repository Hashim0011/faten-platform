import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, MessageSquare, BookOpen, Users, Plus, Trash2, Ban, UserX, CreditCard as Edit, Eye, Video, FileText, Book, Search, Filter, Settings, LogOut, Bell } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';
import { addContent, getPublishedContent, deleteContent, type ContentType } from '../lib/content';
import { getAllDiscussions, deleteMessage as deleteDiscussionMessage, createDiscussion, deleteDiscussion } from '../lib/discussions';
import { addEvent, getAllEvents, deleteEvent, type EventData } from '../lib/events';
import { getAllUsers, deleteUser } from '../lib/users';
import { createNotificationForAll } from '../lib/notifications';

interface Message {
  id: number;
  user: string;
  content: string;
  timestamp: string;
  userId: number;
}

interface Discussion {
  id: string;
  title: string;
  date: string;
  messages: Message[];
  participants: number;
  description?: string;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // بيانات نموذج إضافة المحتوى
  const [newContent, setNewContent] = useState({
    title: '',
    content_type: 'article' as ContentType,
    description: '',
    image_url: '',
  });

  const [discussions, setDiscussions] = useState<any[]>([]);
  const [contentList, setContentList] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // بيانات نموذج إنشاء نقاش
  const [showAddDiscussion, setShowAddDiscussion] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    description: '',
  });

  // تحميل جميع البيانات من الداتا بيس
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    console.log('🔄 Loading all data...');

    // تحميل المحتويات
    const contentResult = await getPublishedContent();
    console.log('📚 Content result:', contentResult);
    if (contentResult.success && contentResult.data) {
      console.log('✅ Setting content list with', contentResult.data.length, 'items');
      setContentList(contentResult.data);
    } else {
      console.error('❌ Failed to load content:', contentResult.error);
    }

    // تحميل النقاشات
    const discussionsResult = await getAllDiscussions();
    if (discussionsResult.success && discussionsResult.data) {
      setDiscussions(discussionsResult.data);
    }

    // تحميل الفعاليات
    const eventsResult = await getAllEvents();
    if (eventsResult.success && eventsResult.data) {
      setEvents(eventsResult.data);
    }

    // تحميل المستخدمين
    const usersResult = await getAllUsers();
    if (usersResult.success && usersResult.data) {
      const regularUsers = usersResult.data.filter((u: any) => u.role === 'user');
      setUsers(regularUsers);
    }
  };

  const loadContent = async () => {
    const result = await getPublishedContent();
    if (result.success && result.data) {
      setContentList(result.data);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const result = await deleteDiscussionMessage(messageId);
    if (result.success) {
      // إعادة تحميل النقاشات بعد الحذف
      await loadAllData();
      // إعادة تحديد النقاش الحالي
      if (selectedDiscussion) {
        const updatedDiscussion = discussions.find(d => d.id === selectedDiscussion.id);
        setSelectedDiscussion(updatedDiscussion || null);
      }
    }
  };

  const handleBlockUser = (userId: number) => {
    console.log(`Blocking user ${userId}`);
    alert('ميزة حظر المستخدم قيد التطوير');
  };

  const handleRemoveUser = (userId: number) => {
    console.log(`Removing user ${userId}`);
    alert('ميزة إزالة المستخدم قيد التطوير');
  };

  const handleDeleteContent = async (contentId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المحتوى؟')) {
      const result = await deleteContent(contentId);
      if (result.success) {
        setContentList(contentList.filter(content => content.id !== contentId));
        alert('تم حذف المحتوى بنجاح');
      } else {
        alert('حدث خطأ أثناء حذف المحتوى');
      }
    }
  };

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await addContent(newContent);

    if (result.success) {
      // إعادة تحميل جميع البيانات
      await loadAllData();
      // إغلاق النموذج وإعادة تعيين الحقول
      setShowAddContent(false);
      setNewContent({
        title: '',
        content_type: 'article',
        description: '',
        image_url: '',
      });
      alert('تم إضافة المحتوى بنجاح');
    } else {
      setError(result.error || 'حدث خطأ أثناء إضافة المحتوى');
    }

    setLoading(false);
  };

  const handleAddDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDiscussion.title.trim()) {
      setError('الرجاء إدخال عنوان النقاش');
      return;
    }

    setLoading(true);
    setError('');

    const result = await createDiscussion(newDiscussion.title, newDiscussion.description);

    if (result.success) {
      // إرسال إشعار لجميع المستخدمين
      await createNotificationForAll(
        'new_discussion',
        'نقاش جديد',
        `تم إنشاء نقاش جديد: ${newDiscussion.title}`,
        `/discussions/${result.data.id}`
      );

      // إعادة تحميل النقاشات
      await loadAllData();

      // إغلاق النموذج وإعادة تعيين الحقول
      setShowAddDiscussion(false);
      setNewDiscussion({
        title: '',
        description: '',
      });

      alert('تم إنشاء النقاش بنجاح وإرسال إشعار لجميع المستخدمين');
    } else {
      setError(result.error || 'حدث خطأ أثناء إنشاء النقاش');
    }

    setLoading(false);
  };

  const handleDeleteDiscussion = async (discussionId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا النقاش؟')) {
      const result = await deleteDiscussion(discussionId);
      if (result.success) {
        await loadAllData();
        setSelectedDiscussion(null);
        alert('تم حذف النقاش بنجاح');
      } else {
        alert('حدث خطأ أثناء حذف النقاش: ' + result.error);
      }
    }
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
      <div className="w-80 glass-effect border-r border-[#8B5CF6]/20 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#8B5CF6]/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center">
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
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow-lg'
                  : 'text-[#8B5CF6] hover:bg-[#8B5CF6]/10'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">النقاشات الأسبوعية</span>
            </button>

            <button
              onClick={() => setActiveSection('content')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl text-right transition-all ${
                activeSection === 'content'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow-lg'
                  : 'text-[#8B5CF6] hover:bg-[#8B5CF6]/10'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">إدارة المحتوى</span>
            </button>

            <button
              onClick={() => setActiveSection('users')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl text-right transition-all ${
                activeSection === 'users'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow-lg'
                  : 'text-[#8B5CF6] hover:bg-[#8B5CF6]/10'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">قائمة المستخدمين</span>
            </button>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#8B5CF6]/20">
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
        <div className="glass-effect border-b border-[#8B5CF6]/10 p-6">
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
                className="p-2 rounded-xl hover:bg-[#8B5CF6]/10 transition-colors relative"
              >
                <Bell className="w-5 h-5 text-[#8B5CF6]" />
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
              {activeSection === 'discussions' && (
                <button
                  onClick={() => setShowAddDiscussion(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>إنشاء نقاش جديد</span>
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
                  {discussions.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-16 h-16 mx-auto text-[#8B5CF6]/30 mb-4" />
                      <p className="text-[#6B7280]">لا توجد نقاشات حالياً</p>
                      <p className="text-sm text-[#6B7280] mt-2">انقر على "إنشاء نقاش جديد" لبدء نقاش</p>
                    </div>
                  ) : (
                    discussions.map(discussion => (
                      <div
                        key={discussion.id}
                        className={`relative p-4 rounded-xl text-right transition-all border-2 ${
                          selectedDiscussion?.id === discussion.id
                            ? 'border-[#8B5CF6] bg-[#8B5CF6]/5'
                            : 'border-transparent hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5'
                        }`}
                      >
                        <button
                          onClick={() => setSelectedDiscussion(discussion)}
                          className="w-full text-right"
                        >
                          <h4 className="font-semibold text-[#2D2D2D] mb-2">{discussion.title}</h4>
                          <div className="flex items-center justify-between text-sm text-[#6B7280]">
                            <span>{new Date(discussion.created_at).toLocaleDateString('ar-SA')}</span>
                            <div className="flex items-center gap-4">
                              <span>{discussion.messages?.[0]?.count || 0} رسالة</span>
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => handleDeleteDiscussion(discussion.id)}
                          className="absolute top-2 left-2 p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                          title="حذف النقاش"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
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
                        <div key={message.id} className="p-4 rounded-xl bg-[#8B5CF6]/5 border border-[#8B5CF6]/10">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-sm font-semibold">
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
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B5CF6] w-5 h-5 pointer-events-none" />
                </div>
                <button className="btn-secondary flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span>تصفية</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contentList.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto text-[#8B5CF6]/30 mb-4" />
                    <p className="text-[#6B7280]">لا يوجد محتوى بعد. ابدأ بإضافة محتوى جديد!</p>
                  </div>
                ) : (
                  contentList.map(content => (
                  <div key={content.id} className="content-card card-hover group">
                    <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
                      <img
                        src={content.image_url || 'https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg'}
                        alt={content.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="status-badge status-new">{getContentTypeLabel(content.content_type)}</span>
                      </div>
                      <div className="absolute top-3 left-3 flex gap-2">
                        <button className="p-2 rounded-lg bg-white/90 hover:bg-white text-[#8B5CF6] transition-colors">
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
                        {getContentIcon(content.content_type)}
                        <h3 className="text-[#2D2D2D] font-bold text-lg leading-tight">{content.title}</h3>
                      </div>
                      <p className="text-[#6B7280] text-sm leading-relaxed">{content.description || 'لا يوجد وصف'}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-[#8B5CF6]/10">
                        <span className="text-sm text-[#6B7280]">{new Date(content.created_at).toLocaleDateString('ar-SA')}</span>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-[#8B5CF6] font-semibold">منشور</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
                )}
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
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8B5CF6] w-4 h-4 pointer-events-none" />
                  </div>
                  <button className="btn-secondary flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>تصفية</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#8B7355]/20">
                      <th className="text-right p-4 font-semibold text-[#2D2D2D]">المستخدم</th>
                      <th className="text-right p-4 font-semibold text-[#2D2D2D]">البريد الإلكتروني</th>
                      <th className="text-right p-4 font-semibold text-[#2D2D2D]">تاريخ التسجيل</th>
                      <th className="text-right p-4 font-semibold text-[#2D2D2D]">الحالة</th>
                      <th className="text-right p-4 font-semibold text-[#2D2D2D]">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center">
                          <Users className="w-16 h-16 mx-auto text-[#8B5CF6]/30 mb-4" />
                          <p className="text-[#6B7280]">لا يوجد مستخدمون في قاعدة البيانات</p>
                        </td>
                      </tr>
                    ) : (
                      users.map(user => (
                        <tr key={user.id} className="border-b border-[#8B7355]/10 hover:bg-[#8B5CF6]/5 transition-colors">
                          <td className="p-4">
                            <div className="font-semibold text-[#2D2D2D]">{user.full_name || 'مستخدم'}</div>
                          </td>
                          <td className="p-4 text-[#6B7280]">{user.email}</td>
                          <td className="p-4 text-[#6B7280]">
                            {new Date(user.created_at).toLocaleDateString('ar-SA')}
                          </td>
                          <td className="p-4">
                            <span className="status-badge status-trending">نشط</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserDetails(true);
                                }}
                                className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
                                    const result = await deleteUser(user.id);
                                    if (result.success) {
                                      alert('تم حذف المستخدم بنجاح');
                                      await loadAllData();
                                    } else {
                                      alert('حدث خطأ أثناء حذف المستخدم: ' + result.error);
                                    }
                                  }
                                }}
                                className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Content Modal */}
      {showAddContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#8B5CF6]/20 flex-shrink-0">
              <h3 className="text-xl font-bold text-[#2D2D2D]">إضافة محتوى جديد</h3>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleAddContent} className="space-y-6">
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">عنوان المحتوى</label>
                  <input
                    type="text"
                    className="input-modern w-full"
                    placeholder="أدخل عنوان المحتوى"
                    value={newContent.title}
                    onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">نوع المحتوى</label>
                  <select
                    className="input-modern w-full"
                    value={newContent.content_type}
                    onChange={(e) => setNewContent({ ...newContent, content_type: e.target.value as ContentType })}
                  >
                    <option value="book">كتاب</option>
                    <option value="video">فيديو</option>
                    <option value="article">مقال</option>
                    <option value="course">دورة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">الوصف</label>
                  <textarea
                    className="input-modern w-full h-24 resize-none"
                    placeholder="أدخل وصف المحتوى"
                    value={newContent.description}
                    onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">رابط الصورة (اختياري)</label>
                  <input
                    type="url"
                    className="input-modern w-full"
                    placeholder="https://example.com/image.jpg"
                    value={newContent.image_url}
                    onChange={(e) => setNewContent({ ...newContent, image_url: e.target.value })}
                  />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-[#8B5CF6]/20 flex gap-3 flex-shrink-0">
              <button
                onClick={(e) => handleAddContent(e as any)}
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {loading ? 'جاري الإضافة...' : 'إضافة المحتوى'}
              </button>
              <button
                onClick={() => {
                  setShowAddContent(false);
                  setError('');
                  setNewContent({
                    title: '',
                    content_type: 'article',
                    description: '',
                    image_url: '',
                  });
                }}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Discussion Modal */}
      {showAddDiscussion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-[#8B5CF6]/20">
              <h3 className="text-xl font-bold text-[#2D2D2D]">إنشاء نقاش جديد</h3>
            </div>
            <div className="p-6">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleAddDiscussion} className="space-y-6">
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">عنوان النقاش</label>
                  <input
                    type="text"
                    className="input-modern w-full"
                    placeholder="أدخل عنوان النقاش"
                    value={newDiscussion.title}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">وصف النقاش (اختياري)</label>
                  <textarea
                    className="input-modern w-full h-32 resize-none"
                    placeholder="أدخل وصف النقاش أو الأسئلة الرئيسية"
                    value={newDiscussion.description}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, description: e.target.value })}
                  ></textarea>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-[#8B5CF6]/20 flex gap-3">
              <button
                onClick={(e) => handleAddDiscussion(e as any)}
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {loading ? 'جاري الإنشاء...' : 'إنشاء النقاش'}
              </button>
              <button
                onClick={() => {
                  setShowAddDiscussion(false);
                  setError('');
                  setNewDiscussion({
                    title: '',
                    description: '',
                  });
                }}
                disabled={loading}
                className="btn-secondary flex-1"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-[#8B5CF6]/20">
              <h3 className="text-xl font-bold text-[#2D2D2D]">تفاصيل المستخدم</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#6B7280] mb-1">الاسم الكامل</label>
                <p className="text-[#2D2D2D] font-semibold">{selectedUser.full_name || 'غير محدد'}</p>
              </div>
              <div>
                <label className="block text-sm text-[#6B7280] mb-1">البريد الإلكتروني</label>
                <p className="text-[#2D2D2D] font-semibold">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm text-[#6B7280] mb-1">رقم الهاتف</label>
                <p className="text-[#2D2D2D] font-semibold">{selectedUser.phone || 'غير محدد'}</p>
              </div>
              <div>
                <label className="block text-sm text-[#6B7280] mb-1">الدور</label>
                <p className="text-[#2D2D2D] font-semibold">
                  {selectedUser.role === 'user' ? 'مستخدم' : selectedUser.role === 'expert' ? 'خبير' : 'مدير'}
                </p>
              </div>
              <div>
                <label className="block text-sm text-[#6B7280] mb-1">تاريخ التسجيل</label>
                <p className="text-[#2D2D2D] font-semibold">
                  {new Date(selectedUser.created_at).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm text-[#6B7280] mb-1">الحالة</label>
                <span className="status-badge status-trending">نشط</span>
              </div>
            </div>
            <div className="p-6 border-t border-[#8B5CF6]/20 flex justify-end">
              <button
                onClick={() => {
                  setShowUserDetails(false);
                  setSelectedUser(null);
                }}
                className="btn-secondary"
              >
                إغلاق
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