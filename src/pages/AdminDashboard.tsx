import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Users, 
  BookOpen, 
  Settings, 
  LogOut, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Bell, 
  Shield, 
  UserCheck, 
  UserX, 
  Ban,
  AlertTriangle,
  Book,
  Video,
  FileText,
  Clock,
  Star,
  Heart,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Download,
  Share2,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Zap,
  Globe,
  MousePointer,
  Timer
} from 'lucide-react';

interface Content {
  id: number;
  title: string;
  type: 'book' | 'video' | 'article';
  description: string;
  author: string;
  date: string;
  likes: number;
  views: number;
  status: 'published' | 'draft' | 'pending';
  image: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'expert' | 'admin';
  status: 'active' | 'blocked' | 'pending';
  joinDate: string;
  lastActive: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('content');
  const [showAddContent, setShowAddContent] = useState(false);
  const [showContentDetails, setShowContentDetails] = useState(false);
  const [showEditContent, setShowEditContent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [contentToDelete, setContentToDelete] = useState<Content | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const [contentList, setContentList] = useState<Content[]>([
    {
      id: 1,
      title: "أسس الأمن الفكري",
      type: "book",
      description: "دليل شامل لفهم وتطبيق مبادئ الأمن الفكري",
      author: "د. محمد الشهري",
      date: "2024/03/01",
      likes: 167,
      views: 1247,
      status: "published",
      image: "https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg"
    },
    {
      id: 2,
      title: "الوسطية في الإسلام",
      type: "video",
      description: "سلسلة تعليمية عن مفهوم الوسطية",
      author: "د. أحمد السالم",
      date: "2024/03/13",
      likes: 278,
      views: 892,
      status: "published",
      image: "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg"
    },
    {
      id: 3,
      title: "التحديات المعاصرة للأمن الفكري",
      type: "article",
      description: "تحليل للتحديات التي تواجه الشباب",
      author: "د. سارة الحربي",
      date: "2024/03/10",
      likes: 203,
      views: 654,
      status: "published",
      image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg"
    }
  ]);

  const [usersList] = useState<User[]>([
    {
      id: 1,
      name: "أحمد محمد العتيبي",
      email: "ahmed@example.com",
      role: "user",
      status: "active",
      joinDate: "2024/01/15",
      lastActive: "منذ 5 دقائق"
    },
    {
      id: 2,
      name: "د. فاطمة السالم",
      email: "fatima@example.com",
      role: "expert",
      status: "active",
      joinDate: "2024/02/20",
      lastActive: "منذ ساعة"
    },
    {
      id: 3,
      name: "محمد الرشيد",
      email: "mohammed@example.com",
      role: "user",
      status: "blocked",
      joinDate: "2024/03/01",
      lastActive: "منذ يومين"
    }
  ]);

  const handleViewContent = (content: Content) => {
    setSelectedContent(content);
    setShowContentDetails(true);
  };

  const handleEditContent = (content: Content) => {
    setEditingContent({ ...content });
    setShowEditContent(true);
  };

  const handleDeleteContent = (content: Content) => {
    setContentToDelete(content);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (contentToDelete) {
      setContentList(contentList.filter(content => content.id !== contentToDelete.id));
      setShowDeleteConfirm(false);
      setContentToDelete(null);
    }
  };

  const handleSaveEdit = () => {
    if (editingContent) {
      setContentList(contentList.map(content => 
        content.id === editingContent.id ? editingContent : content
      ));
      setShowEditContent(false);
      setEditingContent(null);
    }
  };

  const handleAddContent = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newContent: Content = {
      id: contentList.length + 1,
      title: formData.get('title') as string,
      type: formData.get('type') as 'book' | 'video' | 'article',
      description: formData.get('description') as string,
      author: formData.get('author') as string,
      date: new Date().toLocaleDateString('en-CA'),
      likes: 0,
      views: 0,
      status: formData.get('status') as 'published' | 'draft' | 'pending',
      image: formData.get('image') as string || "https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg"
    };
    
    setContentList([...contentList, newContent]);
    setShowAddContent(false);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="status-badge status-new">منشور</span>;
      case 'draft':
        return <span className="status-badge status-popular">مسودة</span>;
      case 'pending':
        return <span className="status-badge status-featured">قيد المراجعة</span>;
      default:
        return <span className="status-badge">غير محدد</span>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="status-badge status-featured">مدير</span>;
      case 'expert':
        return <span className="status-badge status-popular">خبير</span>;
      case 'user':
        return <span className="status-badge status-new">مستخدم</span>;
      default:
        return <span className="status-badge">غير محدد</span>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'blocked': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const filteredContent = contentList.filter(content =>
    content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    content.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalContent: contentList.length,
    totalUsers: usersList.length,
    activeUsers: usersList.filter(u => u.status === 'active').length,
    totalViews: contentList.reduce((sum, content) => sum + content.views, 0),
    totalLikes: contentList.reduce((sum, content) => sum + content.likes, 0),
    avgRating: 4.6,
    completionRate: 78,
    engagementRate: 85,
    monthlyGrowth: 12.5,
    dailyActiveUsers: Math.floor(stats.activeUsers * 0.6),
    weeklyActiveUsers: Math.floor(stats.activeUsers * 0.8),
    bounceRate: 23,
    sessionDuration: 8.5
  };

  return (
    <div className="min-h-screen bg-pattern flex">
      {/* Sidebar */}
      <div className="w-80 glass-effect border-r border-[#8B7355]/20 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#8B7355]/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B7355] to-[#654321] flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">لوحة الإدارة</h1>
              <p className="text-sm text-[#6B7280]">إدارة شاملة للمنصة</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
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
              <span className="font-medium">إدارة المستخدمين</span>
            </button>

            <button
              onClick={() => setActiveSection('analytics')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl text-right transition-all ${
                activeSection === 'analytics'
                  ? 'bg-gradient-to-r from-[#8B7355] to-[#654321] text-white shadow-lg'
                  : 'text-[#8B7355] hover:bg-[#8B7355]/10'
              }`}
            >
              <Brain className="w-5 h-5" />
              <span className="font-medium">التحليلات</span>
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
              onClick={() => navigate('/')}
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
                {activeSection === 'content' && 'إدارة المحتوى'}
                {activeSection === 'users' && 'إدارة المستخدمين'}
                {activeSection === 'analytics' && 'التحليلات والإحصائيات'}
              </h2>
              <p className="text-[#6B7280] mt-1">
                {activeSection === 'content' && 'إضافة وتعديل وحذف المحتوى التعليمي'}
                {activeSection === 'users' && 'إدارة المستخدمين والصلاحيات'}
                {activeSection === 'analytics' && 'عرض الإحصائيات والتحليلات'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-xl hover:bg-[#8B7355]/10 transition-colors relative">
                <Bell className="w-5 h-5 text-[#8B7355]" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="content-card text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#2D2D2D] mb-1">{stats.totalContent}</h3>
              <p className="text-[#6B7280] text-sm">إجمالي المحتوى</p>
            </div>
            
            <div className="content-card text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#2D2D2D] mb-1">{stats.totalUsers}</h3>
              <p className="text-[#6B7280] text-sm">إجمالي المستخدمين</p>
            </div>
            
            <div className="content-card text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#2D2D2D] mb-1">{stats.activeUsers}</h3>
              <p className="text-[#6B7280] text-sm">المستخدمون النشطون</p>
            </div>
            
            <div className="content-card text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[#EF4444] to-[#DC2626] flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#2D2D2D] mb-1">{stats.totalViews.toLocaleString()}</h3>
              <p className="text-[#6B7280] text-sm">إجمالي المشاهدات</p>
            </div>
          </div>

          {/* Content Management Section */}
          {activeSection === 'content' && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="البحث في المحتوى..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-modern w-full has-right-icon"
                  />
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B7355] w-5 h-5 pointer-events-none" />
                </div>
                <button 
                  onClick={() => setShowFilter(!showFilter)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>تصفية</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.map(content => (
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
                        <button 
                          onClick={() => handleViewContent(content)}
                          className="p-2 rounded-lg bg-white/90 hover:bg-white text-[#8B7355] transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditContent(content)}
                          className="p-2 rounded-lg bg-white/90 hover:bg-white text-[#8B7355] transition-colors"
                          title="تعديل المحتوى"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteContent(content)}
                          className="p-2 rounded-lg bg-white/90 hover:bg-red-500 hover:text-white text-red-500 transition-colors"
                          title="حذف المحتوى"
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
                      <p className="text-[#8B7355] text-sm font-medium">بواسطة: {content.author}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-[#8B7355]/10">
                        <span className="text-sm text-[#6B7280] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {content.date}
                        </span>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-500" />
                            <span className="text-[#8B7355] font-semibold">{content.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-[#8B7355]" />
                            <span className="text-[#6B7280]">{content.views}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Management Section */}
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
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#8B7355]/20">
                      <th className="text-right p-4 font-semibold text-[#2D2D2D]">المستخدم</th>
                      <th className="text-right p-4 font-semibold text-[#2D2D2D]">الدور</th>
                      <th className="text-right p-4 font-semibold text-[#2D2D2D]">الحالة</th>
                      <th className="text-right p-4 font-semibold text-[#2D2D2D]">تاريخ الانضمام</th>
                      <th className="text-right p-4 font-semibold text-[#2D2D2D]">آخر نشاط</th>
                      <th className="text-center p-4 font-semibold text-[#2D2D2D]">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map(user => (
                      <tr key={user.id} className="border-b border-[#8B7355]/10 hover:bg-[#8B7355]/5">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#8B7355] text-white flex items-center justify-center font-semibold">
                              {user.name[0]}
                            </div>
                            <div>
                              <div className="font-semibold text-[#2D2D2D]">{user.name}</div>
                              <div className="text-sm text-[#6B7280]">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="p-4">
                          <span className={`font-medium ${getStatusColor(user.status)}`}>
                            {user.status === 'active' ? 'نشط' : user.status === 'blocked' ? 'محظور' : 'قيد المراجعة'}
                          </span>
                        </td>
                        <td className="p-4 text-[#6B7280]">{user.joinDate}</td>
                        <td className="p-4 text-[#6B7280]">{user.lastActive}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-2 rounded-lg hover:bg-[#8B7355]/10 text-[#8B7355]" title="عرض التفاصيل">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-yellow-100 text-yellow-600" title="حظر المستخدم">
                              <Ban className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-red-100 text-red-600" title="حذف المستخدم">
                              <UserX className="w-4 h-4" />
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

          {/* Analytics Section */}
          {activeSection === 'analytics' && (
            <div className="content-card">
              <div className="text-center py-12 text-[#6B7280]">
                <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>قسم التحليلات قيد التطوير</p>
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
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#2D2D2D]">إضافة محتوى جديد</h3>
                <button
                  onClick={() => setShowAddContent(false)}
                  className="p-2 rounded-xl hover:bg-[#8B7355]/10 transition-colors"
                >
                  <span className="text-[#8B7355] text-xl">×</span>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleAddContent} className="space-y-6">
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">عنوان المحتوى</label>
                  <input
                    type="text"
                    name="title"
                    className="input-modern w-full"
                    placeholder="أدخل عنوان المحتوى"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#2D2D2D] font-semibold mb-3">نوع المحتوى</label>
                    <select name="type" className="input-modern w-full" required>
                      <option value="book">كتاب</option>
                      <option value="video">فيديو</option>
                      <option value="article">مقال</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#2D2D2D] font-semibold mb-3">الحالة</label>
                    <select name="status" className="input-modern w-full" required>
                      <option value="published">منشور</option>
                      <option value="draft">مسودة</option>
                      <option value="pending">قيد المراجعة</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">المؤلف</label>
                  <input
                    type="text"
                    name="author"
                    className="input-modern w-full"
                    placeholder="اسم المؤلف"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">الوصف</label>
                  <textarea
                    name="description"
                    className="input-modern w-full h-24 resize-none"
                    placeholder="أدخل وصف المحتوى"
                    required
                  ></textarea>
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">رابط الصورة</label>
                  <input
                    type="url"
                    name="image"
                    className="input-modern w-full"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">إضافة المحتوى</button>
                  <button
                    type="button"
                    onClick={() => setShowAddContent(false)}
                    className="btn-secondary flex-1"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Content Details Modal */}
      {showContentDetails && selectedContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-[#8B7355]/20">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#2D2D2D]">تفاصيل المحتوى</h3>
                <button
                  onClick={() => setShowContentDetails(false)}
                  className="p-2 rounded-xl hover:bg-[#8B7355]/10 transition-colors"
                >
                  <span className="text-[#8B7355] text-xl">×</span>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                <div className="relative h-48 rounded-xl overflow-hidden">
                  <img
                    src={selectedContent.image}
                    alt={selectedContent.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(selectedContent.status)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">العنوان</label>
                    <p className="text-[#6B7280]">{selectedContent.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">النوع</label>
                    <div className="flex items-center gap-2">
                      {getContentIcon(selectedContent.type)}
                      <span className="text-[#6B7280]">{getContentTypeLabel(selectedContent.type)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">المؤلف</label>
                    <p className="text-[#6B7280]">{selectedContent.author}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">تاريخ النشر</label>
                    <p className="text-[#6B7280]">{selectedContent.date}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">الإعجابات</label>
                    <p className="text-[#6B7280]">{selectedContent.likes.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">المشاهدات</label>
                    <p className="text-[#6B7280]">{selectedContent.views.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">الوصف</label>
                    <p className="text-[#6B7280]">{selectedContent.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Content Modal */}
      {showEditContent && editingContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-[#8B7355]/20">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#2D2D2D]">تعديل المحتوى</h3>
                <button
                  onClick={() => setShowEditContent(false)}
                  className="p-2 rounded-xl hover:bg-[#8B7355]/10 transition-colors"
                >
                  <span className="text-[#8B7355] text-xl">×</span>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">عنوان المحتوى</label>
                  <input
                    type="text"
                    value={editingContent.title}
                    onChange={(e) => setEditingContent({...editingContent, title: e.target.value})}
                    className="input-modern w-full"
                    placeholder="أدخل عنوان المحتوى"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#2D2D2D] font-semibold mb-3">نوع المحتوى</label>
                    <select 
                      value={editingContent.type}
                      onChange={(e) => setEditingContent({...editingContent, type: e.target.value as 'book' | 'video' | 'article'})}
                      className="input-modern w-full"
                    >
                      <option value="book">كتاب</option>
                      <option value="video">فيديو</option>
                      <option value="article">مقال</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#2D2D2D] font-semibold mb-3">الحالة</label>
                    <select 
                      value={editingContent.status}
                      onChange={(e) => setEditingContent({...editingContent, status: e.target.value as 'published' | 'draft' | 'pending'})}
                      className="input-modern w-full"
                    >
                      <option value="published">منشور</option>
                      <option value="draft">مسودة</option>
                      <option value="pending">قيد المراجعة</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">المؤلف</label>
                  <input
                    type="text"
                    value={editingContent.author}
                    onChange={(e) => setEditingContent({...editingContent, author: e.target.value})}
                    className="input-modern w-full"
                    placeholder="اسم المؤلف"
                  />
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">الوصف</label>
                  <textarea
                    value={editingContent.description}
                    onChange={(e) => setEditingContent({...editingContent, description: e.target.value})}
                    className="input-modern w-full h-24 resize-none"
                    placeholder="أدخل وصف المحتوى"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-[#2D2D2D] font-semibold mb-3">رابط الصورة</label>
                  <input
                    type="url"
                    value={editingContent.image}
                    onChange={(e) => setEditingContent({...editingContent, image: e.target.value})}
                    className="input-modern w-full"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#8B7355]/20 flex gap-3">
              <button 
                onClick={handleSaveEdit}
                className="btn-primary flex-1"
              >
                حفظ التغييرات
              </button>
              <button
                onClick={() => setShowEditContent(false)}
                className="btn-secondary flex-1"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && contentToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-[#2D2D2D] mb-2">تأكيد الحذف</h3>
              <p className="text-[#6B7280] mb-6">
                هل أنت متأكد من حذف المحتوى "{contentToDelete.title}"؟
                <br />
                <span className="text-red-600 font-semibold">لا يمكن التراجع عن هذا الإجراء.</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  نعم، احذف
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary flex-1"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;