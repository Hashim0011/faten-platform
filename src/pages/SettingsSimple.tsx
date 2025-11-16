import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  ArrowRight,
  Mail,
  Phone,
  LogOut,
  Check,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';

const SettingsSimple = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // إعدادات محلية بسيطة
  const [notifications, setNotifications] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser();

      if (error || !authUser) {
        showError('يرجى تسجيل الدخول أولاً');
        navigate('/login');
        return;
      }

      // Get user from database
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      setUser(userData || {
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || 'مستخدم',
        phone: authUser.user_metadata?.phone || '',
        role: 'user',
      });

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = window.confirm('هل أنت متأكد من تسجيل الخروج؟');
    if (!confirmed) return;

    try {
      await supabase.auth.signOut();
      showInfo('تم تسجيل الخروج بنجاح');
      navigate('/');
    } catch (error) {
      showError('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#8B7355] mx-auto mb-4"></div>
          <p className="text-[#6B7280]">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-pattern" dir="rtl">
      {/* Header */}
      <div className="glass-effect border-b border-[#8B7355]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-[#8B7355]/10 rounded-lg transition-colors"
              >
                <ArrowRight className="w-6 h-6 text-[#8B7355]" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B7355] to-[#654321] flex items-center justify-center">
                  <SettingsIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">الإعدادات</h1>
                  <p className="text-[#6B7280] text-sm">إدارة حسابك وتفضيلاتك</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Account Info */}
          <div className="glass-effect p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-[#8B7355]" />
              <h2 className="text-xl font-bold text-[#2D2D2D]">معلومات الحساب</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-[#8B7355]/5 rounded-xl">
                <User className="w-5 h-5 text-[#8B7355]" />
                <div className="flex-1">
                  <p className="text-sm text-[#6B7280]">الاسم الكامل</p>
                  <p className="font-medium text-[#2D2D2D]">{user.full_name || 'غير محدد'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-[#8B7355]/5 rounded-xl">
                <Mail className="w-5 h-5 text-[#8B7355]" />
                <div className="flex-1">
                  <p className="text-sm text-[#6B7280]">البريد الإلكتروني</p>
                  <p className="font-medium text-[#2D2D2D]">{user.email}</p>
                </div>
              </div>

              {user.phone && (
                <div className="flex items-center gap-3 p-4 bg-[#8B7355]/5 rounded-xl">
                  <Phone className="w-5 h-5 text-[#8B7355]" />
                  <div className="flex-1">
                    <p className="text-sm text-[#6B7280]">رقم الجوال</p>
                    <p className="font-medium text-[#2D2D2D]">{user.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#8B7355]/10 to-[#D4AF37]/10 rounded-xl border border-[#8B7355]/20">
                <Shield className="w-5 h-5 text-[#8B7355]" />
                <div className="flex-1">
                  <p className="text-sm text-[#6B7280]">نوع الحساب</p>
                  <p className="font-medium text-[#8B7355]">
                    {user.role === 'admin' ? 'مدير' : user.role === 'expert' ? 'خبير' : 'مستخدم'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="glass-effect p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-[#8B7355]" />
              <h2 className="text-xl font-bold text-[#2D2D2D]">الإشعارات</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#8B7355]/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-[#8B7355]" />
                  <div>
                    <p className="font-medium text-[#2D2D2D]">جميع الإشعارات</p>
                    <p className="text-sm text-[#6B7280]">تفعيل أو تعطيل جميع الإشعارات</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setNotifications(!notifications);
                    showSuccess(notifications ? 'تم تعطيل الإشعارات' : 'تم تفعيل الإشعارات');
                  }}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    notifications ? 'bg-[#8B7355]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications ? 'right-1' : 'right-8'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#8B7355]/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#8B7355]" />
                  <div>
                    <p className="font-medium text-[#2D2D2D]">إشعارات البريد الإلكتروني</p>
                    <p className="text-sm text-[#6B7280]">تلقي الإشعارات عبر البريد</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEmailNotif(!emailNotif);
                    showSuccess(emailNotif ? 'تم تعطيل إشعارات البريد' : 'تم تفعيل إشعارات البريد');
                  }}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    emailNotif ? 'bg-[#8B7355]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      emailNotif ? 'right-1' : 'right-8'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="glass-effect p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-5 h-5 text-[#8B7355]" />
              <h2 className="text-xl font-bold text-[#2D2D2D]">المظهر</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setTheme('light');
                  showSuccess('تم تفعيل الوضع الفاتح');
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  theme === 'light'
                    ? 'border-[#8B7355] bg-[#8B7355]/10'
                    : 'border-gray-200 hover:border-[#8B7355]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">فاتح</span>
                  {theme === 'light' && <Check className="w-5 h-5 text-[#8B7355]" />}
                </div>
                <div className="w-full h-12 bg-white border border-gray-200 rounded"></div>
              </button>

              <button
                onClick={() => {
                  setTheme('dark');
                  showInfo('الوضع الداكن قريباً!');
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-[#8B7355] bg-[#8B7355]/10'
                    : 'border-gray-200 hover:border-[#8B7355]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">داكن</span>
                  {theme === 'dark' && <Check className="w-5 h-5 text-[#8B7355]" />}
                </div>
                <div className="w-full h-12 bg-gray-800 border border-gray-700 rounded"></div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsSimple;
