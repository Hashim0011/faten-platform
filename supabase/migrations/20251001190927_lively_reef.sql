/*
  # إنشاء جداول النقاشات

  1. الجداول الجديدة
    - `discussions`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `created_by` (uuid, foreign key to users)
      - `expert_id` (uuid, foreign key to experts)
      - `status` (enum: active, closed, archived)
      - `participants_count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `discussion_messages`
      - `id` (uuid, primary key)
      - `discussion_id` (uuid, foreign key to discussions)
      - `user_id` (uuid, foreign key to users)
      - `content` (text)
      - `is_deleted` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - إضافة سياسات مناسبة
*/

-- إنشاء enum لحالة النقاش
CREATE TYPE discussion_status AS ENUM ('active', 'closed', 'archived');

-- إنشاء جدول النقاشات
CREATE TABLE IF NOT EXISTS discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_by uuid REFERENCES users(id) ON DELETE CASCADE,
  expert_id uuid REFERENCES experts(id) ON DELETE SET NULL,
  status discussion_status DEFAULT 'active',
  participants_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول رسائل النقاش
CREATE TABLE IF NOT EXISTS discussion_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id uuid REFERENCES discussions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تفعيل RLS على الجداول
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_messages ENABLE ROW LEVEL SECURITY;

-- سياسات النقاشات
CREATE POLICY "Anyone can read active discussions"
  ON discussions
  FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Users can create discussions"
  ON discussions
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creators can update own discussions"
  ON discussions
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Experts can manage assigned discussions"
  ON discussions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM experts 
      WHERE user_id = auth.uid() 
      AND id = discussions.expert_id
    )
  );

-- سياسات رسائل النقاش
CREATE POLICY "Anyone can read non-deleted messages"
  ON discussion_messages
  FOR SELECT
  TO authenticated
  USING (is_deleted = false);

CREATE POLICY "Users can create messages"
  ON discussion_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own messages"
  ON discussion_messages
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Experts can manage messages in their discussions"
  ON discussion_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM discussions d
      JOIN experts e ON d.expert_id = e.id
      WHERE d.id = discussion_messages.discussion_id
      AND e.user_id = auth.uid()
    )
  );

-- إنشاء فهارس
CREATE INDEX IF NOT EXISTS idx_discussions_created_by ON discussions(created_by);
CREATE INDEX IF NOT EXISTS idx_discussions_expert_id ON discussions(expert_id);
CREATE INDEX IF NOT EXISTS idx_discussions_status ON discussions(status);
CREATE INDEX IF NOT EXISTS idx_discussion_messages_discussion_id ON discussion_messages(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_messages_user_id ON discussion_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_messages_created_at ON discussion_messages(created_at);