import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Users, UserCog, BookOpen, BarChart3, Home, Search, Filter, Plus, Trash2, Ban, Eye, CreditCard as Edit, Settings, LogOut, Bell, TrendingUp, Clock, MessageSquare, Star, Activity, Download, RefreshCw, AlertTriangle, CheckCircle, XCircle, Video, FileText, Book } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';

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
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications] = useState(8); // عدد الإشعارات غير المقروءة للمدير

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

  const [users] = useState<User[]>([
    {
      id: 1,
      name: "أحمد محمد السالم",
      email: "ahmed@example.com",
      role: "user",
      status: "active",
      joinDate: "2024/01/15",
      lastActive: "2024/03/20",
      hoursSpent: 45.5,
      engagementRate: 89.2,
      contentEngaged: 78,
      discussionsParticipated: 12
    },
    {
      id: 2,
      name: "فاطمة عبدالله",
      email: "fatima@example.com",
      role: "user",
      status: "active",
      joinDate: "2024/02/10",
      lastActive: "2024/03/19",
      hoursSpent: 32.8,
      engagementRate: 76.4,
      contentEngaged: 65,
      discussionsParticipated: 8
    },
    {
      id: 3,
      name: "محمد العتيبي",
      email: "mohammed@example.com",
      role: "user",
      status: "suspended",
      joinDate: "2024/01/20",
      lastActive: "2024/03/15",
      hoursSpent: 28.3,
      engagementRate: 45.2,
      contentEngaged: 34,
      discussionsParticipated: 3
    }
  ]);

  const [experts] = useState<Expert[]>([
    {
      id: 1,
      name: "د. أحمد السالم",
      email: "expert1@faten.com",
      status: "active",
      joinDate: "2023/12/01",
      discussionsHandled: 45,
      activityHours: 120.5,
      engagementRate: 92.3,
      rating: 4.8,
      specialization: "الأمن الفكري"
    },
    {
      id: 2,
      name: "د. سارة الحربي",
      email: "expert2@faten.com",
      status: "active",
      joinDate: "2024/01/15",
      discussionsHandled: 38,
      activityHours: 98.2,
      engagementRate: 87.6,
      rating: 4.6,
      specialization: "التربية الإسلامية"
    }
  ]);

  const [contentList] = useState<Content[]>([
    {
      id: 1,
      title: "أسس الأمن الفكري",
      type: "book",
      category: "كتب",
      author: "د. محمد الشهري",
      uploadDate: "2024/03/01",
      views: 1247,
      likes: 189,
      status: "published",
      image: "https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg"
    },
    {
      id: 2,
      title: "الوسطية في الإسلام",
      type: "video",
      category: "فيديوهات",
      author: "د. أحمد السالم",
      uploadDate: "2024/03/10",
      views: 892,
      likes: 156,
      status: "published",
      image: "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg"
    },
    {
      id: 3,
      title: "التحديات المعاصرة",
      type: "article",
      category: "مقالات",
      author: "د. سارة الحربي",
      uploadDate: "2024/03/15",
      views: 654,
      likes: 98,
      status: "published",
      image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg"
    }
  ]);

  const topUsers = users.slice(0, 5).sort((a, b) => b.hoursSpent - a.hoursSpent);
  const topExperts = experts.slice(0, 5).sort((a, b) => b.discussionsHandled - a.discussionsHandled);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
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
                {activeSection === 'summary' && 'لوحة المعلومات الرئيسية'}
                {activeSection === 'content' && 'إدارة المحتوى'}
                {activeSection === 'experts' && 'إدارة الخبراء'}
                {activeSection === 'users' && 'إدارة المستخدمين'}
                {activeSection === 'analytics' && 'التحليلات والتقارير'}
              </h2>
              <p className="text-[#6B7280] mt-1">
                {activeSection === 'summary' && 'نظرة شاملة على أداء المنصة'}
                {activeSection === 'content' && 'إضافة وحذف وإدارة المحتوى التعليمي'}
                {activeSection === 'experts' && 'مراقبة وإدارة حسابات الخبراء'}
                {activeSection === 'users' && 'مراقبة وإدارة حسابات المستخدمين'}
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
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#8B7355]/5 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[#2D2D2D]">تم إضافة محتوى جديد: "مهارات التفكير النقدي"</p>
                      <p className="text-sm text-[#6B7280]">منذ 5 دقائق</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#8B7355]/5 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center">
                      <UserCog className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[#2D2D2D]">انضم خبير جديد: د. محمد الأحمد</p>
                      <p className="text-sm text-[#6B7280]">منذ 15 دقيقة</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#8B7355]/5 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[#2D2D2D]">نقاش جديد: "دور التعليم في الأمن الفكري"</p>
                      <p className="text-sm text-[#6B7280]">منذ 30 دقيقة</p>
                    </div>
                  </div>
                </div>
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
                {contentList.map(content => (
                  <div key={content.id} className="content-card card-hover group">
                    <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
                      <img
                        src={content.image}
                        alt={content.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        {getStatusBadge(content.status)}
                      </div>
                      <div className="absolute top-3 left-3 flex gap-2">
                        <button className="p-2 rounded-lg bg-white/90 hover:bg-white text-[#8B7355] transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg bg-white/90 hover:bg-white text-[#8B7355] transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg bg-white/90 hover:bg-red-500 hover:text-white text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {getContentIcon(content.type)}
                        <h3 className="text-[#2D2D2D] font-bold text-lg leading-tight">{content.title}</h3>
                      </div>
                      <div className="flex items-center justify-between text-sm text-[#6B7280]">
                        <span>{content.author}</span>
                        <span>{content.category}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-[#8B7355]/10">
                        <span className="text-sm text-[#6B7280]">{content.uploadDate}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-[#8B7355]" />
                            <span>{content.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-red-500">❤️</span>
                            <span>{content.likes}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                    {experts.map(expert => (
                      <tr key={expert.id} className="border-b border-[#8B7355]/10 hover:bg-[#8B7355]/5 transition-colors">
                        <td className="p-4">
                          <div>
                            <div className="font-semibold text-[#2D2D2D]">{expert.name}</div>
                            <div className="text-sm text-[#6B7280]">{expert.email}</div>
                          </div>
                        </td>
                        <td className="p-4 text-[#6B7280]">{expert.specialization}</td>
                        <td className="p-4 text-[#2D2D2D] font-semibold">{expert.discussionsHandled}</td>
                        <td className="p-4 text-[#2D2D2D]">{expert.activityHours}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-semibold text-[#2D2D2D]">{expert.rating}</span>
                          </div>
                        </td>
                        <td className="p-4">{getStatusBadge(expert.status)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-yellow-100 text-yellow-600 transition-colors">
                              <Ban className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
                    {users.map(user => (
                      <tr key={user.id} className="border-b border-[#8B7355]/10 hover:bg-[#8B7355]/5 transition-colors">
                        <td className="p-4">
                          <div>
                            <div className="font-semibold text-[#2D2D2D]">{user.name}</div>
                            <div className="text-sm text-[#6B7280]">{user.email}</div>
                          </div>
                        </td>
                        <td className="p-4 text-[#2D2D2D] font-semibold">{user.hoursSpent}</td>
                        <td className="p-4 text-[#2D2D2D]">{user.engagementRate}%</td>
                        <td className="p-4 text-[#2D2D2D]">{user.contentEngaged}%</td>
                        <td className="p-4 text-[#2D2D2D]">{user.discussionsParticipated}</td>
                        <td className="p-4">{getStatusBadge(user.status)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-yellow-100 text-yellow-600 transition-colors">
                              <Ban className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  <div className="h-64 flex items-center justify-center text-[#6B7280]">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>الرسوم البيانية قيد التطوير</p>
                    </div>
                  </div>
                </div>

                <div className="content-card">
                  <h3 className="text-xl font-bold text-[#2D2D2D] mb-6">توزيع المحتوى</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Book className="w-5 h-5 text-[#10B981]" />
                        <span className="text-[#2D2D2D]">الكتب</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="w-3/4 h-full bg-[#10B981] rounded-full"></div>
                        </div>
                        <span className="text-sm text-[#6B7280]">156</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Video className="w-5 h-5 text-[#8B5CF6]" />
                        <span className="text-[#2D2D2D]">الفيديوهات</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="w-1/2 h-full bg-[#8B5CF6] rounded-full"></div>
                        </div>
                        <span className="text-sm text-[#6B7280]">89</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#F59E0B]" />
                        <span className="text-[#2D2D2D]">المقالات</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="w-full h-full bg-[#F59E0B] rounded-full"></div>
                        </div>
                        <span className="text-sm text-[#6B7280]">211</span>
                      </div>
                    </div>
                  </div>
                </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#2D2D2D] font-semibold mb-3">نوع المحتوى</label>
                    <select className="input-modern w-full">
                      <option value="book">كتاب</option>
                      <option value="video">فيديو</option>
                      <option value="article">مقال</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#2D2D2D] font-semibold mb-3">الفئة</label>
                    <select className="input-modern w-full">
                      <option value="security">الأمن الفكري</option>
                      <option value="education">التربية الإسلامية</option>
                      <option value="culture">الثقافة العامة</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">المؤلف</label>
                  <input
                    type="text"
                    className="input-modern w-full"
                    placeholder="اسم المؤلف أو المنشئ"
                  />
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
        userRole="admin"
      />
    </div>
  );
};

export default AdminDashboard;