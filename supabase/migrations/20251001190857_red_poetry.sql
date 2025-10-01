/*
  # إنشاء جدول المستخدمين

  1. الجداول الجديدة
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `full_name` (text)
      - `phone` (text)
      - `role` (enum: parent, teacher, student, other)
      - `status` (enum: active, suspended, deleted)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `last_active` (timestamp)
      - `hours_spent` (numeric)
      - `engagement_rate` (numeric)
      - `content_engaged` (integer)
      - `discussions_participated` (integer)

  2. الأمان
    - تفعيل RLS على جدول `users`
    - إضافة سياسات للمستخدمين المصرح لهم
*/

-- إنشاء enum للأدوار
CREATE TYPE user_role AS ENUM ('parent', 'teacher', 'student', 'other');

-- إنشاء enum لحالة المستخدم
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deleted');

-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  role user_role NOT NULL DEFAULT 'student',
  status user_status NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now(),
  hours_spent numeric DEFAULT 0,
  engagement_rate numeric DEFAULT 0,
  content_engaged integer DEFAULT 0,
  discussions_participated integer DEFAULT 0
);

-- تفعيل RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- سياسة للمستخدمين لقراءة بياناتهم الخاصة
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- سياسة للمستخدمين لتحديث بياناتهم الخاصة
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- سياسة للإدارة لقراءة جميع البيانات
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND email = 'admin@faten.com'
    )
  );

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);