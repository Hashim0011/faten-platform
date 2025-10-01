/*
  # إنشاء جدول الخبراء

  1. الجداول الجديدة
    - `experts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `specialization` (text)
      - `bio` (text)
      - `rating` (numeric)
      - `discussions_handled` (integer)
      - `activity_hours` (numeric)
      - `engagement_rate` (numeric)
      - `verified` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جدول `experts`
    - إضافة سياسات للخبراء والإدارة
*/

-- إنشاء جدول الخبراء
CREATE TABLE IF NOT EXISTS experts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  specialization text NOT NULL,
  bio text,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  discussions_handled integer DEFAULT 0,
  activity_hours numeric DEFAULT 0,
  engagement_rate numeric DEFAULT 0,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;

-- سياسة للخبراء لقراءة بياناتهم
CREATE POLICY "Experts can read own data"
  ON experts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- سياسة للخبراء لتحديث بياناتهم
CREATE POLICY "Experts can update own data"
  ON experts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- سياسة للجميع لقراءة بيانات الخبراء المعتمدين
CREATE POLICY "Anyone can read verified experts"
  ON experts
  FOR SELECT
  TO authenticated
  USING (verified = true);

-- سياسة للإدارة لإدارة جميع الخبراء
CREATE POLICY "Admins can manage all experts"
  ON experts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND email = 'admin@faten.com'
    )
  );

-- إنشاء فهارس
CREATE INDEX IF NOT EXISTS idx_experts_user_id ON experts(user_id);
CREATE INDEX IF NOT EXISTS idx_experts_specialization ON experts(specialization);
CREATE INDEX IF NOT EXISTS idx_experts_verified ON experts(verified);
CREATE INDEX IF NOT EXISTS idx_experts_rating ON experts(rating);