import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, MessageSquare, BookOpen, Plus, Trash2, Ban, UserX, CreditCard as Edit, Video, FileText, Book, Search, Filter, Settings, LogOut, Bell, Send } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';
import { addContent, getPublishedContent, deleteContent, updateContent, type ContentType } from '../lib/content';
import { getAllDiscussions, deleteMessage as deleteDiscussionMessage, createDiscussion, deleteDiscussion, addMessage } from '../lib/discussions';
import { banUserFromDiscussion } from '../lib/bans';
import { addEvent, getAllEvents, deleteEvent, type EventData } from '../lib/events';
import { createNotificationForAll, getUnreadCount } from '../lib/notifications';

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
  const [showEditContent, setShowEditContent] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // بيانات نموذج إضافة المحتوى
  const [newContent, setNewContent] = useState({
    title: '',
    content_type: 'article' as ContentType,
    description: '',
    image_url: '',
    file_url: '',
  });

  const [discussions, setDiscussions] = useState<any[]>([]);
  const [contentList, setContentList] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  // بيانات نموذج إنشاء نقاش
  const [showAddDiscussion, setShowAddDiscussion] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    description: '',
  });

  // حقل إرسال الرسالة
  const [newMessage, setNewMessage] = useState('');

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
    console.log('💬 Discussions result:', discussionsResult);
    if (discussionsResult.success && discussionsResult.data) {
      console.log('✅ Setting discussions list with', discussionsResult.data.length, 'discussions');
      setDiscussions(discussionsResult.data);
    } else {
      console.error('❌ Failed to load discussions:', discussionsResult.error);
    }

    // تحميل الفعاليات
    const eventsResult = await getAllEvents();
    if (eventsResult.success && eventsResult.data) {
      setEvents(eventsResult.data);
    }
  };

  const loadContent = async () => {
    const result = await getPublishedContent();
    if (result.success && result.data) {
      setContentList(result.data);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
      return;
    }

    if (!selectedDiscussion) return;

    console.log('🗑️ بدء حذف الرسالة:', messageId);

    try {
      // حذف الرسالة من قاعدة البيانات
      const result = await deleteDiscussionMessage(messageId);
      console.log('📝 نتيجة الحذف:', result);

      if (result.success) {
        console.log('✅ نجح الحذف من قاعدة البيانات');

        // تحديث الواجهة مباشرة بحذف الرسالة من المصفوفة
        const updatedMessages = selectedDiscussion.messages?.filter((m: any) => m.id !== messageId) || [];

        // تحديث النقاش المحدد
        const updatedDiscussion = {
          ...selectedDiscussion,
          messages: updatedMessages
        };

        // تحديث قائمة النقاشات
        const updatedDiscussions = discussions.map((d: any) =>
          d.id === selectedDiscussion.id ? updatedDiscussion : d
        );

        console.log('🔄 تحديث الواجهة...');
        console.log('📊 عدد الرسائل قبل:', selectedDiscussion.messages?.length);
        console.log('📊 عدد الرسائل بعد:', updatedMessages.length);

        // تحديث الحالة
        setDiscussions(updatedDiscussions);
        setSelectedDiscussion(updatedDiscussion);

        alert('تم حذف الرسالة بنجاح');
      } else {
        console.error('❌ فشل الحذف:', result.error);
        alert('حدث خطأ أثناء حذف الرسالة: ' + (result.error || 'خطأ غير معروف'));
      }
    } catch (error) {
      console.error('💥 خطأ غير متوقع:', error);
      alert('حدث خطأ غير متوقع: ' + error);
    }
  };

  const handleBlockUser = async (userId: string) => {
    if (!selectedDiscussion) return;

    const reason = prompt('السبب (اختياري):');
    if (reason === null) return; // ألغى المستخدم

    const currentDiscussionId = selectedDiscussion.id;
    console.log('🚫 بدء حظر المستخدم:', userId);

    const result = await banUserFromDiscussion(userId, currentDiscussionId, reason || undefined);

    if (result.success) {
      console.log('✅ نجح الحظر، جاري تحديث البيانات...');

      // مسح النقاش المحدد مؤقتاً
      setSelectedDiscussion(null);

      // إعادة تحميل النقاشات بعد الحظر
      const discussionsResult = await getAllDiscussions();
      if (discussionsResult.success && discussionsResult.data) {
        const newDiscussions = [...discussionsResult.data];
        setDiscussions(newDiscussions);

        setTimeout(() => {
          const updatedDiscussion = newDiscussions.find((d: any) => d.id === currentDiscussionId);
          if (updatedDiscussion) {
            setSelectedDiscussion({...updatedDiscussion});
          }
        }, 100);
      }

      alert('تم حظر المستخدم من النقاش بنجاح');
    } else {
      alert('حدث خطأ أثناء حظر المستخدم: ' + result.error);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!selectedDiscussion) return;

    if (!confirm('هل أنت متأكد من حذف جميع رسائل هذا المستخدم من النقاش؟')) {
      return;
    }

    console.log('❌ بدء حذف جميع رسائل المستخدم:', userId);

    try {
      // حذف جميع رسائل المستخدم في هذا النقاش
      const userMessages = selectedDiscussion.messages?.filter((m: any) => m.sender_id === userId) || [];

      console.log('📝 عدد الرسائل المراد حذفها:', userMessages.length);

      for (const message of userMessages) {
        await deleteDiscussionMessage(String(message.id));
      }

      console.log('✅ تم حذف', userMessages.length, 'رسالة من قاعدة البيانات');

      // تحديث الواجهة مباشرة بحذف رسائل المستخدم
      const updatedMessages = selectedDiscussion.messages?.filter((m: any) => m.sender_id !== userId) || [];

      // تحديث النقاش المحدد
      const updatedDiscussion = {
        ...selectedDiscussion,
        messages: updatedMessages
      };

      // تحديث قائمة النقاشات
      const updatedDiscussions = discussions.map((d: any) =>
        d.id === selectedDiscussion.id ? updatedDiscussion : d
      );

      console.log('📊 عدد الرسائل قبل:', selectedDiscussion.messages?.length);
      console.log('📊 عدد الرسائل بعد:', updatedMessages.length);

      // تحديث الحالة
      setDiscussions(updatedDiscussions);
      setSelectedDiscussion(updatedDiscussion);

      alert('تم حذف جميع رسائل المستخدم من النقاش (' + userMessages.length + ' رسالة)');
    } catch (error) {
      console.error('💥 خطأ:', error);
      alert('حدث خطأ أثناء حذف الرسائل');
    }
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
        file_url: '',
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDiscussion || !newMessage.trim()) {
      return;
    }

    setLoading(true);
    const result = await addMessage(selectedDiscussion.id, newMessage.trim());

    if (result.success) {
      // إعادة تحميل النقاشات
      await loadAllData();
      // تحديث النقاش المحدد
      const updatedDiscussion = discussions.find(d => d.id === selectedDiscussion.id);
      if (updatedDiscussion) {
        setSelectedDiscussion(updatedDiscussion);
      }
      // مسح حقل الإدخال
      setNewMessage('');
    } else {
      alert('حدث خطأ أثناء إرسال الرسالة: ' + result.error);
    }

    setLoading(false);
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

  const handleEditContent = (content: any) => {
    setSelectedContent(content);
    setNewContent({
      title: content.title,
      content_type: content.content_type,
      description: content.description || '',
      image_url: content.image_url || '',
      file_url: content.file_url || '',
    });
    setShowEditContent(true);
  };

  const handleUpdateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContent) return;

    setLoading(true);
    setError('');

    const result = await updateContent(selectedContent.id, newContent);

    if (result.success) {
      await loadAllData();
      setShowEditContent(false);
      setSelectedContent(null);
      setNewContent({
        title: '',
        content_type: 'article',
        description: '',
        image_url: '',
        file_url: '',
      });
      alert('تم تعديل المحتوى بنجاح');
    } else {
      setError(result.error || 'حدث خطأ أثناء تعديل المحتوى');
    }

    setLoading(false);
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
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#8B5CF6]/20">
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/settings')}
              className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2"
            >
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
              </h2>
              <p className="text-[#6B7280] mt-1">
                {activeSection === 'discussions' && 'إدارة ومراقبة النقاشات'}
                {activeSection === 'content' && 'إضافة وحذف المحتوى التعليمي'}
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
                              <span>{discussion.messages?.length || 0} رسالة</span>
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
              <div className="content-card flex flex-col">
                {selectedDiscussion ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-[#2D2D2D]">{selectedDiscussion.title}</h3>
                      <span className="text-sm text-[#6B7280]">{selectedDiscussion.messages?.length || 0} رسالة</span>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto flex-1 mb-4">
                      {(!selectedDiscussion.messages || selectedDiscussion.messages.length === 0) ? (
                        <div className="text-center py-12">
                          <MessageSquare className="w-12 h-12 mx-auto text-[#8B5CF6]/30 mb-3" />
                          <p className="text-[#6B7280]">لا توجد رسائل في هذا النقاش بعد</p>
                        </div>
                      ) : (
                        selectedDiscussion.messages.map((message: any) => {
                          const senderName = message.sender?.full_name || 'مستخدم';
                          const senderInitial = senderName.charAt(0);
                          const messageTime = new Date(message.created_at).toLocaleString('ar-SA', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          });

                          return (
                            <div key={message.id} className="p-4 rounded-xl bg-[#8B5CF6]/5 border border-[#8B5CF6]/10">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-sm font-semibold">
                                    {senderInitial}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-[#2D2D2D]">{senderName}</span>
                                    <span className="text-sm text-[#6B7280] mr-2">{messageTime}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleBlockUser(message.sender_id)}
                                    className="p-1 rounded hover:bg-yellow-100 text-yellow-600"
                                    title="حظر المستخدم"
                                  >
                                    <Ban className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveUser(message.sender_id)}
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
                          );
                        })
                      )}
                    </div>

                    {/* حقل إرسال الرسالة */}
                    <div className="border-t border-[#8B5CF6]/20 pt-4">
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="اكتب رسالتك هنا..."
                          className="input-modern flex-1"
                          disabled={loading}
                        />
                        <button
                          type="submit"
                          disabled={loading || !newMessage.trim()}
                          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-4 h-4" />
                          <span>إرسال</span>
                        </button>
                      </form>
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
                        <button
                          onClick={() => handleEditContent(content)}
                          className="p-2 rounded-lg bg-white/90 hover:bg-white text-[#8B5CF6] transition-colors"
                          title="تعديل المحتوى"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteContent(content.id)}
                          className="p-2 rounded-lg bg-white/90 hover:bg-red-500 hover:text-white text-red-500 transition-colors"
                          title="حذف المحتوى"
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
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">رابط المحتوى/التحميل (اختياري)</label>
                  <input
                    type="url"
                    className="input-modern w-full"
                    placeholder="https://example.com/file.pdf أو رابط فيديو"
                    value={newContent.file_url}
                    onChange={(e) => setNewContent({ ...newContent, file_url: e.target.value })}
                  />
                  <p className="text-xs text-[#6B7280] mt-2">
                    أدخل رابط الملف للتحميل (كتاب PDF) أو رابط المشاهدة (فيديو YouTube)
                  </p>
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
                    file_url: '',
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

      {/* Edit Content Modal */}
      {showEditContent && selectedContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#8B5CF6]/20 flex-shrink-0">
              <h3 className="text-xl font-bold text-[#2D2D2D]">تعديل المحتوى</h3>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleUpdateContent} className="space-y-6">
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
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">رابط المحتوى/التحميل (اختياري)</label>
                  <input
                    type="url"
                    className="input-modern w-full"
                    placeholder="https://example.com/file.pdf أو رابط فيديو"
                    value={newContent.file_url}
                    onChange={(e) => setNewContent({ ...newContent, file_url: e.target.value })}
                  />
                  <p className="text-xs text-[#6B7280] mt-2">
                    أدخل رابط الملف للتحميل (كتاب PDF) أو رابط المشاهدة (فيديو YouTube)
                  </p>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-[#8B5CF6]/20 flex gap-3 flex-shrink-0">
              <button
                onClick={(e) => handleUpdateContent(e as any)}
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {loading ? 'جاري التعديل...' : 'حفظ التعديلات'}
              </button>
              <button
                onClick={() => {
                  setShowEditContent(false);
                  setSelectedContent(null);
                  setError('');
                  setNewContent({
                    title: '',
                    content_type: 'article',
                    description: '',
                    image_url: '',
                    file_url: '',
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
