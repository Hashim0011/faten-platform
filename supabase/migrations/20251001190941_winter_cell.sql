/*
  # إنشاء جدول الفعاليات

  1. الجداول الجديدة
    - `events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `type` (enum: workshop, course, lecture, seminar)
      - `date` (date)
      - `time` (time)
      - `duration` (integer) - بالدقائق
      - `location` (text)
      - `max_participants` (integer)
      - `current_participants` (integer)
      - `instructor_id` (uuid, foreign key to experts)
      - `status` (enum: upcoming, ongoing, completed, cancelled)
      - `created_by` (uuid, foreign key to users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جدول `events`
    - إضافة سياسات مناسبة
*/

-- إنشاء enum لنوع الفعالية
CREATE TYPE event_type AS ENUM ('workshop', 'course', 'lecture', 'seminar');

-- إنشاء enum لحالة الفعالية
CREATE TYPE event_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');

-- إنشاء جدول الفعاليات
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type event_type NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  duration integer DEFAULT 60, -- بالدقائق
  location text,
  max_participants integer DEFAULT 50,
  current_participants integer DEFAULT 0,
  instructor_id uuid REFERENCES experts(id) ON DELETE SET NULL,
  status event_status DEFAULT 'upcoming',
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- سياسة للجميع لقراءة الفعاليات القادمة والجارية
CREATE POLICY "Anyone can read upcoming and ongoing events"
  ON events
  FOR SELECT
  TO authenticated
  USING (status IN ('upcoming', 'ongoing'));

-- سياسة للخبراء لإنشاء فعاليات
CREATE POLICY "Experts can create events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM experts 
      WHERE user_id = auth.uid()
    )
  );

-- سياسة للمدربين لتحديث فعالياتهم
CREATE POLICY "Instructors can update own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM experts 
      WHERE user_id = auth.uid() 
      AND id = events.instructor_id
    )
  );

-- سياسة للإدارة لإدارة جميع الفعاليات
CREATE POLICY "Admins can manage all events"
  ON events
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
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_instructor_id ON events(instructor_id);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);