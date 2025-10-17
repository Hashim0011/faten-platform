-- جدول الإعجابات (اللايكات) على المحتوى
-- Likes Table

CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- منع تكرار اللايك من نفس المستخدم على نفس المحتوى
  UNIQUE(user_id, content_id)
);

-- إنشاء فهرس لتسريع البحث
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_content_id ON likes(content_id);
CREATE INDEX IF NOT EXISTS idx_likes_combo ON likes(user_id, content_id);

-- تفعيل Row Level Security
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: يمكن لأي مستخدم مسجل رؤية جميع اللايكات
CREATE POLICY "Anyone can view likes" ON likes
  FOR SELECT
  USING (true);

-- سياسة الإضافة: يمكن فقط للمستخدمين المسجلين إضافة لايك
CREATE POLICY "Authenticated users can add likes" ON likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- سياسة الحذف: يمكن فقط للمستخدم حذف لايكه الخاص
CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE
  USING (auth.uid() = user_id);
