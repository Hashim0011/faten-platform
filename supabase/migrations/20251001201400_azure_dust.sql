/*
  # إنشاء حساب الإدارة المفعل والجاهز للاستخدام

  1. إضافة قيد فريد على البريد الإلكتروني إذا لم يكن موجود
  2. إنشاء حساب الإدارة في نظام المصادقة
  3. ربط البيانات مع جدول المستخدمين
  4. تفعيل الحساب مباشرة بدون تأكيد إيميل
*/

-- إضافة قيد فريد على البريد الإلكتروني إذا لم يكن موجود
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_email_key' 
    AND table_name = 'users'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
  END IF;
END $$;

-- إنشاء حساب الإدارة في نظام المصادقة
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@faten.com',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "مدير النظام", "role": "admin"}',
  false,
  'authenticated',
  'authenticated',
  '',
  '',
  ''
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  updated_at = now(),
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- إضافة بيانات المستخدم في جدول users
INSERT INTO users (
  id,
  email,
  full_name,
  phone,
  role,
  status,
  created_at,
  updated_at,
  last_active,
  hours_spent,
  engagement_rate,
  content_engaged,
  discussions_participated
) 
SELECT 
  au.id,
  'admin@faten.com',
  'مدير النظام',
  '+966500000000',
  'other',
  'active',
  now(),
  now(),
  now(),
  0,
  0,
  0,
  0
FROM auth.users au 
WHERE au.email = 'admin@faten.com'
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  updated_at = now(),
  last_active = now();