-- جدول أكواد OTP للتحقق من الهوية
-- OTP Codes Table for Two-Factor Authentication

-- حذف الجدول إذا كان موجوداً (للتطوير فقط)
-- DROP TABLE IF EXISTS otp_codes;

CREATE TABLE IF NOT EXISTS otp_codes (
  -- معرف فريد
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- معرف المستخدم
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- البريد الإلكتروني
  email VARCHAR(255) NOT NULL,

  -- رمز OTP (6 أرقام)
  otp_code VARCHAR(6) NOT NULL,

  -- حالة الرمز
  is_used BOOLEAN DEFAULT false,

  -- وقت الانتهاء (10 دقائق من وقت الإنشاء)
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- تاريخ الإنشاء
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- تاريخ الاستخدام
  used_at TIMESTAMP WITH TIME ZONE
);

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_otp_codes_user_id ON otp_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_otp_code ON otp_codes(otp_code);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);

-- تعليقات على الجدول
COMMENT ON TABLE otp_codes IS 'جدول أكواد OTP للتحقق من الهوية';
COMMENT ON COLUMN otp_codes.user_id IS 'معرف المستخدم';
COMMENT ON COLUMN otp_codes.email IS 'البريد الإلكتروني للمستخدم';
COMMENT ON COLUMN otp_codes.otp_code IS 'رمز OTP المكون من 6 أرقام';
COMMENT ON COLUMN otp_codes.is_used IS 'هل تم استخدام الرمز؟';
COMMENT ON COLUMN otp_codes.expires_at IS 'وقت انتهاء صلاحية الرمز';
COMMENT ON COLUMN otp_codes.used_at IS 'وقت استخدام الرمز';

-- Row Level Security
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- السماح للمستخدمين بقراءة أكوادهم فقط
DROP POLICY IF EXISTS "Users can view their own OTP codes" ON otp_codes;
CREATE POLICY "Users can view their own OTP codes"
  ON otp_codes
  FOR SELECT
  USING (auth.uid() = user_id);

-- السماح للمستخدمين بتحديث أكوادهم فقط
DROP POLICY IF EXISTS "Users can update their own OTP codes" ON otp_codes;
CREATE POLICY "Users can update their own OTP codes"
  ON otp_codes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- السماح للنظام بإنشاء أكواد OTP (بدون تحقق من المستخدم)
-- هذا ضروري لأن المستخدم قد لا يكون مسجل دخول بعد
DROP POLICY IF EXISTS "Allow insert for all authenticated users" ON otp_codes;
CREATE POLICY "Allow insert for all authenticated users"
  ON otp_codes
  FOR INSERT
  WITH CHECK (true);

-- السماح بحذف الأكواد القديمة
DROP POLICY IF EXISTS "Users can delete their own OTP codes" ON otp_codes;
CREATE POLICY "Users can delete their own OTP codes"
  ON otp_codes
  FOR DELETE
  USING (auth.uid() = user_id);

-- دالة لحذف الأكواد المنتهية تلقائياً
CREATE OR REPLACE FUNCTION delete_expired_otp_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_codes
  WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة للتحقق من OTP
CREATE OR REPLACE FUNCTION verify_otp(
  p_email VARCHAR,
  p_otp_code VARCHAR
)
RETURNS TABLE(
  is_valid BOOLEAN,
  user_id UUID,
  message TEXT
) AS $$
DECLARE
  v_otp_record RECORD;
BEGIN
  -- البحث عن الرمز
  SELECT * INTO v_otp_record
  FROM otp_codes
  WHERE email = p_email
    AND otp_code = p_otp_code
    AND is_used = false
    AND expires_at > CURRENT_TIMESTAMP
  ORDER BY created_at DESC
  LIMIT 1;

  -- إذا لم يتم العثور على الرمز
  IF v_otp_record IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, 'رمز التحقق غير صحيح أو منتهي الصلاحية'::TEXT;
    RETURN;
  END IF;

  -- تحديث الرمز كمستخدم
  UPDATE otp_codes
  SET is_used = true,
      used_at = CURRENT_TIMESTAMP
  WHERE id = v_otp_record.id;

  -- إرجاع النتيجة
  RETURN QUERY SELECT true, v_otp_record.user_id, 'تم التحقق بنجاح'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة لتوليد OTP جديد
CREATE OR REPLACE FUNCTION generate_new_otp(
  p_user_id UUID,
  p_email VARCHAR
)
RETURNS TABLE(
  otp_code VARCHAR,
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_otp_code VARCHAR(6);
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- توليد رمز عشوائي من 6 أرقام
  v_otp_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');

  -- تحديد وقت الانتهاء (10 دقائق من الآن)
  v_expires_at := CURRENT_TIMESTAMP + INTERVAL '10 minutes';

  -- إلغاء جميع الأكواد السابقة غير المستخدمة لنفس المستخدم
  UPDATE otp_codes
  SET is_used = true
  WHERE user_id = p_user_id
    AND is_used = false;

  -- إدراج الرمز الجديد
  INSERT INTO otp_codes (user_id, email, otp_code, expires_at)
  VALUES (p_user_id, p_email, v_otp_code, v_expires_at);

  -- إرجاع الرمز ووقت الانتهاء
  RETURN QUERY SELECT v_otp_code, v_expires_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- جدولة حذف الأكواد المنتهية كل ساعة (اختياري - يحتاج pg_cron extension)
-- SELECT cron.schedule('delete-expired-otps', '0 * * * *', 'SELECT delete_expired_otp_codes()');

-- ملاحظات:
-- 1. تأكد من أن جدول users موجود قبل تطبيق هذا الـ migration
-- 2. الأكواد تنتهي صلاحيتها بعد 10 دقائق من الإنشاء
-- 3. كل رمز يمكن استخدامه مرة واحدة فقط
-- 4. يتم إلغاء الأكواد السابقة تلقائياً عند توليد رمز جديد
