import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Users, UserCog, BookOpen, BarChart3, Home, Search, Filter, Plus, Trash2, Ban, Eye, Edit, Settings, LogOut, Bell, TrendingUp, MessageSquare, Star, Activity, Download, RefreshCw, Video, FileText, Book, Mail, Lock, Phone, Calendar, MapPin, Globe } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';
import { getPublishedContent, deleteContent, addContent, updateContent, type ContentType } from '../lib/content';
import { getAllDiscussions } from '../lib/discussions';
import { getAllEvents, addEvent, updateEvent, deleteEvent, type EventData, type EventType } from '../lib/events';
import { getAllUsers, getAllExperts, deleteUser, updateUserRole, type UserRole } from '../lib/users';
import { createExpertByAdmin } from '../lib/auth';
import { getUnreadCount } from '../lib/notifications';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'expert';
  status: 'active' | 'suspended' | 'deleted';
  joinDate: string;
  lastActive: string;
  hoursSpent: number;
  engagementRate: number;
  contentEngaged: number;
  discussionsParticipated: number;
}

interface Expert {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'deleted';
  joinDate: string;
  discussionsHandled: number;
  activityHours: number;
  engagementRate: number;
  rating: number;
  specialization: string;
}

interface Content {
  id: number;
  title: string;
  type: 'book' | 'video' | 'article';
  category: string;
  author: string;
  uploadDate: string;
  views: number;
  likes: number;
  status: 'published' | 'draft' | 'archived';
  image: string;
}

