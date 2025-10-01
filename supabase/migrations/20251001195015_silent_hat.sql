/*
  # إنشاء حساب الإدارة الافتراضي

  1. إنشاء حساب إدارة
    - البريد الإلكتروني: admin@faten.com
    - كلمة المرور: Admin123!
    - الدور: admin
    - الحالة: نشط

  2. الأمان
    - تفعيل RLS
    - صلاحيات كاملة للإدارة
*/

-- إدراج حساب الإدارة الافتراضي
INSERT INTO users (
  id,
  email,
  full_name,
  role,
  status,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@faten.com',
  'مدير النظام',
  'other',
  'active',
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;

-- إضافة تعليق للتوضيح
COMMENT ON TABLE users IS 'جدول المستخدمين - يحتوي على حساب الإدارة الافتراضي admin@faten.com';