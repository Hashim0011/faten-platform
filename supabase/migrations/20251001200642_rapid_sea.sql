/*
  # إنشاء حساب الإدارة المفعل

  1. إنشاء حساب في auth.users
    - البريد الإلكتروني: admin@faten.com
    - كلمة المرور: Admin123!
    - مفعل ومؤكد مباشرة
  
  2. إنشاء بيانات المستخدم في جدول users
    - ربط مع حساب المصادقة
    - دور إدارة
    - حالة نشطة
*/

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
) ON CONFLICT (email) DO NOTHING;

-- الحصول على معرف المستخدم المنشأ
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- الحصول على معرف المستخدم
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@faten.com';
  
  -- إنشاء بيانات المستخدم في جدول users
  INSERT INTO public.users (
    id,
    email,
    full_name,
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
    'other',
    'active',
    now(),
    now(),
    now(),
    0,
    0,
    0,
    0
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = now();
END $$;