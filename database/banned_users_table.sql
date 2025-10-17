-- جدول المستخدمين المحظورين من النقاشات
-- Banned Users Table

CREATE TABLE IF NOT EXISTS banned_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT DEFAULT 'مخالفة قواعد النقاش',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- منع تكرار الحظر لنفس المستخدم في نفس النقاش
  UNIQUE(user_id, discussion_id)
);

-- إنشاء فهرس لتسريع البحث
CREATE INDEX IF NOT EXISTS idx_banned_users_user_id ON banned_users(user_id);
CREATE INDEX IF NOT EXISTS idx_banned_users_discussion_id ON banned_users(discussion_id);
CREATE INDEX IF NOT EXISTS idx_banned_users_combo ON banned_users(user_id, discussion_id);

-- تفعيل Row Level Security
ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: يمكن لأي مستخدم مسجل رؤية حالة الحظر الخاصة به
CREATE POLICY "Users can view their own bans" ON banned_users
  FOR SELECT
  USING (auth.uid() = user_id);

-- سياسة القراءة: يمكن للخبراء والمدراء رؤية جميع سجلات الحظر
CREATE POLICY "Experts and admins can view all bans" ON banned_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('expert', 'admin')
    )
  );

-- سياسة الإضافة: يمكن فقط للخبراء والمدراء حظر المستخدمين
CREATE POLICY "Experts and admins can ban users" ON banned_users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('expert', 'admin')
    )
  );

-- سياسة الحذف: يمكن فقط للخبراء والمدراء إلغاء الحظر
CREATE POLICY "Experts and admins can unban users" ON banned_users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('expert', 'admin')
    )
  );
