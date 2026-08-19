import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Users,
  UserCog,
  BookOpen,
  BarChart3,
  Home,
  Search,
  Filter,
  Plus,
  Trash2,
  Ban,
  Eye,
  Edit,
  Settings,
  LogOut,
  Bell,
  TrendingUp,
  MessageSquare,
  Star,
  Activity,
  Download,
  RefreshCw,
  Video,
  FileText,
  Book,
  Mail,
  Lock,
  Phone,
  Calendar,
  MapPin,
  Globe,
} from 'lucide-react';
import NotificationModal from '../components/NotificationModal';
import {
  getPublishedContent,
  deleteContent,
  addContent,
  updateContent,
  type ContentType,
} from '../lib/content';
import { getAllDiscussions, deleteDiscussion, deleteMessage } from '../lib/discussions';
import { banUserFromDiscussion, unbanUserFromDiscussion } from '../lib/bans';
import {
  getAllEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  type EventData,
  type EventType,
} from '../lib/events';
import {
  getAllUsers,
  getAllExperts,
  deleteUser,
  updateUserRole,
  type UserRole,
} from '../lib/users';
import { createExpertByAdmin } from '../lib/auth';
import { getUnreadCount } from '../lib/notifications';

interface User {
  id: string;
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
    contentEngagementRate: 85.2,
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
  const [dailyUsageData, setDailyUsageData] = useState<
    Array<{ day: string; users: number; content: number; discussions: number }>
  >([]);

