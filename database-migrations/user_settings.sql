-- إنشاء جدول إعدادات المستخدم
-- User Settings Table for Faten Platform

-- حذف الجدول إذا كان موجوداً (فقط للتطوير)
-- DROP TABLE IF EXISTS user_settings;

CREATE TABLE IF NOT EXISTS user_settings (
  -- معرف فريد للإعدادات
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- معرف المستخدم (مرتبط بجدول users)
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- إعدادات اللغة والمظهر
  language VARCHAR(2) DEFAULT 'ar' CHECK (language IN ('ar', 'en')),
  theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  font_size VARCHAR(10) DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),

  -- إعدادات الإشعارات
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  new_content_notifications BOOLEAN DEFAULT true,
  discussion_notifications BOOLEAN DEFAULT true,
  expert_notifications BOOLEAN DEFAULT true,
  event_notifications BOOLEAN DEFAULT true,

  -- إعدادات الخصوصية
  privacy_profile_visible BOOLEAN DEFAULT true,
  privacy_show_email BOOLEAN DEFAULT false,
  privacy_show_phone BOOLEAN DEFAULT false,

  -- إعدادات الأداء
  auto_play_videos BOOLEAN DEFAULT true,
  data_saver_mode BOOLEAN DEFAULT false,

  -- تواريخ الإنشاء والتحديث
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- فهرس فريد للمستخدم (كل مستخدم له صف واحد فقط)
  CONSTRAINT unique_user_settings UNIQUE (user_id)
);

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- إنشاء دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger لتحديث updated_at عند أي تعديل
DROP TRIGGER IF EXISTS trigger_update_user_settings_updated_at ON user_settings;
CREATE TRIGGER trigger_update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- تعليقات على الجدول والأعمدة
COMMENT ON TABLE user_settings IS 'جدول إعدادات المستخدمين لمنصة فطن';
COMMENT ON COLUMN user_settings.user_id IS 'معرف المستخدم المرتبط بالإعدادات';
COMMENT ON COLUMN user_settings.language IS 'لغة الواجهة: ar (العربية) أو en (الإنجليزية)';
COMMENT ON COLUMN user_settings.theme IS 'السمة: light (فاتح)، dark (داكن)، أو auto (تلقائي)';
COMMENT ON COLUMN user_settings.font_size IS 'حجم الخط: small (صغير)، medium (متوسط)، أو large (كبير)';
COMMENT ON COLUMN user_settings.notifications_enabled IS 'تفعيل جميع الإشعارات';
COMMENT ON COLUMN user_settings.email_notifications IS 'إشعارات البريد الإلكتروني';
COMMENT ON COLUMN user_settings.push_notifications IS 'الإشعارات الفورية';
COMMENT ON COLUMN user_settings.new_content_notifications IS 'إشعارات المحتوى الجديد';
COMMENT ON COLUMN user_settings.discussion_notifications IS 'إشعارات المناقشات';
COMMENT ON COLUMN user_settings.expert_notifications IS 'إشعارات الخبراء الجدد';
COMMENT ON COLUMN user_settings.event_notifications IS 'إشعارات الفعاليات';
COMMENT ON COLUMN user_settings.privacy_profile_visible IS 'إظهار الملف الشخصي للآخرين';
COMMENT ON COLUMN user_settings.privacy_show_email IS 'إظهار البريد الإلكتروني في الملف الشخصي';
COMMENT ON COLUMN user_settings.privacy_show_phone IS 'إظهار رقم الجوال في الملف الشخصي';
COMMENT ON COLUMN user_settings.auto_play_videos IS 'تشغيل الفيديو تلقائياً';
COMMENT ON COLUMN user_settings.data_saver_mode IS 'وضع توفير البيانات';

-- إضافة Row Level Security (RLS) للأمان
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- السماح للمستخدمين بقراءة إعداداتهم فقط
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
CREATE POLICY "Users can view their own settings"
  ON user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- السماح للمستخدمين بتحديث إعداداتهم فقط
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
CREATE POLICY "Users can update their own settings"
  ON user_settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- السماح للمستخدمين بإنشاء إعداداتهم
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
CREATE POLICY "Users can insert their own settings"
  ON user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- السماح للمستخدمين بحذف إعداداتهم
DROP POLICY IF EXISTS "Users can delete their own settings" ON user_settings;
CREATE POLICY "Users can delete their own settings"
  ON user_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- إنشاء دالة لإنشاء إعدادات افتراضية لمستخدم جديد
CREATE OR REPLACE FUNCTION create_default_user_settings(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء trigger لإنشاء إعدادات افتراضية عند إنشاء مستخدم جديد
-- (يجب تطبيق هذا على جدول users إذا كان موجوداً)
CREATE OR REPLACE FUNCTION auto_create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تطبيق الـ trigger على جدول users (إذا كان موجوداً)
-- DROP TRIGGER IF EXISTS trigger_auto_create_user_settings ON users;
-- CREATE TRIGGER trigger_auto_create_user_settings
--   AFTER INSERT ON users
--   FOR EACH ROW
--   EXECUTE FUNCTION auto_create_user_settings();

-- ملاحظات للمطور:
-- 1. تأكد من أن جدول users موجود قبل تطبيق هذا الـ migration
-- 2. قم بإلغاء تعليق الـ trigger في النهاية لإنشاء الإعدادات تلقائياً
-- 3. استخدم الدالة create_default_user_settings() لإنشاء إعدادات للمستخدمين الحاليين
-- 4. مثال: SELECT create_default_user_settings('user-uuid-here');

-- إنشاء إعدادات افتراضية لجميع المستخدمين الحاليين (اختياري)
-- INSERT INTO user_settings (user_id)
-- SELECT id FROM users
-- ON CONFLICT (user_id) DO NOTHING;
