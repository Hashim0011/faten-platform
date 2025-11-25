-- ملف SQL آمن لتطبيق جميع التحديثات دفعة واحدة
-- يمكن تشغيله عدة مرات بأمان (idempotent)
-- Safe SQL file to apply all updates at once
-- Can be run multiple times safely (idempotent)

-- ============================================
-- 1. جدول أكواد OTP
-- ============================================

-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Users can view their own OTP codes" ON otp_codes;
DROP POLICY IF EXISTS "Users can update their own OTP codes" ON otp_codes;
DROP POLICY IF EXISTS "Allow insert for all authenticated users" ON otp_codes;
DROP POLICY IF EXISTS "Users can delete their own OTP codes" ON otp_codes;

-- إعادة إنشاء السياسات
CREATE POLICY "Users can view their own OTP codes"
  ON otp_codes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own OTP codes"
  ON otp_codes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow insert for all authenticated users"
  ON otp_codes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own OTP codes"
  ON otp_codes
  FOR DELETE
  USING (auth.uid() = user_id);

-- تأكد من تفعيل RLS
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. جدول إعدادات المستخدم
-- ============================================

-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON user_settings;

-- إعادة إنشاء السياسات
CREATE POLICY "Users can view their own settings"
  ON user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
  ON user_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- تأكد من تفعيل RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. تحديث جدول المستخدمين
-- ============================================

-- إضافة عمود is_verified إذا لم يكن موجوداً
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);

-- ============================================
-- رسالة النجاح
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ تم تطبيق جميع التحديثات بنجاح!';
  RAISE NOTICE '✅ All updates applied successfully!';
END $$;
