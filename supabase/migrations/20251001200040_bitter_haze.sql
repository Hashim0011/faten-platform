/*
  # إضافة حساب الإدارة الافتراضي

  1. إضافة المستخدم الإداري
    - البريد الإلكتروني: admin@faten.com
    - كلمة المرور: Admin123!
    - الدور: admin
    - الحالة: نشط

  2. الأمان
    - تشفير كلمة المرور
    - تفعيل الحساب مباشرة
    - صلاحيات إدارية كاملة
*/

-- إدراج حساب الإدارة في جدول auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@faten.com',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  '',
  NOW(),
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "مدير النظام", "role": "admin"}',
  FALSE,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  FALSE,
  NULL
) ON CONFLICT (email) DO NOTHING;

-- الحصول على معرف المستخدم الإداري
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- البحث عن معرف المستخدم الإداري
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@faten.com';
  
  -- إدراج بيانات المستخدم في جدول users
  INSERT INTO public.users (
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
  ) VALUES (
    admin_user_id,
    'admin@faten.com',
    'مدير النظام',
    '+966500000000',
    'other',
    'active',
    NOW(),
    NOW(),
    NOW(),
    0,
    0,
    0,
    0
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();
    
END $$;

-- إضافة تعليق على الجدول
COMMENT ON TABLE public.users IS 'جدول المستخدمين - يحتوي على حساب الإدارة الافتراضي admin@faten.com';