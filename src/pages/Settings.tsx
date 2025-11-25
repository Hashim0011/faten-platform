import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Zap,
  ChevronRight,
  ArrowRight,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Globe,
  Sun,
  Moon,
  Type,
  Video,
  Wifi,
  Save,
  RotateCcw,
  LogOut,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import {
  getUserSettings,
  updateUserSettings,
  resetToDefaultSettings,
  UserSettings,
  defaultSettings,
} from '../lib/settings';
import { getCurrentUser, logout } from '../lib/auth';

const Settings = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useToast();

  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'account' | 'notifications' | 'privacy' | 'appearance' | 'performance'
  >('account');

  // Load user data and settings
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Get current user from Supabase Auth
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        console.error('Auth error:', authError);
        showError('يرجى تسجيل الدخول أولاً');
        navigate('/login');
        return;
      }

      // Get user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (userError) {
        console.error('User data error:', userError);
        // إذا لم يكن المستخدم في جدول users، نستخدم بيانات Auth
        setUser({
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || 'مستخدم',
          phone: authUser.user_metadata?.phone || '',
          role: 'user',
        });
      } else {
        setUser(userData);
      }

      // Try to get user settings (optional - won't fail if table doesn't exist)
      try {
        const userSettings = await getUserSettings(authUser.id);
        setSettings(userSettings);

        // Apply theme from settings
        if (userSettings?.theme) {
          const root = document.documentElement;
          const currentTheme = userSettings.theme === 'auto'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : userSettings.theme;

          if (currentTheme === 'dark') {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
          localStorage.setItem('theme', currentTheme);
        }
      } catch (settingsError) {
        console.warn('Settings not available:', settingsError);
        // استخدام إعدادات افتراضية
        setSettings({
          user_id: authUser.id,
          ...defaultSettings,
        } as UserSettings);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      showError('حدث خطأ أثناء تحميل البيانات');
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (updates: Partial<UserSettings>) => {
    if (!user || !settings) return;

    try {
      setSaving(true);

      // If theme is being updated, apply it immediately to DOM
      if (updates.theme) {
        const root = document.documentElement;
        const newTheme = updates.theme === 'auto'
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : updates.theme;

        if (newTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
        localStorage.setItem('theme', newTheme);
      }

      // Try to update settings in database
      const updatedSettings = await updateUserSettings(user.id, updates);

      if (updatedSettings) {
        setSettings(updatedSettings);
        showSuccess('تم حفظ الإعدادات بنجاح');
      } else {
        // If database update fails, update locally only
        setSettings({ ...settings, ...updates });
        showInfo('تم حفظ الإعدادات محلياً (قاعدة البيانات غير متاحة)');
      }

      setSaving(false);
    } catch (error) {
      console.error('Error updating settings:', error);
      // Update locally even if database fails
      setSettings({ ...settings, ...updates });
      showInfo('تم حفظ الإعدادات محلياً');
      setSaving(false);
    }
  };

  const handleResetSettings = async () => {
    if (!user) return;

    const confirmed = window.confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات إلى الوضع الافتراضي؟');
    if (!confirmed) return;

    try {
      setSaving(true);

      const resetSettings = await resetToDefaultSettings(user.id);

      if (resetSettings) {
        setSettings(resetSettings);
        showSuccess('تم إعادة تعيين الإعدادات إلى الوضع الافتراضي');
      } else {
        showError('فشل إعادة تعيين الإعدادات');
      }

      setSaving(false);
    } catch (error) {
      console.error('Error resetting settings:', error);
      showError('حدث خطأ أثناء إعادة تعيين الإعدادات');
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = window.confirm('هل أنت متأكد من تسجيل الخروج؟');
    if (!confirmed) return;

    try {
      await logout();
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

  if (!user || !settings) {
    return null;
  }

  const tabs = [
    { id: 'account', label: 'الحساب', icon: User },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'privacy', label: 'الخصوصية', icon: Shield },
    { id: 'appearance', label: 'المظهر', icon: Palette },
    { id: 'performance', label: 'الأداء', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-pattern" dir="rtl">
      {/* Header */}
      <div className="glass-effect border-b border-[#8B7355]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-effect rounded-2xl p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-[#8B7355] to-[#654321] text-white shadow-lg'
                        : 'hover:bg-[#8B7355]/5 text-[#2D2D2D]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="glass-effect rounded-2xl p-6 sm:p-8">
              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#2D2D2D] mb-4">معلومات الحساب</h2>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-[#8B7355]/5 rounded-xl">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8B7355] to-[#654321] flex items-center justify-center text-white text-2xl font-bold">
                          {user.full_name?.charAt(0) || 'M'}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[#2D2D2D]">{user.full_name}</h3>
                          <p className="text-sm text-[#6B7280]">{user.email}</p>
                          <div className="inline-flex items-center px-3 py-1 mt-2 rounded-full text-xs font-medium bg-gradient-to-r from-[#10B981] to-[#059669] text-white">
                            {user.role === 'admin' ? 'مدير' : user.role === 'expert' ? 'خبير' : 'مستخدم'}
                          </div>
                        </div>
                      </div>

                      {user.phone && (
                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#8B7355]/10">
                          <Phone className="w-5 h-5 text-[#8B7355]" />
                          <div>
                            <p className="text-xs text-[#6B7280]">رقم الجوال</p>
                            <p className="font-medium text-[#2D2D2D]">{user.phone}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#8B7355]/10">
                        <Mail className="w-5 h-5 text-[#8B7355]" />
                        <div>
                          <p className="text-xs text-[#6B7280]">البريد الإلكتروني</p>
                          <p className="font-medium text-[#2D2D2D]">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#2D2D2D] mb-2">إعدادات الإشعارات</h2>
                    <p className="text-sm text-[#6B7280] mb-6">اختر الإشعارات التي تريد تلقيها</p>

                    <div className="space-y-4">
                      <ToggleItem
                        label="تفعيل جميع الإشعارات"
                        description="استقبال جميع أنواع الإشعارات"
                        checked={settings.notifications_enabled}
                        onChange={(checked) => handleUpdateSettings({ notifications_enabled: checked })}
                      />

                      <div className="section-divider"></div>

                      <ToggleItem
                        label="إشعارات البريد الإلكتروني"
                        description="استقبال الإشعارات عبر البريد الإلكتروني"
                        checked={settings.email_notifications}
                        onChange={(checked) => handleUpdateSettings({ email_notifications: checked })}
                        disabled={!settings.notifications_enabled}
                      />

                      <ToggleItem
                        label="الإشعارات الفورية"
                        description="استقبال الإشعارات الفورية في المتصفح"
                        checked={settings.push_notifications}
                        onChange={(checked) => handleUpdateSettings({ push_notifications: checked })}
                        disabled={!settings.notifications_enabled}
                      />

                      <div className="section-divider"></div>

                      <ToggleItem
                        label="محتوى جديد"
                        description="إشعار عند إضافة محتوى جديد"
                        checked={settings.new_content_notifications}
                        onChange={(checked) => handleUpdateSettings({ new_content_notifications: checked })}
                        disabled={!settings.notifications_enabled}
                      />

                      <ToggleItem
                        label="المناقشات"
                        description="إشعار عند وجود ردود على مناقشاتك"
                        checked={settings.discussion_notifications}
                        onChange={(checked) => handleUpdateSettings({ discussion_notifications: checked })}
                        disabled={!settings.notifications_enabled}
                      />

                      <ToggleItem
                        label="الخبراء"
                        description="إشعار عند انضمام خبراء جدد"
                        checked={settings.expert_notifications}
                        onChange={(checked) => handleUpdateSettings({ expert_notifications: checked })}
                        disabled={!settings.notifications_enabled}
                      />

                      <ToggleItem
                        label="الفعاليات"
                        description="إشعار عند إضافة فعاليات جديدة"
                        checked={settings.event_notifications}
                        onChange={(checked) => handleUpdateSettings({ event_notifications: checked })}
                        disabled={!settings.notifications_enabled}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#2D2D2D] mb-2">إعدادات الخصوصية</h2>
                    <p className="text-sm text-[#6B7280] mb-6">تحكم في خصوصية حسابك ومعلوماتك</p>

                    <div className="space-y-4">
                      <ToggleItem
                        label="إظهار الملف الشخصي"
                        description="السماح للآخرين برؤية ملفك الشخصي"
                        checked={settings.privacy_profile_visible}
                        onChange={(checked) => handleUpdateSettings({ privacy_profile_visible: checked })}
                      />

                      <ToggleItem
                        label="إظهار البريد الإلكتروني"
                        description="عرض بريدك الإلكتروني في ملفك الشخصي"
                        checked={settings.privacy_show_email}
                        onChange={(checked) => handleUpdateSettings({ privacy_show_email: checked })}
                      />

                      <ToggleItem
                        label="إظهار رقم الجوال"
                        description="عرض رقم جوالك في ملفك الشخصي"
                        checked={settings.privacy_show_phone}
                        onChange={(checked) => handleUpdateSettings({ privacy_show_phone: checked })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#2D2D2D] mb-2">إعدادات المظهر</h2>
                    <p className="text-sm text-[#6B7280] mb-6">خصص تجربتك البصرية</p>

                    <div className="space-y-6">
                      {/* Language */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-[#2D2D2D] mb-3">
                          <Globe className="w-5 h-5 text-[#8B7355]" />
                          اللغة
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleUpdateSettings({ language: 'ar' })}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              settings.language === 'ar'
                                ? 'border-[#8B7355] bg-[#8B7355]/5'
                                : 'border-[#8B7355]/20 hover:border-[#8B7355]/40'
                            }`}
                          >
                            <span className="font-medium">العربية</span>
                          </button>
                          <button
                            onClick={() => handleUpdateSettings({ language: 'en' })}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              settings.language === 'en'
                                ? 'border-[#8B7355] bg-[#8B7355]/5'
                                : 'border-[#8B7355]/20 hover:border-[#8B7355]/40'
                            }`}
                          >
                            <span className="font-medium">English</span>
                          </button>
                        </div>
                      </div>

                      {/* Theme */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-[#2D2D2D] mb-3">
                          <Sun className="w-5 h-5 text-[#8B7355]" />
                          السمة
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            onClick={() => handleUpdateSettings({ theme: 'light' })}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              settings.theme === 'light'
                                ? 'border-[#8B7355] bg-[#8B7355]/5'
                                : 'border-[#8B7355]/20 hover:border-[#8B7355]/40'
                            }`}
                          >
                            <Sun className="w-6 h-6 mx-auto mb-2 text-[#8B7355]" />
                            <span className="text-sm font-medium">فاتح</span>
                          </button>
                          <button
                            onClick={() => handleUpdateSettings({ theme: 'dark' })}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              settings.theme === 'dark'
                                ? 'border-[#8B7355] bg-[#8B7355]/5'
                                : 'border-[#8B7355]/20 hover:border-[#8B7355]/40'
                            }`}
                          >
                            <Moon className="w-6 h-6 mx-auto mb-2 text-[#8B7355]" />
                            <span className="text-sm font-medium">داكن</span>
                          </button>
                          <button
                            onClick={() => handleUpdateSettings({ theme: 'auto' })}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              settings.theme === 'auto'
                                ? 'border-[#8B7355] bg-[#8B7355]/5'
                                : 'border-[#8B7355]/20 hover:border-[#8B7355]/40'
                            }`}
                          >
                            <Palette className="w-6 h-6 mx-auto mb-2 text-[#8B7355]" />
                            <span className="text-sm font-medium">تلقائي</span>
                          </button>
                        </div>
                      </div>

                      {/* Font Size */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-[#2D2D2D] mb-3">
                          <Type className="w-5 h-5 text-[#8B7355]" />
                          حجم الخط
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            onClick={() => handleUpdateSettings({ font_size: 'small' })}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              settings.font_size === 'small'
                                ? 'border-[#8B7355] bg-[#8B7355]/5'
                                : 'border-[#8B7355]/20 hover:border-[#8B7355]/40'
                            }`}
                          >
                            <span className="text-sm font-medium">صغير</span>
                          </button>
                          <button
                            onClick={() => handleUpdateSettings({ font_size: 'medium' })}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              settings.font_size === 'medium'
                                ? 'border-[#8B7355] bg-[#8B7355]/5'
                                : 'border-[#8B7355]/20 hover:border-[#8B7355]/40'
                            }`}
                          >
                            <span className="text-base font-medium">متوسط</span>
                          </button>
                          <button
                            onClick={() => handleUpdateSettings({ font_size: 'large' })}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              settings.font_size === 'large'
                                ? 'border-[#8B7355] bg-[#8B7355]/5'
                                : 'border-[#8B7355]/20 hover:border-[#8B7355]/40'
                            }`}
                          >
                            <span className="text-lg font-medium">كبير</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Tab */}
              {activeTab === 'performance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#2D2D2D] mb-2">إعدادات الأداء</h2>
                    <p className="text-sm text-[#6B7280] mb-6">تحسين استهلاك البيانات والأداء</p>

                    <div className="space-y-4">
                      <ToggleItem
                        label="تشغيل الفيديو تلقائياً"
                        description="تشغيل مقاطع الفيديو تلقائياً عند التحميل"
                        checked={settings.auto_play_videos}
                        onChange={(checked) => handleUpdateSettings({ auto_play_videos: checked })}
                        icon={Video}
                      />

                      <ToggleItem
                        label="وضع توفير البيانات"
                        description="تقليل استهلاك البيانات وتحسين السرعة"
                        checked={settings.data_saver_mode}
                        onChange={(checked) => handleUpdateSettings({ data_saver_mode: checked })}
                        icon={Wifi}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="section-divider"></div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleResetSettings}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#8B7355]/20 text-[#8B7355] rounded-xl hover:bg-[#8B7355]/5 transition-all disabled:opacity-50"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>إعادة تعيين الإعدادات</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toggle Item Component
interface ToggleItemProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  icon?: React.ElementType;
}

const ToggleItem: React.FC<ToggleItemProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  icon: Icon,
}) => {
  return (
    <div
      className={`flex items-center justify-between p-4 bg-white rounded-xl border border-[#8B7355]/10 transition-all ${
        disabled ? 'opacity-50' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-3 flex-1">
        {Icon && <Icon className="w-5 h-5 text-[#8B7355] mt-0.5" />}
        <div className="flex-1">
          <h3 className="font-medium text-[#2D2D2D]">{label}</h3>
          <p className="text-sm text-[#6B7280] mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative w-12 h-6 rounded-full transition-all ${
          checked ? 'bg-gradient-to-r from-[#10B981] to-[#059669]' : 'bg-gray-300'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-1' : 'translate-x-7'
          }`}
        ></div>
      </button>
    </div>
  );
};

export default Settings;