interface Analytics {
  totalUsers: number;
  totalExperts: number;
  totalContent: number;
  totalDiscussions: number;
  activeUsersThisWeek: number;
  discussionEngagementRate: number;
  platformGrowthRate: number;
  contentEngagementRate: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('summary');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddContent, setShowAddContent] = useState(false);
  const [showEditContent, setShowEditContent] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const [showAddExpert, setShowAddExpert] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Mock data - in real app, this would come from API
  const [analytics, setAnalytics] = useState<Analytics>({
    totalUsers: 1247,
    totalExperts: 89,
    totalContent: 456,
    totalDiscussions: 234,
    activeUsersThisWeek: 892,
    discussionEngagementRate: 78.5,
    platformGrowthRate: 12.3,
    contentEngagementRate: 85.2
  });

  const [users, setUsers] = useState<any[]>([]);
  const [experts, setExperts] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const [contentList, setContentList] = useState<any[]>([]);
  const [discussionsList, setDiscussionsList] = useState<any[]>([]);
  const [eventsList, setEventsList] = useState<any[]>([]);

  // توزيع المحتوى الحقيقي من الداتا بيس
  const [contentDistribution, setContentDistribution] = useState({
    books: 0,
    videos: 0,
    articles: 0,
  });

  // بيانات الاستخدام اليومي (آخر 7 أيام)
  const [dailyUsageData, setDailyUsageData] = useState<Array<{ day: string; users: number; content: number; discussions: number }>>([]);

  // النشاطات الأخيرة (آخر 5 نشاطات)
  const [recentActivities, setRecentActivities] = useState<Array<{
    id: string;
    type: 'content' | 'user' | 'expert' | 'discussion' | 'event';
    title: string;
    time: string;
    created_at: string;
  }>>([]);
  const [newContent, setNewContent] = useState({
    title: '',
    content_type: 'article' as ContentType,
    description: '',
    image_url: '',
    file_url: '',
  });
  const [newExpert, setNewExpert] = useState({
    email: '',
    password: '',
    fullName: '',
    specialization: '',
    phone: '',
    bio: '',
  });
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'course' as EventType,
    image_url: '',
    location: '',
    is_online: false,
    start_date: '',
    end_date: '',
    organizer: '',
    registration_link: '',
    contact_info: '',
    instructor_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    let booksCount = 0, videosCount = 0, articlesCount = 0;
    if (contentResult.success && contentResult.data) {
      setContentList(contentResult.data);
      booksCount = contentResult.data.filter((c: any) => c.content_type === 'book').length;
      videosCount = contentResult.data.filter((c: any) => c.content_type === 'video').length;
      articlesCount = contentResult.data.filter((c: any) => c.content_type === 'article').length;

      // حساب معدل تفاعل المحتوى بناءً على تنوع المحتوى
      const contentTypes = [booksCount > 0 ? 1 : 0, videosCount > 0 ? 1 : 0, articlesCount > 0 ? 1 : 0].reduce((a, b) => a + b, 0);
      const diversityScore = (contentTypes / 3) * 100; // نسبة التنوع
      const volumeScore = Math.min(contentResult.data.length * 5, 100); // نقاط الحجم
      const contentEngagement = Math.round((diversityScore * 0.3 + volumeScore * 0.7));

      setAnalytics(prev => ({
        ...prev,
        totalContent: contentResult.data.length,
        contentEngagementRate: contentResult.data.length > 0 ? contentEngagement : 0
      }));
    }

    // تحميل النقاشات
    const discussionsResult = await getAllDiscussions();
    if (discussionsResult.success && discussionsResult.data) {
      setDiscussionsList(discussionsResult.data);
      // حساب معدل التفاعل بناءً على عدد النقاشات مقارنة بعدد المحتوى
      const totalContent = contentResult.data?.length || 1;
      const totalDiscussions = discussionsResult.data.length;
      const engagementRate = Math.min(Math.round((totalDiscussions / totalContent) * 100), 100);

      setAnalytics(prev => ({
        ...prev,
        totalDiscussions: discussionsResult.data.length,
        discussionEngagementRate: engagementRate > 0 ? engagementRate : 0
      }));
    }

    // تحميل الفعاليات
    const eventsResult = await getAllEvents();
    if (eventsResult.success && eventsResult.data) {
      setEventsList(eventsResult.data);
    }

    // تحميل جميع المستخدمين
    const usersResult = await getAllUsers();
    let activeUsers = 0;
    if (usersResult.success && usersResult.data) {
      const regularUsers = usersResult.data.filter((u: any) => u.role === 'user');
      setUsers(regularUsers);

      // حساب المستخدمين النشطين (كل المستخدمين يعتبرون نشطين حالياً)
      activeUsers = usersResult.data.length;

      // حساب معدل النمو بناءً على عدد المستخدمين الجدد
      // نفترض أن المستخدمين المسجلين خلال آخر 30 يوم هم جدد
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const newUsers = usersResult.data.filter((u: any) => {
        const createdAt = new Date(u.created_at);
        return createdAt >= thirtyDaysAgo;
      }).length;

      // حساب معدل النمو الشهري
      const oldUsers = usersResult.data.length - newUsers;
      const growthRate = oldUsers > 0 ? Math.round((newUsers / oldUsers) * 100) : (newUsers > 0 ? 100 : 0);

      setAnalytics(prev => ({
        ...prev,
        totalUsers: usersResult.data.length,
        activeUsersThisWeek: activeUsers,
        platformGrowthRate: Math.min(growthRate, 999) // حد أقصى 999%
      }));
    }

    // تحميل الخبراء
    const expertsResult = await getAllExperts();
    if (expertsResult.success && expertsResult.data) {
      setExperts(expertsResult.data);
      setAnalytics(prev => ({ ...prev, totalExperts: expertsResult.data.length }));
    }

    // تحديث توزيع المحتوى في الواجهة
    updateContentDistribution(booksCount, videosCount, articlesCount);

    // حساب بيانات الاستخدام اليومي
    calculateDailyUsage(usersResult.data || [], contentResult.data || [], discussionsResult.data || []);

    // حساب النشاطات الأخيرة
    calculateRecentActivities(
      usersResult.data || [],
      expertsResult.data || [],
      contentResult.data || [],
      discussionsResult.data || [],
      eventsResult.data || []
    );
  };

  const updateContentDistribution = (books: number, videos: number, articles: number) => {
    setContentDistribution({
      books,
      videos,
      articles,
    });
    console.log(`✅ توزيع المحتوى - كتب: ${books}, فيديوهات: ${videos}, مقالات: ${articles}`);
  };

  const calculateDailyUsage = (users: any[], content: any[], discussions: any[]) => {
    const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dailyData: Array<{ day: string; users: number; content: number; discussions: number }> = [];

    // حساب آخر 7 أيام
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      // حساب المستخدمين المسجلين في هذا اليوم
      const usersCount = users.filter(u => {
        const createdAt = new Date(u.created_at);
        return createdAt >= dayStart && createdAt <= dayEnd;
      }).length;

      // حساب المحتوى المضاف في هذا اليوم
      const contentCount = content.filter(c => {
        const createdAt = new Date(c.created_at);
        return createdAt >= dayStart && createdAt <= dayEnd;
      }).length;

      // حساب النقاشات المنشأة في هذا اليوم
      const discussionsCount = discussions.filter(d => {
        const createdAt = new Date(d.created_at);
        return createdAt >= dayStart && createdAt <= dayEnd;
      }).length;

      const dayName = daysOfWeek[dayStart.getDay()];
      dailyData.push({
        day: dayName,
        users: usersCount,
        content: contentCount,
        discussions: discussionsCount,
      });
    }

    setDailyUsageData(dailyData);
    console.log('✅ تم حساب بيانات الاستخدام اليومي:', dailyData);
  };

  const calculateRecentActivities = (
    users: any[],
    experts: any[],
    content: any[],
    discussions: any[],
    events: any[]
  ) => {
    const activities: Array<{
      id: string;
      type: 'content' | 'user' | 'expert' | 'discussion' | 'event';
      title: string;
      time: string;
      created_at: string;
    }> = [];

    // إضافة المحتوى
    content.forEach(c => {
      activities.push({
        id: c.id,
        type: 'content',
        title: c.title,
        time: c.created_at,
        created_at: c.created_at,
      });
    });

    // إضافة المستخدمين الجدد (user role فقط)
    users.filter((u: any) => u.role === 'user').forEach(u => {
      activities.push({
        id: u.id,
        type: 'user',
        title: u.full_name || u.email,
        time: u.created_at,
        created_at: u.created_at,
      });
    });

    // إضافة الخبراء الجدد
    experts.forEach(e => {
      activities.push({
        id: e.id,
        type: 'expert',
        title: e.full_name || e.email,
        time: e.created_at,
        created_at: e.created_at,
      });
    });

    // إضافة النقاشات
    discussions.forEach(d => {
      activities.push({
        id: d.id,
        type: 'discussion',
        title: d.title,
        time: d.created_at,
        created_at: d.created_at,
      });
    });

    // إضافة الفعاليات
    events.forEach(ev => {
      activities.push({
        id: ev.id,
        type: 'event',
        title: ev.title,
        time: ev.created_at,
        created_at: ev.created_at,
      });
    });

    // ترتيب حسب التاريخ (الأحدث أولاً) وأخذ آخر 5
    const sorted = activities.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }).slice(0, 5);

    setRecentActivities(sorted);
    console.log('✅ تم حساب النشاطات الأخيرة:', sorted);
  };

  const handleDeleteContent = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المحتوى؟')) {
      const result = await deleteContent(id);
      if (result.success) {
        await loadAllData();
        alert('تم حذف المحتوى بنجاح');
      } else {
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await addContent(newContent);

    if (result.success) {
      await loadAllData();
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

  const handleAddExpert = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (newExpert.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setLoading(false);
      return;
    }

    const result = await createExpertByAdmin(
      newExpert.email,
      newExpert.password,
      newExpert.fullName,
      newExpert.specialization,
      newExpert.phone,
      newExpert.bio
    );

    if (result.success) {
      await loadAllData();
      setShowAddExpert(false);
      setNewExpert({
        email: '',
        password: '',
        fullName: '',
        specialization: '',
        phone: '',
        bio: '',
      });
      alert('تم إضافة الخبير بنجاح! تم إرسال إشعار لجميع المستخدمين');
    } else {
      setError(result.error || 'حدث خطأ أثناء إضافة الخبير');
    }

    setLoading(false);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await addEvent(newEvent);

    if (result.success) {
      await loadAllData();
      setShowAddEvent(false);
      setNewEvent({
        title: '',
        description: '',
        event_type: 'course',
        image_url: '',
        location: '',
        is_online: false,
        start_date: '',
        end_date: '',
        organizer: '',
        registration_link: '',
        contact_info: '',
        instructor_name: '',
      });
      alert('تم إضافة الفعالية بنجاح');
    } else {
      setError(result.error || 'حدث خطأ أثناء إضافة الفعالية');
    }

    setLoading(false);
  };

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      image_url: event.image_url || '',
      location: event.location || '',
      is_online: event.is_online || false,
      start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
      end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
      organizer: event.organizer || '',
      registration_link: event.registration_link || '',
      contact_info: event.contact_info || '',
      instructor_name: event.instructor_name || '',
    });
    setShowEditEvent(true);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setLoading(true);
    setError('');

    const result = await updateEvent(selectedEvent.id, newEvent);

    if (result.success) {
      await loadAllData();
      setShowEditEvent(false);
      setSelectedEvent(null);
      setNewEvent({
        title: '',
        description: '',
        event_type: 'course',
        image_url: '',
        location: '',
        is_online: false,
        start_date: '',
        end_date: '',
        organizer: '',
        registration_link: '',
        contact_info: '',
        instructor_name: '',
      });
      alert('تم تعديل الفعالية بنجاح');
    } else {
      setError(result.error || 'حدث خطأ أثناء تعديل الفعالية');
    }

    setLoading(false);
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الفعالية؟')) {
      const result = await deleteEvent(id);
      if (result.success) {
        await loadAllData();
        alert('تم حذف الفعالية بنجاح');
      } else {
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  const topUsers = users.slice(0, 5);
  const topExperts = experts.slice(0, 5);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'book': return <Book className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="status-badge status-new">نشط</span>;
      case 'suspended':
        return <span className="status-badge" style={{background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white'}}>معلق</span>;
      case 'deleted':
        return <span className="status-badge" style={{background: 'linear-gradient(135deg, #EF4444, #DC2626)', color: 'white'}}>محذوف</span>;
      default:
        return <span className="status-badge status-featured">{status}</span>;
    }
  };

  // Helper function للحصول على أيقونة ولون النشاط
  const getActivityIconAndColor = (type: 'content' | 'user' | 'expert' | 'discussion' | 'event') => {
    switch (type) {
      case 'content':
        return {
          icon: <Plus className="w-5 h-5 text-white" />,
          gradient: 'from-[#10B981] to-[#059669]'
        };
      case 'expert':
        return {
          icon: <UserCog className="w-5 h-5 text-white" />,
          gradient: 'from-[#8B5CF6] to-[#7C3AED]'
        };
      case 'user':
        return {
          icon: <Users className="w-5 h-5 text-white" />,
          gradient: 'from-[#3B82F6] to-[#2563EB]'
        };
      case 'discussion':
        return {
          icon: <MessageSquare className="w-5 h-5 text-white" />,
          gradient: 'from-[#F59E0B] to-[#D97706]'
        };
      case 'event':
        return {
          icon: <Bell className="w-5 h-5 text-white" />,
          gradient: 'from-[#EF4444] to-[#DC2626]'
        };
    }
  };

  // Helper function لحساب الوقت النسبي
  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'منذ لحظات';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
    } else {
      return date.toLocaleDateString('ar-SA');
    }
  };

  // Helper function لتنسيق عنوان النشاط
  const getActivityTitle = (activity: { type: string; title: string }) => {
    switch (activity.type) {
      case 'content':
        return `تم إضافة محتوى جديد: "${activity.title}"`;
      case 'expert':
        return `انضم خبير جديد: ${activity.title}`;
      case 'user':
        return `انضم مستخدم جديد: ${activity.title}`;
      case 'discussion':
        return `نقاش جديد: "${activity.title}"`;
      case 'event':
        return `فعالية جديدة: "${activity.title}"`;
      default:
        return activity.title;
    }
  };

  return (
    <div className="min-h-screen bg-pattern flex">
      {/* Sidebar */}
      <div className="w-80 glass-effect border-r border-[#8B7355]/20 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#8B7355]/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#DC2626] to-[#B91C1C] flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">لوحة الإدارة</h1>
              <p className="text-sm text-[#6B7280]">التحكم الكامل في المنصة</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveSection('summary')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl text-right transition-all ${
                activeSection === 'summary'
                  ? 'bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white shadow-lg'
                  : 'text-[#8B7355] hover:bg-[#8B7355]/10'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">لوحة المعلومات</span>
            </button>

            <button
              onClick={() => setActiveSection('content')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl text-right transition-all ${
                activeSection === 'content'
                  ? 'bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white shadow-lg'
                  : 'text-[#8B7355] hover:bg-[#8B7355]/10'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">إدارة المحتوى</span>
            </button>

            <button
              onClick={() => setActiveSection('experts')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl text-right transition-all ${
                activeSection === 'experts'
                  ? 'bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white shadow-lg'
                  : 'text-[#8B7355] hover:bg-[#8B7355]/10'
              }`}
            >
              <UserCog className="w-5 h-5" />
              <span className="font-medium">إدارة الخبراء</span>
            </button>

            <button
              onClick={() => setActiveSection('users')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl text-right transition-all ${
                activeSection === 'users'
                  ? 'bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white shadow-lg'
                  : 'text-[#8B7355] hover:bg-[#8B7355]/10'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">إدارة المستخدمين</span>
            </button>

            <button
              onClick={() => setActiveSection('events')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl text-right transition-all ${
                activeSection === 'events'
                  ? 'bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white shadow-lg'
                  : 'text-[#8B7355] hover:bg-[#8B7355]/10'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="font-medium">إدارة الفعاليات</span>
            </button>

            <button
              onClick={() => setActiveSection('analytics')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl text-right transition-all ${
                activeSection === 'analytics'
                  ? 'bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white shadow-lg'
                  : 'text-[#8B7355] hover:bg-[#8B7355]/10'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">التحليلات والتقارير</span>
            </button>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#8B7355]/20">
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
        <div className="glass-effect border-b border-[#8B7355]/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#2D2D2D]">
                {activeSection === 'summary' && 'لوحة المعلومات الرئيسية'}
                {activeSection === 'content' && 'إدارة المحتوى'}
                {activeSection === 'experts' && 'إدارة الخبراء'}
                {activeSection === 'users' && 'إدارة المستخدمين'}
                {activeSection === 'events' && 'إدارة الفعاليات'}
                {activeSection === 'analytics' && 'التحليلات والتقارير'}
              </h2>
              <p className="text-[#6B7280] mt-1">
                {activeSection === 'summary' && 'نظرة شاملة على أداء المنصة'}
                {activeSection === 'content' && 'إضافة وحذف وإدارة المحتوى التعليمي'}
                {activeSection === 'experts' && 'مراقبة وإدارة حسابات الخبراء'}
                {activeSection === 'users' && 'مراقبة وإدارة حسابات المستخدمين'}
                {activeSection === 'events' && 'إضافة وإدارة الفعاليات القادمة'}
                {activeSection === 'analytics' && 'تقارير مفصلة وإحصائيات المنصة'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleRefresh}
                className={`p-2 rounded-xl hover:bg-[#8B7355]/10 transition-colors ${refreshing ? 'animate-spin' : ''}`}
              >
                <RefreshCw className="w-5 h-5 text-[#8B7355]" />
              </button>
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
              {activeSection === 'experts' && (
                <button
                  onClick={() => setShowAddExpert(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة خبير</span>
                </button>
              )}
              {activeSection === 'events' && (
                <button
                  onClick={() => setShowAddEvent(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة فعالية</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Summary Dashboard */}
          {activeSection === 'summary' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="content-card text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#2D2D2D] mb-1">{analytics.totalUsers.toLocaleString()}</h3>
                  <p className="text-[#6B7280] text-sm">إجمالي المستخدمين</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500">+{analytics.platformGrowthRate}%</span>
                  </div>
                </div>

                <div className="content-card text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center">
                    <UserCog className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#2D2D2D] mb-1">{analytics.totalExperts}</h3>
                  <p className="text-[#6B7280] text-sm">إجمالي الخبراء</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs text-yellow-500">4.7 تقييم</span>
                  </div>
                </div>

                <div className="content-card text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#2D2D2D] mb-1">{analytics.totalContent}</h3>
                  <p className="text-[#6B7280] text-sm">إجمالي المحتوى</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Activity className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-blue-500">{analytics.contentEngagementRate}% تفاعل</span>
                  </div>
                </div>

                <div className="content-card text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[#EF4444] to-[#DC2626] flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#2D2D2D] mb-1">{analytics.totalDiscussions}</h3>
                  <p className="text-[#6B7280] text-sm">إجمالي النقاشات</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <MessageSquare className="w-3 h-3 text-purple-500" />
                    <span className="text-xs text-purple-500">{analytics.discussionEngagementRate}% مشاركة</span>
                  </div>
                </div>
              </div>

              {/* Top Users and Experts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="content-card">
                  <h3 className="text-xl font-bold text-[#2D2D2D] mb-6">أفضل 5 مستخدمين</h3>
                  <div className="space-y-4">
                    {topUsers.map((user, index) => (
                      <div key={user.id} className="flex items-center gap-4 p-3 rounded-xl bg-[#8B7355]/5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] text-white flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#2D2D2D]">{user.name}</h4>
                          <p className="text-sm text-[#6B7280]">{user.hoursSpent} ساعة • {user.engagementRate}% تفاعل</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-[#8B7355]">{user.contentEngaged}%</div>
                          <div className="text-xs text-[#6B7280]">محتوى مكتمل</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="content-card">
                  <h3 className="text-xl font-bold text-[#2D2D2D] mb-6">أفضل 5 خبراء</h3>
                  <div className="space-y-4">
                    {topExperts.map((expert, index) => (
                      <div key={expert.id} className="flex items-center gap-4 p-3 rounded-xl bg-[#8B7355]/5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-white flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#2D2D2D]">{expert.name}</h4>
                          <p className="text-sm text-[#6B7280]">{expert.discussionsHandled} نقاش • {expert.activityHours} ساعة</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-semibold text-[#8B7355]">{expert.rating}</span>
                          </div>
                          <div className="text-xs text-[#6B7280]">{expert.engagementRate}% تفاعل</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="content-card">
                <h3 className="text-xl font-bold text-[#2D2D2D] mb-6">النشاط الأخير</h3>
                {recentActivities.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 mx-auto text-[#8B7355]/30 mb-3" />
                    <p className="text-[#6B7280]">لا توجد نشاطات حديثة</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivities.map((activity) => {
                      const { icon, gradient } = getActivityIconAndColor(activity.type);
                      return (
                        <div key={activity.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#8B7355]/5 transition-colors">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                            {icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-[#2D2D2D]">{getActivityTitle(activity)}</p>
                            <p className="text-sm text-[#6B7280]">{getRelativeTime(activity.created_at)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content Management */}
          {activeSection === 'content' && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 relative">
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
                <button className="btn-secondary flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>تصدير</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contentList.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto text-[#8B7355]/30 mb-4" />
                    <p className="text-[#6B7280]">لا يوجد محتوى في الداتا بيس بعد</p>
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
                        <div className="absolute top-3 left-3 flex gap-2">
                          <button
                            onClick={() => handleEditContent(content)}
                            className="p-2 rounded-lg bg-white/90 hover:bg-blue-500 hover:text-white text-blue-600 transition-colors"
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
                        <p className="text-sm text-[#6B7280] line-clamp-2">{content.description || 'لا يوجد وصف'}</p>
                        <div className="flex justify-between items-center pt-2 border-t border-[#8B7355]/10">
                          <span className="text-sm text-[#6B7280]">{new Date(content.created_at).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Experts Management */}
          {activeSection === 'experts' && (
            <div className="content-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#2D2D2D]">قائمة الخبراء</h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="البحث عن خبير..."
                     className="input-modern has-right-icon"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-4 h-4 pointer-events-none" />
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
                      <th className="text-right p-4 font-semibold text-[#2D2D2D]">الخبير</th>
                      <th className="text-right p-4 font-semibold text-[#2D2D2D]">التخصص</th>
                      <th className="text-right p-4 font-semibold text-[#2D2D2D]">النقاشات</th>
                      <th className="text-right p-4 font-semibold text-[#2D2D2D]">ساعات النشاط</th>
                      <th className="text-right p-4 font-semibold text-[#2D2D2D]">التقييم</th>
                      <th className="text-right p-4 font-semibold text-[#2D2D2D]">الحالة</th>
                      <th className="text-right p-4 font-semibold text-[#2D2D2D]">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {experts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center">
                          <UserCog className="w-16 h-16 mx-auto text-[#8B7355]/30 mb-4" />
                          <p className="text-[#6B7280]">لا يوجد خبراء في قاعدة البيانات</p>
                        </td>
                      </tr>
                    ) : (
                      experts.map(expert => (
                        <tr key={expert.id} className="border-b border-[#8B7355]/10 hover:bg-[#8B7355]/5 transition-colors">
                          <td className="p-4">
                            <div>
                              <div className="font-semibold text-[#2D2D2D]">{expert.full_name || expert.email}</div>
                              <div className="text-sm text-[#6B7280]">{expert.email}</div>
                            </div>
                          </td>
                          <td className="p-4 text-[#6B7280]">الأمن الفكري</td>
                          <td className="p-4 text-[#2D2D2D] font-semibold">-</td>
                          <td className="p-4 text-[#2D2D2D]">-</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="font-semibold text-[#2D2D2D]">5.0</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="status-badge status-trending">نشط</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(expert);
                                  setShowUserDetails(true);
                                }}
                                className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                                title="عرض التفاصيل"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm('هل أنت متأكد من حذف هذا الخبير؟')) {
                                    const result = await deleteUser(expert.id);
                                    if (result.success) {
                                      alert('تم حذف الخبير بنجاح');
                                      await loadAllData();
                                    } else {
                                      alert('حدث خطأ أثناء حذف الخبير: ' + result.error);
                                    }
                                  }
                                }}
                                className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                                title="حذف الخبير"
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

          {/* Users Management */}
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
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-4 h-4 pointer-events-none" />
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
                      <th className="text-right p-4 font-semibold text-[#2D2D2D]">ساعات الاستخدام</th>
                      <th className="text-right p-4 font-semibold text-[#2D2D2D]">معدل التفاعل</th>
                      <th className="text-right p-4 font-semibold text-[#2D2D2D]">المحتوى المكتمل</th>
                      <th className="text-right p-4 font-semibold text-[#2D2D2D]">النقاشات</th>
                      <th className="text-right p-4 font-semibold text-[#2D2D2D]">الحالة</th>
                      <th className="text-right p-4 font-semibold text-[#2D2D2D]">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center">
                          <Users className="w-16 h-16 mx-auto text-[#8B7355]/30 mb-4" />
                          <p className="text-[#6B7280]">لا يوجد مستخدمون في قاعدة البيانات</p>
                        </td>
                      </tr>
                    ) : (
                      users.map(user => {
                        // حساب الوقت منذ التسجيل
                        const daysAgo = Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
                        // افتراض ساعات الاستخدام (متوسط ساعة يومياً)
                        const hoursSpent = Math.max(0, daysAgo);

                        return (
                          <tr key={user.id} className="border-b border-[#8B7355]/10 hover:bg-[#8B7355]/5 transition-colors">
                            <td className="p-4">
                              <div>
                                <div className="font-semibold text-[#2D2D2D]">{user.full_name || user.email}</div>
                                <div className="text-sm text-[#6B7280]">{user.email}</div>
                                <div className="text-xs text-[#8B7355] mt-1">
                                  عضو منذ {daysAgo === 0 ? 'اليوم' : `${daysAgo} يوم`}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-[#2D2D2D] font-semibold">{hoursSpent} ساعة</td>
                            <td className="p-4 text-[#2D2D2D]">{Math.min(hoursSpent * 5, 100)}%</td>
                            <td className="p-4 text-[#2D2D2D]">0%</td>
                            <td className="p-4 text-[#2D2D2D]">0</td>
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
                                  title="عرض التفاصيل"
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
                                  title="حذف المستخدم"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Events Management */}
          {activeSection === 'events' && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="البحث في الفعاليات..."
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventsList.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto text-[#8B7355]/30 mb-4" />
                    <p className="text-[#6B7280]">لا توجد فعاليات في قاعدة البيانات</p>
                  </div>
                ) : (
                  eventsList.map(event => (
                    <div key={event.id} className="content-card card-hover group">
                      <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
                        <img
                          src={event.image_url || 'https://images.pexels.com/photos/1181403/pexels-photo-1181403.jpeg'}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="p-2 rounded-lg bg-white/90 hover:bg-blue-500 hover:text-white text-blue-600 transition-colors"
                            title="تعديل الفعالية"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-2 rounded-lg bg-white/90 hover:bg-red-500 hover:text-white text-red-500 transition-colors"
                            title="حذف الفعالية"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className={`status-badge ${
                            event.event_type === 'course' ? 'status-new' :
                            event.event_type === 'workshop' ? 'status-trending' : 'status-featured'
                          }`}>
                            {event.event_type === 'course' ? 'دورة' :
                             event.event_type === 'workshop' ? 'ورشة عمل' :
                             event.event_type === 'seminar' ? 'ندوة' : 'ويبينار'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-[#2D2D2D] font-bold text-lg leading-tight">{event.title}</h3>
                        <p className="text-sm text-[#6B7280] line-clamp-2">{event.description || 'لا يوجد وصف'}</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(event.start_date).toLocaleDateString('ar-SA')}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                              {event.is_online ? <Globe className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                              <span>{event.is_online ? 'عبر الإنترنت' : event.location}</span>
                            </div>
                          )}
                          {event.instructor_name && (
                            <div className="text-sm text-[#8B7355] font-semibold">
                              المدرب: {event.instructor_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Analytics & Reports */}
          {activeSection === 'analytics' && (
            <div className="space-y-6">
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="content-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#2D2D2D]">المستخدمون النشطون</h3>
                    <Activity className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <div className="text-3xl font-bold text-[#2D2D2D] mb-2">{analytics.activeUsersThisWeek}</div>
                  <div className="text-sm text-[#6B7280]">هذا الأسبوع</div>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500">+15.3% من الأسبوع الماضي</span>
                  </div>
                </div>

                <div className="content-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#2D2D2D]">معدل التفاعل</h3>
                    <MessageSquare className="w-5 h-5 text-[#8B5CF6]" />
                  </div>
                  <div className="text-3xl font-bold text-[#2D2D2D] mb-2">{analytics.discussionEngagementRate}%</div>
                  <div className="text-sm text-[#6B7280]">في النقاشات</div>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500">+8.7% من الشهر الماضي</span>
                  </div>
                </div>

                <div className="content-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#2D2D2D]">نمو المنصة</h3>
                    <BarChart3 className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <div className="text-3xl font-bold text-[#2D2D2D] mb-2">{analytics.platformGrowthRate}%</div>
                  <div className="text-sm text-[#6B7280]">معدل النمو الشهري</div>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500">مستقر</span>
                  </div>
                </div>
              </div>

              {/* Detailed Reports */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="content-card">
                  <h3 className="text-xl font-bold text-[#2D2D2D] mb-6">تقرير الاستخدام اليومي</h3>
                  {dailyUsageData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-[#6B7280]">
                      <div className="text-center">
                        <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>جاري تحميل البيانات...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 relative">
                      {/* Bar Chart */}
                      <div className="absolute inset-0 flex items-end justify-between gap-2 px-4 pb-12">
                        {dailyUsageData.map((data, index) => {
                          const maxValue = Math.max(...dailyUsageData.map(d => d.users + d.content + d.discussions));
                          const totalValue = data.users + data.content + data.discussions;
                          const heightPercentage = maxValue > 0 ? (totalValue / maxValue) * 100 : 0;

                          return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                              {/* الأعمدة المكدسة */}
                              <div
                                className="w-full bg-gradient-to-t from-[#8B7355]/10 to-[#8B7355]/5 rounded-t-lg relative overflow-hidden transition-all duration-300 hover:shadow-lg"
                                style={{ height: `${heightPercentage}%`, minHeight: totalValue > 0 ? '20px' : '5px' }}
                              >
                                {/* عمود المستخدمين */}
                                {data.users > 0 && (
                                  <div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#10B981] to-[#059669]"
                                    style={{ height: `${totalValue > 0 ? (data.users / totalValue) * 100 : 0}%` }}
                                  ></div>
                                )}
                                {/* عمود المحتوى */}
                                {data.content > 0 && (
                                  <div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#F59E0B] to-[#D97706]"
                                    style={{
                                      height: `${totalValue > 0 ? (data.content / totalValue) * 100 : 0}%`,
                                      transform: `translateY(-${data.users > 0 ? (data.users / totalValue) * 100 : 0}%)`
                                    }}
                                  ></div>
                                )}
                                {/* عمود النقاشات */}
                                {data.discussions > 0 && (
                                  <div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#8B5CF6] to-[#7C3AED]"
                                    style={{
                                      height: `${totalValue > 0 ? (data.discussions / totalValue) * 100 : 0}%`,
                                      transform: `translateY(-${((data.users + data.content) / totalValue) * 100}%)`
                                    }}
                                  ></div>
                                )}

                                {/* Tooltip عند التمرير */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-xs font-bold rounded-t-lg">
                                  <div className="text-center">
                                    <div>{totalValue}</div>
                                    <div className="text-[10px] opacity-75">إجمالي</div>
                                  </div>
                                </div>
                              </div>

                              {/* اسم اليوم */}
                              <div className="text-xs text-[#6B7280] font-medium text-center">
                                {data.day}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* المفاتيح */}
                      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-gradient-to-br from-[#10B981] to-[#059669]"></div>
                          <span className="text-[#6B7280]">مستخدمين</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-gradient-to-br from-[#F59E0B] to-[#D97706]"></div>
                          <span className="text-[#6B7280]">محتوى</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]"></div>
                          <span className="text-[#6B7280]">نقاشات</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="content-card">
                  <h3 className="text-xl font-bold text-[#2D2D2D] mb-6">توزيع المحتوى</h3>
                  {analytics.totalContent === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 mx-auto text-[#8B7355]/30 mb-3" />
                      <p className="text-[#6B7280]">لا يوجد محتوى في الداتا بيس</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Book className="w-5 h-5 text-[#10B981]" />
                          <span className="text-[#2D2D2D]">الكتب</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                              style={{ width: `${analytics.totalContent > 0 ? (contentDistribution.books / analytics.totalContent) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-[#6B7280] min-w-[2rem] text-right">{contentDistribution.books}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Video className="w-5 h-5 text-[#8B5CF6]" />
                          <span className="text-[#2D2D2D]">الفيديوهات</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#8B5CF6] rounded-full transition-all duration-500"
                              style={{ width: `${analytics.totalContent > 0 ? (contentDistribution.videos / analytics.totalContent) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-[#6B7280] min-w-[2rem] text-right">{contentDistribution.videos}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-[#F59E0B]" />
                          <span className="text-[#2D2D2D]">المقالات</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#F59E0B] rounded-full transition-all duration-500"
                              style={{ width: `${analytics.totalContent > 0 ? (contentDistribution.articles / analytics.totalContent) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-[#6B7280] min-w-[2rem] text-right">{contentDistribution.articles}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Content Modal */}
      {showAddContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#8B7355]/20 flex-shrink-0">
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
            <div className="p-6 border-t border-[#8B7355]/20 flex gap-3 flex-shrink-0">
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
            <div className="p-6 border-b border-[#8B7355]/20 flex-shrink-0">
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
            <div className="p-6 border-t border-[#8B7355]/20 flex gap-3 flex-shrink-0">
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

      {/* Add Expert Modal */}
      {showAddExpert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#8B7355]/20 flex-shrink-0">
              <h3 className="text-xl font-bold text-[#2D2D2D]">إضافة خبير جديد</h3>
              <p className="text-sm text-[#6B7280] mt-1">سيتم إنشاء حساب جديد للخبير في النظام</p>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleAddExpert} className="space-y-6">
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#8B7355]" />
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    className="input-modern w-full"
                    placeholder="expert@example.com"
                    value={newExpert.email}
                    onChange={(e) => setNewExpert({ ...newExpert, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#8B7355]" />
                    كلمة المرور
                  </label>
                  <input
                    type="password"
                    className="input-modern w-full"
                    placeholder="كلمة مرور قوية (6 أحرف على الأقل)"
                    value={newExpert.password}
                    onChange={(e) => setNewExpert({ ...newExpert, password: e.target.value })}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-[#6B7280] mt-2">سيتمكن الخبير من تسجيل الدخول مباشرة بهذه البيانات</p>
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">الاسم الكامل</label>
                  <input
                    type="text"
                    className="input-modern w-full"
                    placeholder="د. محمد أحمد"
                    value={newExpert.fullName}
                    onChange={(e) => setNewExpert({ ...newExpert, fullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">التخصص</label>
                  <input
                    type="text"
                    className="input-modern w-full"
                    placeholder="الأمن الفكري، التربية، علم النفس..."
                    value={newExpert.specialization}
                    onChange={(e) => setNewExpert({ ...newExpert, specialization: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#8B7355]" />
                    رقم الجوال (اختياري)
                  </label>
                  <input
                    type="tel"
                    className="input-modern w-full"
                    placeholder="+966 5X XXX XXXX"
                    value={newExpert.phone}
                    onChange={(e) => setNewExpert({ ...newExpert, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">نبذة عن الخبير (اختياري)</label>
                  <textarea
                    className="input-modern w-full h-24 resize-none"
                    placeholder="نبذة مختصرة عن خبرة وتجربة الخبير..."
                    value={newExpert.bio}
                    onChange={(e) => setNewExpert({ ...newExpert, bio: e.target.value })}
                  ></textarea>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-[#8B7355]/20 flex gap-3 flex-shrink-0">
              <button
                onClick={(e) => handleAddExpert(e as any)}
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {loading ? 'جاري الإضافة...' : 'إضافة الخبير'}
              </button>
              <button
                onClick={() => {
                  setShowAddExpert(false);
                  setError('');
                  setNewExpert({
                    email: '',
                    password: '',
                    fullName: '',
                    specialization: '',
                    phone: '',
                    bio: '',
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

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#8B7355]/20 flex-shrink-0">
              <h3 className="text-xl font-bold text-[#2D2D2D]">إضافة فعالية جديدة</h3>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleAddEvent} className="space-y-6">
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">عنوان الفعالية</label>
                  <input
                    type="text"
                    className="input-modern w-full"
                    placeholder="أدخل عنوان الفعالية"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">نوع الفعالية</label>
                  <select
                    className="input-modern w-full"
                    value={newEvent.event_type}
                    onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value as EventType })}
                  >
                    <option value="course">دورة</option>
                    <option value="workshop">ورشة عمل</option>
                    <option value="seminar">ندوة</option>
                    <option value="webinar">ويبينار</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">الوصف</label>
                  <textarea
                    className="input-modern w-full h-24 resize-none"
                    placeholder="أدخل وصف الفعالية"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#2D2D2D] font-semibold mb-3">تاريخ البدء</label>
                    <input
                      type="datetime-local"
                      className="input-modern w-full"
                      value={newEvent.start_date}
                      onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#2D2D2D] font-semibold mb-3">تاريخ الانتهاء (اختياري)</label>
                    <input
                      type="datetime-local"
                      className="input-modern w-full"
                      value={newEvent.end_date}
                      onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEvent.is_online}
                      onChange={(e) => setNewEvent({ ...newEvent, is_online: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-[#2D2D2D] font-semibold">فعالية عبر الإنترنت</span>
                  </label>
                </div>
                {!newEvent.is_online && (
                  <div>
                    <label className="block text-[#2D2D2D] font-semibold mb-3">الموقع</label>
                    <input
                      type="text"
                      className="input-modern w-full"
                      placeholder="أدخل موقع الفعالية"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">اسم المدرب (اختياري)</label>
                  <input
                    type="text"
                    className="input-modern w-full"
                    placeholder="د. أحمد محمد"
                    value={newEvent.instructor_name}
                    onChange={(e) => setNewEvent({ ...newEvent, instructor_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">الجهة المنظمة (اختياري)</label>
                  <input
                    type="text"
                    className="input-modern w-full"
                    placeholder="اسم الجهة المنظمة"
                    value={newEvent.organizer}
                    onChange={(e) => setNewEvent({ ...newEvent, organizer: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">رابط التسجيل (اختياري)</label>
                  <input
                    type="url"
                    className="input-modern w-full"
                    placeholder="https://example.com/register"
                    value={newEvent.registration_link}
                    onChange={(e) => setNewEvent({ ...newEvent, registration_link: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">معلومات الاتصال (اختياري)</label>
                  <input
                    type="text"
                    className="input-modern w-full"
                    placeholder="بريد إلكتروني أو رقم هاتف"
                    value={newEvent.contact_info}
                    onChange={(e) => setNewEvent({ ...newEvent, contact_info: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">رابط الصورة (اختياري)</label>
                  <input
                    type="url"
                    className="input-modern w-full"
                    placeholder="https://example.com/image.jpg"
                    value={newEvent.image_url}
                    onChange={(e) => setNewEvent({ ...newEvent, image_url: e.target.value })}
                  />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-[#8B7355]/20 flex gap-3 flex-shrink-0">
              <button
                onClick={(e) => handleAddEvent(e as any)}
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {loading ? 'جاري الإضافة...' : 'إضافة الفعالية'}
              </button>
              <button
                onClick={() => {
                  setShowAddEvent(false);
                  setError('');
                  setNewEvent({
                    title: '',
                    description: '',
                    event_type: 'course',
                    image_url: '',
                    location: '',
                    is_online: false,
                    start_date: '',
                    end_date: '',
                    organizer: '',
                    registration_link: '',
                    contact_info: '',
                    instructor_name: '',
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

      {/* Edit Event Modal */}
      {showEditEvent && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#8B7355]/20 flex-shrink-0">
              <h3 className="text-xl font-bold text-[#2D2D2D]">تعديل الفعالية</h3>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleUpdateEvent} className="space-y-6">
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">عنوان الفعالية</label>
                  <input
                    type="text"
                    className="input-modern w-full"
                    placeholder="أدخل عنوان الفعالية"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">نوع الفعالية</label>
                  <select
                    className="input-modern w-full"
                    value={newEvent.event_type}
                    onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value as EventType })}
                  >
                    <option value="course">دورة</option>
                    <option value="workshop">ورشة عمل</option>
                    <option value="seminar">ندوة</option>
                    <option value="webinar">ويبينار</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">الوصف</label>
                  <textarea
                    className="input-modern w-full h-24 resize-none"
                    placeholder="أدخل وصف الفعالية"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#2D2D2D] font-semibold mb-3">تاريخ البدء</label>
                    <input
                      type="datetime-local"
                      className="input-modern w-full"
                      value={newEvent.start_date}
                      onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#2D2D2D] font-semibold mb-3">تاريخ الانتهاء (اختياري)</label>
                    <input
                      type="datetime-local"
                      className="input-modern w-full"
                      value={newEvent.end_date}
                      onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEvent.is_online}
                      onChange={(e) => setNewEvent({ ...newEvent, is_online: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-[#2D2D2D] font-semibold">فعالية عبر الإنترنت</span>
                  </label>
                </div>
                {!newEvent.is_online && (
                  <div>
                    <label className="block text-[#2D2D2D] font-semibold mb-3">الموقع</label>
                    <input
                      type="text"
                      className="input-modern w-full"
                      placeholder="أدخل موقع الفعالية"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">اسم المدرب (اختياري)</label>
                  <input
                    type="text"
                    className="input-modern w-full"
                    placeholder="د. أحمد محمد"
                    value={newEvent.instructor_name}
                    onChange={(e) => setNewEvent({ ...newEvent, instructor_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">الجهة المنظمة (اختياري)</label>
                  <input
                    type="text"
                    className="input-modern w-full"
                    placeholder="اسم الجهة المنظمة"
                    value={newEvent.organizer}
                    onChange={(e) => setNewEvent({ ...newEvent, organizer: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">رابط التسجيل (اختياري)</label>
                  <input
                    type="url"
                    className="input-modern w-full"
                    placeholder="https://example.com/register"
                    value={newEvent.registration_link}
                    onChange={(e) => setNewEvent({ ...newEvent, registration_link: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">معلومات الاتصال (اختياري)</label>
                  <input
                    type="text"
                    className="input-modern w-full"
                    placeholder="بريد إلكتروني أو رقم هاتف"
                    value={newEvent.contact_info}
                    onChange={(e) => setNewEvent({ ...newEvent, contact_info: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">رابط الصورة (اختياري)</label>
                  <input
                    type="url"
                    className="input-modern w-full"
                    placeholder="https://example.com/image.jpg"
                    value={newEvent.image_url}
                    onChange={(e) => setNewEvent({ ...newEvent, image_url: e.target.value })}
                  />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-[#8B7355]/20 flex gap-3 flex-shrink-0">
              <button
                onClick={(e) => handleUpdateEvent(e as any)}
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {loading ? 'جاري التعديل...' : 'حفظ التعديلات'}
              </button>
              <button
                onClick={() => {
                  setShowEditEvent(false);
                  setSelectedEvent(null);
                  setError('');
                  setNewEvent({
                    title: '',
                    description: '',
                    event_type: 'course',
                    image_url: '',
                    location: '',
                    is_online: false,
                    start_date: '',
                    end_date: '',
                    organizer: '',
                    registration_link: '',
                    contact_info: '',
                    instructor_name: '',
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

      {/* Notifications Modal */}
      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        userRole="admin"
      />
    </div>
  );
};

export default AdminDashboard;