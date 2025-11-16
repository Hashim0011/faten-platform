-- إضافة حقل التوثيق لجدول المستخدمين
-- Add verified column to users table

-- إضافة عمود is_verified
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);

-- تعليق على العمود
COMMENT ON COLUMN users.is_verified IS 'هل تم التحقق من البريد الإلكتروني عبر OTP';

-- تحديث المستخدمين الحاليين (اعتبارهم موثقين)
UPDATE users
SET is_verified = true
WHERE is_verified IS NULL OR is_verified = false;

-- دالة لإتمام التسجيل بعد التحقق من OTP
CREATE OR REPLACE FUNCTION complete_user_registration(
  p_user_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT
) AS $$
BEGIN
  -- تحديث حالة التوثيق
  UPDATE users
  SET is_verified = true,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = p_user_id;

  -- التحقق من نجاح العملية
  IF FOUND THEN
    RETURN QUERY SELECT true, 'تم التوثيق بنجاح'::TEXT;
  ELSE
    RETURN QUERY SELECT false, 'المستخدم غير موجود'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تعديل سياسة RLS للسماح بالقراءة للمستخدمين الموثقين فقط (اختياري)
-- يمكن إلغاء التعليق لتفعيل هذه السياسة
/*
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Verified users can view their own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id AND is_verified = true);
*/

-- ملاحظة: هذا الـ migration آمن للتطبيق على قاعدة بيانات موجودة
-- سيتم إضافة العمود دون حذف أي بيانات