  // النشاطات الأخيرة (آخر 5 نشاطات)
  const [recentActivities, setRecentActivities] = useState<
    Array<{
      id: string;
      type: 'content' | 'user' | 'expert' | 'discussion' | 'event';
      title: string;
      time: string;
      created_at: string;
    }>
  >([]);
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
    let booksCount = 0,
      videosCount = 0,
      articlesCount = 0;
    if (contentResult.success && contentResult.data) {
      setContentList(contentResult.data);
      booksCount = contentResult.data.filter((c: any) => c.content_type === 'book').length;
      videosCount = contentResult.data.filter((c: any) => c.content_type === 'video').length;
      articlesCount = contentResult.data.filter((c: any) => c.content_type === 'article').length;

      // حساب معدل تفاعل المحتوى بناءً على تنوع المحتوى
      const contentTypes = [
        booksCount > 0 ? 1 : 0,
        videosCount > 0 ? 1 : 0,
        articlesCount > 0 ? 1 : 0,
      ].reduce((a, b) => a + b, 0);
      const diversityScore = (contentTypes / 3) * 100; // نسبة التنوع
      const volumeScore = Math.min(contentResult.data.length * 5, 100); // نقاط الحجم
      const contentEngagement = Math.round(diversityScore * 0.3 + volumeScore * 0.7);

      setAnalytics((prev) => ({
        ...prev,
        totalContent: contentResult.data.length,
        contentEngagementRate: contentResult.data.length > 0 ? contentEngagement : 0,
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

      setAnalytics((prev) => ({
        ...prev,
        totalDiscussions: discussionsResult.data.length,
        discussionEngagementRate: engagementRate > 0 ? engagementRate : 0,
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
      const growthRate =
        oldUsers > 0 ? Math.round((newUsers / oldUsers) * 100) : newUsers > 0 ? 100 : 0;

      setAnalytics((prev) => ({
        ...prev,
        totalUsers: usersResult.data.length,
        activeUsersThisWeek: activeUsers,
        platformGrowthRate: Math.min(growthRate, 999), // حد أقصى 999%
      }));
    }

    // تحميل الخبراء
    const expertsResult = await getAllExperts();
    if (expertsResult.success && expertsResult.data) {
      setExperts(expertsResult.data);
      setAnalytics((prev) => ({ ...prev, totalExperts: expertsResult.data.length }));
    }

    // تحديث توزيع المحتوى في الواجهة
    updateContentDistribution(booksCount, videosCount, articlesCount);

    // حساب بيانات الاستخدام اليومي
    calculateDailyUsage(
      usersResult.data || [],
      contentResult.data || [],
      discussionsResult.data || []
    );

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
    const dailyData: Array<{ day: string; users: number; content: number; discussions: number }> =
      [];

    // حساب آخر 7 أيام
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      // حساب المستخدمين المسجلين في هذا اليوم
      const usersCount = users.filter((u) => {
        const createdAt = new Date(u.created_at);
        return createdAt >= dayStart && createdAt <= dayEnd;
      }).length;

      // حساب المحتوى المضاف في هذا اليوم
      const contentCount = content.filter((c) => {
        const createdAt = new Date(c.created_at);
        return createdAt >= dayStart && createdAt <= dayEnd;
      }).length;

      // حساب النقاشات المنشأة في هذا اليوم
      const discussionsCount = discussions.filter((d) => {
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
    content.forEach((c) => {
      activities.push({
        id: c.id,
        type: 'content',
        title: c.title,
        time: c.created_at,
        created_at: c.created_at,
      });
    });

    // إضافة المستخدمين الجدد (user role فقط)
    users
      .filter((u: any) => u.role === 'user')
      .forEach((u) => {
        activities.push({
          id: u.id,
          type: 'user',
          title: u.full_name || u.email,
          time: u.created_at,
          created_at: u.created_at,
        });
      });

    // إضافة الخبراء الجدد
    experts.forEach((e) => {
      activities.push({
        id: e.id,
        type: 'expert',
        title: e.full_name || e.email,
        time: e.created_at,
        created_at: e.created_at,
      });
    });

    // إضافة النقاشات
    discussions.forEach((d) => {
      activities.push({
        id: d.id,
        type: 'discussion',
        title: d.title,
        time: d.created_at,
        created_at: d.created_at,
      });
    });

    // إضافة الفعاليات
    events.forEach((ev) => {
      activities.push({
        id: ev.id,
        type: 'event',
        title: ev.title,
        time: ev.created_at,
        created_at: ev.created_at,
      });
    });

    // ترتيب حسب التاريخ (الأحدث أولاً) وأخذ آخر 5
    const sorted = activities
      .sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
      .slice(0, 5);

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

  const handleDeleteDiscussion = async (id: string) => {
    if (
      confirm(
        'Are you sure you want to delete this discussion? All messages will be deleted as well.'
      )
    ) {
      const result = await deleteDiscussion(id);
      if (result.success) {
        await loadAllData();
        alert('Discussion deleted successfully');
      } else {
        alert('Error deleting discussion');
      }
    }
  };

  const handleDeleteMessage = async (messageId: string, discussionId: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      const result = await deleteMessage(messageId);
      if (result.success) {
        await loadAllData();
        alert('Message deleted successfully');
      } else {
        alert('Error deleting message');
      }
    }
  };

  const handleBanUser = async (userId: string, discussionId: string, userName: string) => {
    const reason = prompt(`Enter ban reason for ${userName}:`);
    if (reason !== null) {
      const result = await banUserFromDiscussion(
        userId,
        discussionId,
        reason || 'Violation of discussion rules'
      );
      if (result.success) {
        await loadAllData();
        alert('User banned successfully');
      } else {
        alert('Error banning user: ' + (result.error || 'Unknown error'));
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
      case 'book':
        return <Book className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'article':
        return <FileText className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="status-badge status-new">نشط</span>;
      case 'suspended':
        return (
          <span
            className="status-badge"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white' }}
          >
            معلق
          </span>
        );
      case 'deleted':
        return (
          <span
            className="status-badge"
            style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', color: 'white' }}
          >
            محذوف
          </span>
        );
      default:
        return <span className="status-badge status-featured">{status}</span>;
    }
  };

  // Helper function للحصول على أيقونة ولون النشاط
  const getActivityIconAndColor = (
    type: 'content' | 'user' | 'expert' | 'discussion' | 'event'
  ) => {
    switch (type) {
      case 'content':
        return {
          icon: <Plus className="h-5 w-5 text-white" />,
          gradient: 'from-[#10B981] to-[#059669]',
        };
      case 'expert':
        return {
          icon: <UserCog className="h-5 w-5 text-white" />,
          gradient: 'from-[#8B5CF6] to-[#7C3AED]',
        };
      case 'user':
        return {
          icon: <Users className="h-5 w-5 text-white" />,
          gradient: 'from-[#3B82F6] to-[#2563EB]',
        };
      case 'discussion':
        return {
          icon: <MessageSquare className="h-5 w-5 text-white" />,
          gradient: 'from-[#F59E0B] to-[#D97706]',
        };
      case 'event':
        return {
          icon: <Bell className="h-5 w-5 text-white" />,
          gradient: 'from-[#EF4444] to-[#DC2626]',
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
    <div className="bg-pattern flex min-h-screen">
      {/* Sidebar */}
      <div className="glass-effect flex w-80 flex-col border-r border-[#8B7355]/20">
        {/* Header */}
        <div className="border-b border-[#8B7355]/20 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#DC2626] to-[#B91C1C]">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="gradient-text text-xl font-bold">لوحة الإدارة</h1>
              <p className="text-sm text-[#6B7280]">التحكم الكامل في المنصة</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveSection('summary')}
              className={`flex w-full items-center gap-3 rounded-xl p-4 text-right transition-all ${
                activeSection === 'summary'
                  ? 'bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white shadow-lg'
                  : 'text-[#8B7355] hover:bg-[#8B7355]/10'
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">لوحة المعلومات</span>
            </button>

            <button
              onClick={() => setActiveSection('content')}
              className={`flex w-full items-center gap-3 rounded-xl p-4 text-right transition-all ${
                activeSection === 'content'
                  ? 'bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white shadow-lg'
                  : 'text-[#8B7355] hover:bg-[#8B7355]/10'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span className="font-medium">إدارة المحتوى</span>
            </button>

            <button
              onClick={() => setActiveSection('experts')}
              className={`flex w-full items-center gap-3 rounded-xl p-4 text-right transition-all ${
                activeSection === 'experts'
                  ? 'bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white shadow-lg'
                  : 'text-[#8B7355] hover:bg-[#8B7355]/10'
              }`}
            >
              <UserCog className="h-5 w-5" />
              <span className="font-medium">إدارة الخبراء</span>
            </button>

            <button
              onClick={() => setActiveSection('users')}
              className={`flex w-full items-center gap-3 rounded-xl p-4 text-right transition-all ${
                activeSection === 'users'
                  ? 'bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white shadow-lg'
                  : 'text-[#8B7355] hover:bg-[#8B7355]/10'
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="font-medium">إدارة المستخدمين</span>
            </button>

            <button
              onClick={() => setActiveSection('events')}
              className={`flex w-full items-center gap-3 rounded-xl p-4 text-right transition-all ${
                activeSection === 'events'
                  ? 'bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white shadow-lg'
                  : 'text-[#8B7355] hover:bg-[#8B7355]/10'
              }`}
            >
              <Calendar className="h-5 w-5" />
              <span className="font-medium">إدارة الفعاليات</span>
            </button>

            <button
              onClick={() => setActiveSection('discussions')}
              className={`flex w-full items-center gap-3 rounded-xl p-4 text-right transition-all ${
                activeSection === 'discussions'
                  ? 'bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white shadow-lg'
                  : 'text-[#8B7355] hover:bg-[#8B7355]/10'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              <span className="font-medium">إدارة النقاشات</span>
            </button>

            <button
              onClick={() => setActiveSection('analytics')}
              className={`flex w-full items-center gap-3 rounded-xl p-4 text-right transition-all ${
                activeSection === 'analytics'
                  ? 'bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white shadow-lg'
                  : 'text-[#8B7355] hover:bg-[#8B7355]/10'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="font-medium">التحليلات والتقارير</span>
            </button>
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-[#8B7355]/20 p-4">
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/settings')}
              className="btn-secondary flex flex-1 items-center justify-center gap-2 text-sm"
            >
              <Settings className="h-4 w-4" />
              <span>الإعدادات</span>
            </button>
            <button
              onClick={handleLogout}
              className="btn-secondary flex flex-1 items-center justify-center gap-2 text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
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
                {activeSection === 'discussions' && 'إدارة النقاشات'}
                {activeSection === 'analytics' && 'التحليلات والتقارير'}
              </h2>
              <p className="mt-1 text-[#6B7280]">
                {activeSection === 'summary' && 'نظرة شاملة على أداء المنصة'}
                {activeSection === 'content' && 'إضافة وحذف وإدارة المحتوى التعليمي'}
                {activeSection === 'experts' && 'مراقبة وإدارة حسابات الخبراء'}
                {activeSection === 'users' && 'مراقبة وإدارة حسابات المستخدمين'}
                {activeSection === 'events' && 'إضافة وإدارة الفعاليات القادمة'}
                {activeSection === 'discussions' && 'عرض ومراقبة جميع النقاشات والرسائل'}
                {activeSection === 'analytics' && 'تقارير مفصلة وإحصائيات المنصة'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className={`rounded-xl p-2 transition-colors hover:bg-[#8B7355]/10 ${refreshing ? 'animate-spin' : ''}`}
              >
                <RefreshCw className="h-5 w-5 text-[#8B7355]" />
              </button>
              <button
                onClick={() => setShowNotifications(true)}
                className="relative rounded-xl p-2 transition-colors hover:bg-[#8B7355]/10"
              >
                <Bell className="h-5 w-5 text-[#8B7355]" />
                {unreadNotifications > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              {activeSection === 'content' && (
                <button
                  onClick={() => setShowAddContent(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>إضافة محتوى</span>
                </button>
              )}
              {activeSection === 'experts' && (
                <button
                  onClick={() => setShowAddExpert(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>إضافة خبير</span>
                </button>
              )}
              {activeSection === 'events' && (
                <button
                  onClick={() => setShowAddEvent(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>إضافة فعالية</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {/* Summary Dashboard */}
          {activeSection === 'summary' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="content-card text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669]">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-1 text-2xl font-bold text-[#2D2D2D]">
                    {analytics.totalUsers.toLocaleString()}
                  </h3>
                  <p className="text-sm text-[#6B7280]">إجمالي المستخدمين</p>
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500">+{analytics.platformGrowthRate}%</span>
                  </div>
                </div>

                <div className="content-card text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]">
                    <UserCog className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-1 text-2xl font-bold text-[#2D2D2D]">
                    {analytics.totalExperts}
                  </h3>
                  <p className="text-sm text-[#6B7280]">إجمالي الخبراء</p>
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-yellow-500">4.7 تقييم</span>
                  </div>
                </div>

                <div className="content-card text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706]">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-1 text-2xl font-bold text-[#2D2D2D]">
                    {analytics.totalContent}
                  </h3>
                  <p className="text-sm text-[#6B7280]">إجمالي المحتوى</p>
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <Activity className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-blue-500">
                      {analytics.contentEngagementRate}% تفاعل
                    </span>
                  </div>
                </div>

                <div className="content-card text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#EF4444] to-[#DC2626]">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-1 text-2xl font-bold text-[#2D2D2D]">
                    {analytics.totalDiscussions}
                  </h3>
                  <p className="text-sm text-[#6B7280]">إجمالي النقاشات</p>
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <MessageSquare className="h-3 w-3 text-purple-500" />
                    <span className="text-xs text-purple-500">
                      {analytics.discussionEngagementRate}% مشاركة
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Users and Experts */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="content-card">
                  <h3 className="mb-6 text-xl font-bold text-[#2D2D2D]">أفضل 5 مستخدمين</h3>
                  <div className="space-y-4">
                    {topUsers.map((user, index) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-4 rounded-xl bg-[#8B7355]/5 p-3"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] text-sm font-bold text-white">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#2D2D2D]">{user.name}</h4>
                          <p className="text-sm text-[#6B7280]">
                            {user.hoursSpent} ساعة • {user.engagementRate}% تفاعل
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-[#8B7355]">
                            {user.contentEngaged}%
                          </div>
                          <div className="text-xs text-[#6B7280]">محتوى مكتمل</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="content-card">
                  <h3 className="mb-6 text-xl font-bold text-[#2D2D2D]">أفضل 5 خبراء</h3>
                  <div className="space-y-4">
                    {topExperts.map((expert, index) => (
                      <div
                        key={expert.id}
                        className="flex items-center gap-4 rounded-xl bg-[#8B7355]/5 p-3"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-sm font-bold text-white">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#2D2D2D]">{expert.name}</h4>
                          <p className="text-sm text-[#6B7280]">
                            {expert.discussionsHandled} نقاش • {expert.activityHours} ساعة
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-semibold text-[#8B7355]">
                              {expert.rating}
                            </span>
                          </div>
                          <div className="text-xs text-[#6B7280]">
                            {expert.engagementRate}% تفاعل
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="content-card">
                <h3 className="mb-6 text-xl font-bold text-[#2D2D2D]">النشاط الأخير</h3>
                {recentActivities.length === 0 ? (
                  <div className="py-8 text-center">
                    <Activity className="mx-auto mb-3 h-12 w-12 text-[#8B7355]/30" />
                    <p className="text-[#6B7280]">لا توجد نشاطات حديثة</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivities.map((activity) => {
                      const { icon, gradient } = getActivityIconAndColor(activity.type);
                      return (
                        <div
                          key={activity.id}
                          className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-[#8B7355]/5"
                        >
                          <div
                            className={`h-10 w-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
                          >
                            {icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-[#2D2D2D]">{getActivityTitle(activity)}</p>
                            <p className="text-sm text-[#6B7280]">
                              {getRelativeTime(activity.created_at)}
                            </p>
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
              <div className="mb-6 flex items-center gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="البحث في المحتوى..."
                    className="input-modern has-right-icon w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-[#8B7355]" />
                </div>
                <button className="btn-secondary flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>تصفية</span>
                </button>
                <button className="btn-secondary flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span>تصدير</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {contentList.length === 0 ? (
                  <div className="col-span-full py-12 text-center">
                    <BookOpen className="mx-auto mb-4 h-16 w-16 text-[#8B7355]/30" />
                    <p className="text-[#6B7280]">لا يوجد محتوى في الداتا بيس بعد</p>
                  </div>
                ) : (
                  contentList.map((content) => (
                    <div key={content.id} className="content-card card-hover group">
                      <div className="relative mb-4 h-48 overflow-hidden rounded-xl">
                        <img
                          src={
                            content.image_url ||
                            'https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg'
                          }
                          alt={content.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute left-3 top-3 flex gap-2">
                          <button
                            onClick={() => handleEditContent(content)}
                            className="rounded-lg bg-white/90 p-2 text-blue-600 transition-colors hover:bg-blue-500 hover:text-white"
                            title="تعديل المحتوى"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteContent(content.id)}
                            className="rounded-lg bg-white/90 p-2 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                            title="حذف المحتوى"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {getContentIcon(content.content_type)}
                          <h3 className="text-lg font-bold leading-tight text-[#2D2D2D]">
                            {content.title}
                          </h3>
                        </div>
                        <p className="line-clamp-2 text-sm text-[#6B7280]">
                          {content.description || 'لا يوجد وصف'}
                        </p>
                        <div className="flex items-center justify-between border-t border-[#8B7355]/10 pt-2">
                          <span className="text-sm text-[#6B7280]">
                            {new Date(content.created_at).toLocaleDateString('ar-SA')}
                          </span>
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
              <div className="mb-6 flex items-center justify-between">
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
                    <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-[#8B7355]" />
                  </div>
                  <button className="btn-secondary flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>تصفية</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#8B7355]/20">
                      <th className="p-4 text-right font-semibold text-[#2D2D2D]">الخبير</th>
                      <th className="p-4 text-right font-semibold text-[#2D2D2D]">التخصص</th>
                      <th className="p-4 text-right font-semibold text-[#2D2D2D]">النقاشات</th>
                      <th className="p-4 text-right font-semibold text-[#2D2D2D]">ساعات النشاط</th>
                      <th className="p-4 text-right font-semibold text-[#2D2D2D]">التقييم</th>
                      <th className="p-4 text-right font-semibold text-[#2D2D2D]">الحالة</th>
                      <th className="p-4 text-right font-semibold text-[#2D2D2D]">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {experts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center">
                          <UserCog className="mx-auto mb-4 h-16 w-16 text-[#8B7355]/30" />
                          <p className="text-[#6B7280]">لا يوجد خبراء في قاعدة البيانات</p>
                        </td>
                      </tr>
                    ) : (
                      experts.map((expert) => (
                        <tr
                          key={expert.id}
                          className="border-b border-[#8B7355]/10 transition-colors hover:bg-[#8B7355]/5"
                        >
                          <td className="p-4">
                            <div>
                              <div className="font-semibold text-[#2D2D2D]">
                                {expert.full_name || expert.email}
                              </div>
                              <div className="text-sm text-[#6B7280]">{expert.email}</div>
                            </div>
                          </td>
                          <td className="p-4 text-[#6B7280]">الأمن الفكري</td>
                          <td className="p-4 font-semibold text-[#2D2D2D]">-</td>
                          <td className="p-4 text-[#2D2D2D]">-</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
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
                                className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-100"
                                title="عرض التفاصيل"
                              >
                                <Eye className="h-4 w-4" />
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
                                className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-100"
                                title="حذف الخبير"
                              >
                                <Trash2 className="h-4 w-4" />
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
              <div className="mb-6 flex items-center justify-between">
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
                    <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-[#8B7355]" />
                  </div>
                  <button className="btn-secondary flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>تصفية</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#8B7355]/20">
                      <th className="p-4 text-right font-semibold text-[#2D2D2D]">المستخدم</th>
                      <th className="p-4 text-right font-semibold text-[#2D2D2D]">
                        ساعات الاستخدام
                      </th>
                      <th className="p-4 text-right font-semibold text-[#2D2D2D]">معدل التفاعل</th>
                      <th className="p-4 text-right font-semibold text-[#2D2D2D]">
                        المحتوى المكتمل
                      </th>
                      <th className="p-4 text-right font-semibold text-[#2D2D2D]">النقاشات</th>
                      <th className="p-4 text-right font-semibold text-[#2D2D2D]">الحالة</th>
                      <th className="p-4 text-right font-semibold text-[#2D2D2D]">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center">
                          <Users className="mx-auto mb-4 h-16 w-16 text-[#8B7355]/30" />
                          <p className="text-[#6B7280]">لا يوجد مستخدمون في قاعدة البيانات</p>
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => {
                        // حساب الوقت منذ التسجيل
                        const daysAgo = Math.floor(
                          (new Date().getTime() - new Date(user.created_at).getTime()) /
                            (1000 * 60 * 60 * 24)
                        );
                        // افتراض ساعات الاستخدام (متوسط ساعة يومياً)
                        const hoursSpent = Math.max(0, daysAgo);

                        return (
                          <tr
                            key={user.id}
                            className="border-b border-[#8B7355]/10 transition-colors hover:bg-[#8B7355]/5"
                          >
                            <td className="p-4">
                              <div>
                                <div className="font-semibold text-[#2D2D2D]">
                                  {user.full_name || user.email}
                                </div>
                                <div className="text-sm text-[#6B7280]">{user.email}</div>
                                <div className="mt-1 text-xs text-[#8B7355]">
                                  عضو منذ {daysAgo === 0 ? 'اليوم' : `${daysAgo} يوم`}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-semibold text-[#2D2D2D]">{hoursSpent} ساعة</td>
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
                                  className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-100"
                                  title="عرض التفاصيل"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
                                      try {
                                        const result = await deleteUser(user.id);

                                        if (result.success) {
                                          // Immediately update UI by removing user from state
                                          setUsers((prevUsers) =>
                                            prevUsers.filter((u) => u.id !== user.id)
                                          );
                                          alert('تم حذف المستخدم بنجاح');
                                          // Reload all data in background to update analytics
                                          loadAllData();
                                        } else {
                                          alert('حدث خطأ أثناء حذف المستخدم: ' + result.error);
                                        }
                                      } catch (err) {
                                        alert('حدث خطأ غير متوقع: ' + err);
                                      }
                                    }
                                  }}
                                  className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-100"
                                  title="حذف المستخدم"
                                >
                                  <Trash2 className="h-4 w-4" />
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
              <div className="mb-6 flex items-center gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="البحث في الفعاليات..."
                    className="input-modern has-right-icon w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-[#8B7355]" />
                </div>
                <button className="btn-secondary flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>تصفية</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {eventsList.length === 0 ? (
                  <div className="col-span-full py-12 text-center">
                    <Calendar className="mx-auto mb-4 h-16 w-16 text-[#8B7355]/30" />
                    <p className="text-[#6B7280]">لا توجد فعاليات في قاعدة البيانات</p>
                  </div>
                ) : (
                  eventsList.map((event) => (
                    <div key={event.id} className="content-card card-hover group">
                      <div className="relative mb-4 h-48 overflow-hidden rounded-xl">
                        <img
                          src={
                            event.image_url ||
                            'https://images.pexels.com/photos/1181403/pexels-photo-1181403.jpeg'
                          }
                          alt={event.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute left-3 top-3 flex gap-2">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="rounded-lg bg-white/90 p-2 text-blue-600 transition-colors hover:bg-blue-500 hover:text-white"
                            title="تعديل الفعالية"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="rounded-lg bg-white/90 p-2 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                            title="حذف الفعالية"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="absolute right-3 top-3">
                          <span
                            className={`status-badge ${
                              event.event_type === 'course'
                                ? 'status-new'
                                : event.event_type === 'workshop'
                                  ? 'status-trending'
                                  : 'status-featured'
                            }`}
                          >
                            {event.event_type === 'course'
                              ? 'دورة'
                              : event.event_type === 'workshop'
                                ? 'ورشة عمل'
                                : event.event_type === 'seminar'
                                  ? 'ندوة'
                                  : 'ويبينار'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-lg font-bold leading-tight text-[#2D2D2D]">
                          {event.title}
                        </h3>
                        <p className="line-clamp-2 text-sm text-[#6B7280]">
                          {event.description || 'لا يوجد وصف'}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(event.start_date).toLocaleDateString('ar-SA')}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                              {event.is_online ? (
                                <Globe className="h-4 w-4" />
                              ) : (
                                <MapPin className="h-4 w-4" />
                              )}
                              <span>{event.is_online ? 'عبر الإنترنت' : event.location}</span>
                            </div>
                          )}
                          {event.instructor_name && (
                            <div className="text-sm font-semibold text-[#8B7355]">
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

          {/* Discussions Management */}
          {activeSection === 'discussions' && (
            <div>
              <div className="mb-6 flex items-center gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="البحث في النقاشات..."
                    className="input-modern has-right-icon w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-[#8B7355]" />
                </div>
                <button className="btn-secondary flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>تصفية</span>
                </button>
              </div>

              <div className="space-y-6">
                {discussionsList.length === 0 ? (
                  <div className="py-12 text-center">
                    <MessageSquare className="mx-auto mb-4 h-16 w-16 text-[#8B7355]/30" />
                    <p className="text-[#6B7280]">لا توجد نقاشات في قاعدة البيانات</p>
                  </div>
                ) : (
                  discussionsList.map((discussion) => (
                    <div key={discussion.id} className="content-card">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <MessageSquare className="h-5 w-5 text-[#8B7355]" />
                            <h3 className="text-xl font-bold text-[#2D2D2D]">{discussion.title}</h3>
                          </div>
                          {discussion.description && (
                            <p className="mb-3 text-sm text-[#6B7280]">{discussion.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {discussion.creator?.full_name || 'مستخدم محذوف'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(discussion.created_at).toLocaleDateString('ar-SA')}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-[#8B7355]">
                              <MessageSquare className="h-4 w-4" />
                              {discussion.messageCount || 0} رسالة
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteDiscussion(discussion.id)}
                          className="rounded-lg bg-red-50 p-2 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                          title="Delete Discussion"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      {discussion.messages && discussion.messages.length > 0 && (
                        <div className="mt-4 space-y-3 border-t border-[#8B7355]/10 pt-4">
                          <h4 className="mb-3 font-semibold text-[#2D2D2D]">الرسائل:</h4>
                          <div className="max-h-96 space-y-3 overflow-y-auto">
                            {discussion.messages.map((message: any) => {
                              const isExpert = message.sender?.role === 'expert';
                              const senderName = message.sender?.full_name || 'مستخدم محذوف';
                              const messageTime = new Date(message.created_at).toLocaleString(
                                'ar-SA',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              );

                              return (
                                <div
                                  key={message.id}
                                  className={`rounded-xl p-4 ${
                                    isExpert
                                      ? 'border-2 border-[#8B5CF6]/20 bg-gradient-to-br from-[#8B5CF6]/10 to-[#7C3AED]/10'
                                      : 'border-2 border-[#8B7355]/10 bg-[#F4EFE9]'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div
                                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                                        isExpert
                                          ? 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]'
                                          : 'bg-gradient-to-br from-[#8B7355] to-[#654321]'
                                      }`}
                                    >
                                      {senderName.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="mb-1 flex items-center gap-2">
                                        <span
                                          className={`text-sm font-semibold ${isExpert ? 'text-[#8B5CF6]' : 'text-[#654321]'}`}
                                        >
                                          {senderName}
                                        </span>
                                        {isExpert && (
                                          <span className="rounded-full bg-[#8B5CF6]/20 px-2 py-0.5 text-xs font-semibold text-[#8B5CF6]">
                                            خبير
                                          </span>
                                        )}
                                        <span className="text-xs text-[#6B7280]">
                                          {messageTime}
                                        </span>
                                      </div>
                                      <p className="break-words text-sm leading-relaxed text-[#2D2D2D]">
                                        {message.content}
                                      </p>
                                    </div>
                                    <div className="flex flex-shrink-0 items-center gap-1">
                                      <button
                                        onClick={() =>
                                          handleBanUser(
                                            message.sender_id,
                                            discussion.id,
                                            senderName
                                          )
                                        }
                                        className="rounded-lg p-1.5 text-orange-600 transition-colors hover:bg-orange-100"
                                        title="Ban User"
                                      >
                                        <Ban className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteMessage(message.id, discussion.id)
                                        }
                                        className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-100"
                                        title="Delete Message"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="content-card">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#2D2D2D]">المستخدمون النشطون</h3>
                    <Activity className="h-5 w-5 text-[#10B981]" />
                  </div>
                  <div className="mb-2 text-3xl font-bold text-[#2D2D2D]">
                    {analytics.activeUsersThisWeek}
                  </div>
                  <div className="text-sm text-[#6B7280]">هذا الأسبوع</div>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">+15.3% من الأسبوع الماضي</span>
                  </div>
                </div>

                <div className="content-card">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#2D2D2D]">معدل التفاعل</h3>
                    <MessageSquare className="h-5 w-5 text-[#8B5CF6]" />
                  </div>
                  <div className="mb-2 text-3xl font-bold text-[#2D2D2D]">
                    {analytics.discussionEngagementRate}%
                  </div>
                  <div className="text-sm text-[#6B7280]">في النقاشات</div>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">+8.7% من الشهر الماضي</span>
                  </div>
                </div>

                <div className="content-card">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#2D2D2D]">نمو المنصة</h3>
                    <BarChart3 className="h-5 w-5 text-[#F59E0B]" />
                  </div>
                  <div className="mb-2 text-3xl font-bold text-[#2D2D2D]">
                    {analytics.platformGrowthRate}%
                  </div>
                  <div className="text-sm text-[#6B7280]">معدل النمو الشهري</div>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">مستقر</span>
                  </div>
                </div>
              </div>

              {/* Detailed Reports */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="content-card">
                  <h3 className="mb-6 text-xl font-bold text-[#2D2D2D]">تقرير الاستخدام اليومي</h3>
                  {dailyUsageData.length === 0 ? (
                    <div className="flex h-64 items-center justify-center text-[#6B7280]">
                      <div className="text-center">
                        <BarChart3 className="mx-auto mb-4 h-16 w-16 opacity-50" />
                        <p>جاري تحميل البيانات...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-64">
                      {/* Bar Chart */}
                      <div className="absolute inset-0 flex items-end justify-between gap-2 px-4 pb-12">
                        {dailyUsageData.map((data, index) => {
                          const maxValue = Math.max(
                            ...dailyUsageData.map((d) => d.users + d.content + d.discussions)
                          );
                          const totalValue = data.users + data.content + data.discussions;
                          const heightPercentage = maxValue > 0 ? (totalValue / maxValue) * 100 : 0;

                          return (
                            <div
                              key={index}
                              className="group flex flex-1 flex-col items-center gap-2"
                            >
                              {/* الأعمدة المكدسة */}
                              <div
                                className="relative w-full overflow-hidden rounded-t-lg bg-gradient-to-t from-[#8B7355]/10 to-[#8B7355]/5 transition-all duration-300 hover:shadow-lg"
                                style={{
                                  height: `${heightPercentage}%`,
                                  minHeight: totalValue > 0 ? '20px' : '5px',
                                }}
                              >
                                {/* عمود المستخدمين */}
                                {data.users > 0 && (
                                  <div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#10B981] to-[#059669]"
                                    style={{
                                      height: `${totalValue > 0 ? (data.users / totalValue) * 100 : 0}%`,
                                    }}
                                  ></div>
                                )}
                                {/* عمود المحتوى */}
                                {data.content > 0 && (
                                  <div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#F59E0B] to-[#D97706]"
                                    style={{
                                      height: `${totalValue > 0 ? (data.content / totalValue) * 100 : 0}%`,
                                      transform: `translateY(-${data.users > 0 ? (data.users / totalValue) * 100 : 0}%)`,
                                    }}
                                  ></div>
                                )}
                                {/* عمود النقاشات */}
                                {data.discussions > 0 && (
                                  <div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#8B5CF6] to-[#7C3AED]"
                                    style={{
                                      height: `${totalValue > 0 ? (data.discussions / totalValue) * 100 : 0}%`,
                                      transform: `translateY(-${((data.users + data.content) / totalValue) * 100}%)`,
                                    }}
                                  ></div>
                                )}

                                {/* Tooltip عند التمرير */}
                                <div className="absolute inset-0 flex items-center justify-center rounded-t-lg bg-black/70 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                                  <div className="text-center">
                                    <div>{totalValue}</div>
                                    <div className="text-[10px] opacity-75">إجمالي</div>
                                  </div>
                                </div>
                              </div>

                              {/* اسم اليوم */}
                              <div className="text-center text-xs font-medium text-[#6B7280]">
                                {data.day}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* المفاتيح */}
                      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded bg-gradient-to-br from-[#10B981] to-[#059669]"></div>
                          <span className="text-[#6B7280]">مستخدمين</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded bg-gradient-to-br from-[#F59E0B] to-[#D97706]"></div>
                          <span className="text-[#6B7280]">محتوى</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]"></div>
                          <span className="text-[#6B7280]">نقاشات</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="content-card">
                  <h3 className="mb-6 text-xl font-bold text-[#2D2D2D]">توزيع المحتوى</h3>
                  {analytics.totalContent === 0 ? (
                    <div className="py-8 text-center">
                      <BookOpen className="mx-auto mb-3 h-12 w-12 text-[#8B7355]/30" />
                      <p className="text-[#6B7280]">لا يوجد محتوى في الداتا بيس</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Book className="h-5 w-5 text-[#10B981]" />
                          <span className="text-[#2D2D2D]">الكتب</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-[#10B981] transition-all duration-500"
                              style={{
                                width: `${analytics.totalContent > 0 ? (contentDistribution.books / analytics.totalContent) * 100 : 0}%`,
                              }}
                            ></div>
                          </div>
                          <span className="min-w-[2rem] text-right text-sm text-[#6B7280]">
                            {contentDistribution.books}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Video className="h-5 w-5 text-[#8B5CF6]" />
                          <span className="text-[#2D2D2D]">الفيديوهات</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-[#8B5CF6] transition-all duration-500"
                              style={{
                                width: `${analytics.totalContent > 0 ? (contentDistribution.videos / analytics.totalContent) * 100 : 0}%`,
                              }}
                            ></div>
                          </div>
                          <span className="min-w-[2rem] text-right text-sm text-[#6B7280]">
                            {contentDistribution.videos}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-[#F59E0B]" />
                          <span className="text-[#2D2D2D]">المقالات</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-[#F59E0B] transition-all duration-500"
                              style={{
                                width: `${analytics.totalContent > 0 ? (contentDistribution.articles / analytics.totalContent) * 100 : 0}%`,
                              }}
                            ></div>
                          </div>
                          <span className="min-w-[2rem] text-right text-sm text-[#6B7280]">
                            {contentDistribution.articles}
                          </span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="glass-effect flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl">
            <div className="flex-shrink-0 border-b border-[#8B7355]/20 p-6">
              <h3 className="text-xl font-bold text-[#2D2D2D]">إضافة محتوى جديد</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}
              <form onSubmit={handleAddContent} className="space-y-6">
                <div>
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">عنوان المحتوى</label>
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
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">نوع المحتوى</label>
                  <select
                    className="input-modern w-full"
                    value={newContent.content_type}
                    onChange={(e) =>
                      setNewContent({ ...newContent, content_type: e.target.value as ContentType })
                    }
                  >
                    <option value="book">كتاب</option>
                    <option value="video">فيديو</option>
                    <option value="article">مقال</option>
                    <option value="course">دورة</option>
                  </select>
                </div>
                <div>
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">الوصف</label>
                  <textarea
                    className="input-modern h-24 w-full resize-none"
                    placeholder="أدخل وصف المحتوى"
                    value={newContent.description}
                    onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                  ></textarea>
                </div>
                <div>
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">
                    رابط الصورة (اختياري)
                  </label>
                  <input
                    type="url"
                    className="input-modern w-full"
                    placeholder="https://example.com/image.jpg"
                    value={newContent.image_url}
                    onChange={(e) => setNewContent({ ...newContent, image_url: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">
                    رابط المحتوى/التحميل (اختياري)
                  </label>
                  <input
                    type="url"
                    className="input-modern w-full"
                    placeholder="https://example.com/file.pdf أو رابط فيديو"
                    value={newContent.file_url}
                    onChange={(e) => setNewContent({ ...newContent, file_url: e.target.value })}
                  />
                  <p className="mt-2 text-xs text-[#6B7280]">
                    أدخل رابط الملف للتحميل (كتاب PDF) أو رابط المشاهدة (فيديو YouTube)
                  </p>
                </div>
              </form>
            </div>
            <div className="flex flex-shrink-0 gap-3 border-t border-[#8B7355]/20 p-6">
              <button
                onClick={(e) => handleAddContent(e as any)}
                disabled={loading}
                className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="glass-effect flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl">
            <div className="flex-shrink-0 border-b border-[#8B7355]/20 p-6">
              <h3 className="text-xl font-bold text-[#2D2D2D]">تعديل المحتوى</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}
              <form onSubmit={handleUpdateContent} className="space-y-6">
                <div>
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">عنوان المحتوى</label>
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
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">نوع المحتوى</label>
                  <select
                    className="input-modern w-full"
                    value={newContent.content_type}
                    onChange={(e) =>
                      setNewContent({ ...newContent, content_type: e.target.value as ContentType })
                    }
                  >
                    <option value="book">كتاب</option>
                    <option value="video">فيديو</option>
                    <option value="article">مقال</option>
                    <option value="course">دورة</option>
                  </select>
                </div>
                <div>
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">الوصف</label>
                  <textarea
                    className="input-modern h-24 w-full resize-none"
                    placeholder="أدخل وصف المحتوى"
                    value={newContent.description}
                    onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                  ></textarea>
                </div>
                <div>
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">
                    رابط الصورة (اختياري)
                  </label>
                  <input
                    type="url"
                    className="input-modern w-full"
                    placeholder="https://example.com/image.jpg"
                    value={newContent.image_url}
                    onChange={(e) => setNewContent({ ...newContent, image_url: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">
                    رابط المحتوى/التحميل (اختياري)
                  </label>
                  <input
                    type="url"
                    className="input-modern w-full"
                    placeholder="https://example.com/file.pdf أو رابط فيديو"
                    value={newContent.file_url}
                    onChange={(e) => setNewContent({ ...newContent, file_url: e.target.value })}
                  />
                  <p className="mt-2 text-xs text-[#6B7280]">
                    أدخل رابط الملف للتحميل (كتاب PDF) أو رابط المشاهدة (فيديو YouTube)
                  </p>
                </div>
              </form>
            </div>
            <div className="flex flex-shrink-0 gap-3 border-t border-[#8B7355]/20 p-6">
              <button
                onClick={(e) => handleUpdateContent(e as any)}
                disabled={loading}
                className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="glass-effect w-full max-w-lg overflow-hidden rounded-2xl">
            <div className="border-b border-[#8B5CF6]/20 p-6">
              <h3 className="text-xl font-bold text-[#2D2D2D]">تفاصيل المستخدم</h3>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-sm text-[#6B7280]">الاسم الكامل</label>
                <p className="font-semibold text-[#2D2D2D]">
                  {selectedUser.full_name || 'غير محدد'}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#6B7280]">البريد الإلكتروني</label>
                <p className="font-semibold text-[#2D2D2D]">{selectedUser.email}</p>
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#6B7280]">رقم الهاتف</label>
                <p className="font-semibold text-[#2D2D2D]">{selectedUser.phone || 'غير محدد'}</p>
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#6B7280]">الدور</label>
                <p className="font-semibold text-[#2D2D2D]">
                  {selectedUser.role === 'user'
                    ? 'مستخدم'
                    : selectedUser.role === 'expert'
                      ? 'خبير'
                      : 'مدير'}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#6B7280]">تاريخ التسجيل</label>
                <p className="font-semibold text-[#2D2D2D]">
                  {new Date(selectedUser.created_at).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#6B7280]">الحالة</label>
                <span className="status-badge status-trending">نشط</span>
              </div>
            </div>
            <div className="flex justify-end border-t border-[#8B5CF6]/20 p-6">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="glass-effect flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl">
            <div className="flex-shrink-0 border-b border-[#8B7355]/20 p-6">
              <h3 className="text-xl font-bold text-[#2D2D2D]">إضافة خبير جديد</h3>
              <p className="mt-1 text-sm text-[#6B7280]">سيتم إنشاء حساب جديد للخبير في النظام</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}
              <form onSubmit={handleAddExpert} className="space-y-6">
                <div>
                  <label className="mb-3 block flex items-center gap-2 font-semibold text-[#2D2D2D]">
                    <Mail className="h-4 w-4 text-[#8B7355]" />
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
                  <label className="mb-3 block flex items-center gap-2 font-semibold text-[#2D2D2D]">
                    <Lock className="h-4 w-4 text-[#8B7355]" />
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
                  <p className="mt-2 text-xs text-[#6B7280]">
                    سيتمكن الخبير من تسجيل الدخول مباشرة بهذه البيانات
                  </p>
                </div>
                <div>
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">الاسم الكامل</label>
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
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">التخصص</label>
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
                  <label className="mb-3 block flex items-center gap-2 font-semibold text-[#2D2D2D]">
                    <Phone className="h-4 w-4 text-[#8B7355]" />
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
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">
                    نبذة عن الخبير (اختياري)
                  </label>
                  <textarea
                    className="input-modern h-24 w-full resize-none"
                    placeholder="نبذة مختصرة عن خبرة وتجربة الخبير..."
                    value={newExpert.bio}
                    onChange={(e) => setNewExpert({ ...newExpert, bio: e.target.value })}
                  ></textarea>
                </div>
              </form>
            </div>
            <div className="flex flex-shrink-0 gap-3 border-t border-[#8B7355]/20 p-6">
              <button
                onClick={(e) => handleAddExpert(e as any)}
                disabled={loading}
                className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="glass-effect flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl">
            <div className="flex-shrink-0 border-b border-[#8B7355]/20 p-6">
              <h3 className="text-xl font-bold text-[#2D2D2D]">إضافة فعالية جديدة</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}
              <form onSubmit={handleAddEvent} className="space-y-6">
                <div>
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">عنوان الفعالية</label>
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
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">نوع الفعالية</label>
                  <select
                    className="input-modern w-full"
                    value={newEvent.event_type}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, event_type: e.target.value as EventType })
                    }
                  >
                    <option value="course">دورة</option>
                    <option value="workshop">ورشة عمل</option>
                    <option value="seminar">ندوة</option>
                    <option value="webinar">ويبينار</option>
                  </select>
                </div>
                <div>
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">الوصف</label>
                  <textarea
                    className="input-modern h-24 w-full resize-none"
                    placeholder="أدخل وصف الفعالية"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-3 block font-semibold text-[#2D2D2D]">تاريخ البدء</label>
                    <input
                      type="datetime-local"
                      className="input-modern w-full"
                      value={newEvent.start_date}
                      onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-3 block font-semibold text-[#2D2D2D]">
                      تاريخ الانتهاء (اختياري)
                    </label>
                    <input
                      type="datetime-local"
                      className="input-modern w-full"
                      value={newEvent.end_date}
                      onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newEvent.is_online}
                      onChange={(e) => setNewEvent({ ...newEvent, is_online: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="font-semibold text-[#2D2D2D]">فعالية عبر الإنترنت</span>
                  </label>
                </div>
                {!newEvent.is_online && (
                  <div>
                    <label className="mb-3 block font-semibold text-[#2D2D2D]">الموقع</label>
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
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">
                    اسم المدرب (اختياري)
                  </label>
                  <input
                    type="text"
                    className="input-modern w-full"
                    placeholder="د. أحمد محمد"
                    value={newEvent.instructor_name}
                    onChange={(e) => setNewEvent({ ...newEvent, instructor_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">
                    الجهة المنظمة (اختياري)
                  </label>
                  <input
                    type="text"
                    className="input-modern w-full"
                    placeholder="اسم الجهة المنظمة"
                    value={newEvent.organizer}
                    onChange={(e) => setNewEvent({ ...newEvent, organizer: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">
                    رابط التسجيل (اختياري)
                  </label>
                  <input
                    type="url"
                    className="input-modern w-full"
                    placeholder="https://example.com/register"
                    value={newEvent.registration_link}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, registration_link: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">
                    معلومات الاتصال (اختياري)
                  </label>
                  <input
                    type="text"
                    className="input-modern w-full"
                    placeholder="بريد إلكتروني أو رقم هاتف"
                    value={newEvent.contact_info}
                    onChange={(e) => setNewEvent({ ...newEvent, contact_info: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">
                    رابط الصورة (اختياري)
                  </label>
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
            <div className="flex flex-shrink-0 gap-3 border-t border-[#8B7355]/20 p-6">
              <button
                onClick={(e) => handleAddEvent(e as any)}
                disabled={loading}
                className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="glass-effect flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl">
            <div className="flex-shrink-0 border-b border-[#8B7355]/20 p-6">
              <h3 className="text-xl font-bold text-[#2D2D2D]">تعديل الفعالية</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}
              <form onSubmit={handleUpdateEvent} className="space-y-6">
                <div>
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">عنوان الفعالية</label>
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
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">نوع الفعالية</label>
                  <select
                    className="input-modern w-full"
                    value={newEvent.event_type}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, event_type: e.target.value as EventType })
                    }
                  >
                    <option value="course">دورة</option>
                    <option value="workshop">ورشة عمل</option>
                    <option value="seminar">ندوة</option>
                    <option value="webinar">ويبينار</option>
                  </select>
                </div>
                <div>
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">الوصف</label>
                  <textarea
                    className="input-modern h-24 w-full resize-none"
                    placeholder="أدخل وصف الفعالية"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-3 block font-semibold text-[#2D2D2D]">تاريخ البدء</label>
                    <input
                      type="datetime-local"
                      className="input-modern w-full"
                      value={newEvent.start_date}
                      onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-3 block font-semibold text-[#2D2D2D]">
                      تاريخ الانتهاء (اختياري)
                    </label>
                    <input
                      type="datetime-local"
                      className="input-modern w-full"
                      value={newEvent.end_date}
                      onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newEvent.is_online}
                      onChange={(e) => setNewEvent({ ...newEvent, is_online: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="font-semibold text-[#2D2D2D]">فعالية عبر الإنترنت</span>
                  </label>
                </div>
                {!newEvent.is_online && (
                  <div>
                    <label className="mb-3 block font-semibold text-[#2D2D2D]">الموقع</label>
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
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">
                    اسم المدرب (اختياري)
                  </label>
                  <input
                    type="text"
                    className="input-modern w-full"
                    placeholder="د. أحمد محمد"
                    value={newEvent.instructor_name}
                    onChange={(e) => setNewEvent({ ...newEvent, instructor_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">
                    الجهة المنظمة (اختياري)
                  </label>
                  <input
                    type="text"
                    className="input-modern w-full"
                    placeholder="اسم الجهة المنظمة"
                    value={newEvent.organizer}
                    onChange={(e) => setNewEvent({ ...newEvent, organizer: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">
                    رابط التسجيل (اختياري)
                  </label>
                  <input
                    type="url"
                    className="input-modern w-full"
                    placeholder="https://example.com/register"
                    value={newEvent.registration_link}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, registration_link: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">
                    معلومات الاتصال (اختياري)
                  </label>
                  <input
                    type="text"
                    className="input-modern w-full"
                    placeholder="بريد إلكتروني أو رقم هاتف"
                    value={newEvent.contact_info}
                    onChange={(e) => setNewEvent({ ...newEvent, contact_info: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-3 block font-semibold text-[#2D2D2D]">
                    رابط الصورة (اختياري)
                  </label>
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
            <div className="flex flex-shrink-0 gap-3 border-t border-[#8B7355]/20 p-6">
              <button
                onClick={(e) => handleUpdateEvent(e as any)}
                disabled={loading}
                className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
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
