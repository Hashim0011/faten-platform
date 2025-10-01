/*
  # إنشاء جدول المحتوى

  1. الجداول الجديدة
    - `content`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `type` (enum: book, video, article)
      - `category` (text)
      - `author` (text)
      - `image_url` (text)
      - `content_url` (text)
      - `status` (enum: published, draft, archived)
      - `views` (integer)
      - `likes` (integer)
      - `created_by` (uuid, foreign key to users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جدول `content`
    - إضافة سياسات للقراءة والكتابة
*/

-- إنشاء enum لنوع المحتوى
CREATE TYPE content_type AS ENUM ('book', 'video', 'article');

-- إنشاء enum لحالة المحتوى
CREATE TYPE content_status AS ENUM ('published', 'draft', 'archived');

-- إنشاء جدول المحتوى
CREATE TABLE IF NOT EXISTS content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type content_type NOT NULL,
  category text NOT NULL,
  author text NOT NULL,
  image_url text,
  content_url text,
  status content_status DEFAULT 'draft',
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- سياسة للجميع لقراءة المحتوى المنشور
CREATE POLICY "Anyone can read published content"
  ON content
  FOR SELECT
  TO authenticated
  USING (status = 'published');

-- سياسة للخبراء لإنشاء محتوى
CREATE POLICY "Experts can create content"
  ON content
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM experts 
      WHERE user_id = auth.uid()
    )
  );

-- سياسة للخبراء لتحديث محتواهم
CREATE POLICY "Experts can update own content"
  ON content
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- سياسة للإدارة لإدارة جميع المحتوى
CREATE POLICY "Admins can manage all content"
  ON content
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
CREATE INDEX IF NOT EXISTS idx_content_type ON content(type);
CREATE INDEX IF NOT EXISTS idx_content_category ON content(category);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_created_by ON content(created_by);
CREATE INDEX IF NOT EXISTS idx_content_views ON content(views);
CREATE INDEX IF NOT EXISTS idx_content_likes ON content(likes);