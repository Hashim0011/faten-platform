/*
  # إنشاء جداول التفاعلات

  1. الجداول الجديدة
    - `content_likes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `content_id` (uuid, foreign key to content)
      - `created_at` (timestamp)
    
    - `content_views`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `content_id` (uuid, foreign key to content)
      - `view_duration` (integer) - بالثواني
      - `created_at` (timestamp)
    
    - `event_registrations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `event_id` (uuid, foreign key to events)
      - `status` (enum: registered, attended, cancelled)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - إضافة سياسات مناسبة
*/

-- إنشاء enum لحالة التسجيل في الفعاليات
CREATE TYPE registration_status AS ENUM ('registered', 'attended', 'cancelled');

-- إنشاء جدول إعجابات المحتوى
CREATE TABLE IF NOT EXISTS content_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content_id uuid REFERENCES content(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, content_id)
);

-- إنشاء جدول مشاهدات المحتوى
CREATE TABLE IF NOT EXISTS content_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content_id uuid REFERENCES content(id) ON DELETE CASCADE,
  view_duration integer DEFAULT 0, -- بالثواني
  created_at timestamptz DEFAULT now()
);

-- إنشاء جدول تسجيلات الفعاليات
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  status registration_status DEFAULT 'registered',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- تفعيل RLS على الجداول
ALTER TABLE content_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- سياسات إعجابات المحتوى
CREATE POLICY "Users can manage own likes"
  ON content_likes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can read likes count"
  ON content_likes
  FOR SELECT
  TO authenticated
  USING (true);

-- سياسات مشاهدات المحتوى
CREATE POLICY "Users can create own views"
  ON content_views
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own views"
  ON content_views
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- سياسات تسجيلات الفعاليات
CREATE POLICY "Users can manage own registrations"
  ON event_registrations
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Event instructors can read registrations"
  ON event_registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN experts ex ON e.instructor_id = ex.id
      WHERE e.id = event_registrations.event_id
      AND ex.user_id = auth.uid()
    )
  );

-- إنشاء فهارس
CREATE INDEX IF NOT EXISTS idx_content_likes_user_id ON content_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_content_likes_content_id ON content_likes(content_id);
CREATE INDEX IF NOT EXISTS idx_content_views_user_id ON content_views(user_id);
CREATE INDEX IF NOT EXISTS idx_content_views_content_id ON content_views(content_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);