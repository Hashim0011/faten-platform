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
      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser();

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

      setUser(
        userData || {
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || 'مستخدم',
          phone: authUser.user_metadata?.phone || '',
          role: 'user',
        }
      );

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
      <div className="bg-pattern flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-[#8B7355]"></div>
          <p className="text-[#6B7280]">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-pattern min-h-screen" dir="rtl">
      {/* Header */}
      <div className="glass-effect border-b border-[#8B7355]/10">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="rounded-lg p-2 transition-colors hover:bg-[#8B7355]/10"
              >
                <ArrowRight className="h-6 w-6 text-[#8B7355]" />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B7355] to-[#654321]">
                  <SettingsIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="gradient-text text-2xl font-bold">الإعدادات</h1>
                  <p className="text-sm text-[#6B7280]">إدارة حسابك وتفضيلاتك</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Account Info */}
          <div className="glass-effect rounded-2xl p-6">
            <div className="mb-6 flex items-center gap-3">
              <User className="h-5 w-5 text-[#8B7355]" />
              <h2 className="text-xl font-bold text-[#2D2D2D]">معلومات الحساب</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-[#8B7355]/5 p-4">
                <User className="h-5 w-5 text-[#8B7355]" />
                <div className="flex-1">
                  <p className="text-sm text-[#6B7280]">الاسم الكامل</p>
                  <p className="font-medium text-[#2D2D2D]">{user.full_name || 'غير محدد'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-[#8B7355]/5 p-4">
                <Mail className="h-5 w-5 text-[#8B7355]" />
                <div className="flex-1">
                  <p className="text-sm text-[#6B7280]">البريد الإلكتروني</p>
                  <p className="font-medium text-[#2D2D2D]">{user.email}</p>
                </div>
              </div>

              {user.phone && (
                <div className="flex items-center gap-3 rounded-xl bg-[#8B7355]/5 p-4">
                  <Phone className="h-5 w-5 text-[#8B7355]" />
                  <div className="flex-1">
                    <p className="text-sm text-[#6B7280]">رقم الجوال</p>
                    <p className="font-medium text-[#2D2D2D]">{user.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 rounded-xl border border-[#8B7355]/20 bg-gradient-to-r from-[#8B7355]/10 to-[#D4AF37]/10 p-4">
                <Shield className="h-5 w-5 text-[#8B7355]" />
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
          <div className="glass-effect rounded-2xl p-6">
            <div className="mb-6 flex items-center gap-3">
              <Bell className="h-5 w-5 text-[#8B7355]" />
              <h2 className="text-xl font-bold text-[#2D2D2D]">الإشعارات</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-[#8B7355]/5 p-4">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-[#8B7355]" />
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
                  className={`relative h-7 w-14 rounded-full transition-colors ${
                    notifications ? 'bg-[#8B7355]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                      notifications ? 'right-1' : 'right-8'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#8B7355]/5 p-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-[#8B7355]" />
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
                  className={`relative h-7 w-14 rounded-full transition-colors ${
                    emailNotif ? 'bg-[#8B7355]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                      emailNotif ? 'right-1' : 'right-8'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="glass-effect rounded-2xl p-6">
            <div className="mb-6 flex items-center gap-3">
              <Palette className="h-5 w-5 text-[#8B7355]" />
              <h2 className="text-xl font-bold text-[#2D2D2D]">المظهر</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setTheme('light');
                  showSuccess('تم تفعيل الوضع الفاتح');
                }}
                className={`rounded-xl border-2 p-4 transition-all ${
                  theme === 'light'
                    ? 'border-[#8B7355] bg-[#8B7355]/10'
                    : 'border-gray-200 hover:border-[#8B7355]/50'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">فاتح</span>
                  {theme === 'light' && <Check className="h-5 w-5 text-[#8B7355]" />}
                </div>
                <div className="h-12 w-full rounded border border-gray-200 bg-white"></div>
              </button>

              <button
                onClick={() => {
                  setTheme('dark');
                  showInfo('الوضع الداكن قريباً!');
                }}
                className={`rounded-xl border-2 p-4 transition-all ${
                  theme === 'dark'
                    ? 'border-[#8B7355] bg-[#8B7355]/10'
                    : 'border-gray-200 hover:border-[#8B7355]/50'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">داكن</span>
                  {theme === 'dark' && <Check className="h-5 w-5 text-[#8B7355]" />}
                </div>
                <div className="h-12 w-full rounded border border-gray-700 bg-gray-800"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSimple;
