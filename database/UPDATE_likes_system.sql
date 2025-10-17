-- =====================================================
-- تحديث نظام اللايكات في منصة فطن
-- =====================================================
-- هذا الملف يدمج النظام القديم (likes_count) مع النظام الجديد (likes table)
-- =====================================================

-- 1. إنشاء جدول الإعجابات (اللايكات) على المحتوى
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- منع تكرار اللايك من نفس المستخدم على نفس المحتوى
  UNIQUE(user_id, content_id)
);

-- 2. إنشاء فهرس لتسريع البحث
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_content_id ON likes(content_id);
CREATE INDEX IF NOT EXISTS idx_likes_combo ON likes(user_id, content_id);

-- 3. تفعيل Row Level Security
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 4. سياسة القراءة: يمكن لأي مستخدم مسجل رؤية جميع اللايكات
CREATE POLICY "Anyone can view likes" ON likes
  FOR SELECT
  USING (true);

-- 5. سياسة الإضافة: يمكن فقط للمستخدمين المسجلين إضافة لايك
CREATE POLICY "Authenticated users can add likes" ON likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. سياسة الحذف: يمكن فقط للمستخدم حذف لايكه الخاص
CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 7. دالة لتحديث likes_count تلقائياً
-- =====================================================
-- هذه الدالة تحدّث العمود likes_count في جدول content
-- كلما تمت إضافة أو حذف لايك

CREATE OR REPLACE FUNCTION update_content_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- زيادة عدد اللايكات عند إضافة لايك جديد
    UPDATE content
    SET likes_count = likes_count + 1
    WHERE id = NEW.content_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- تقليل عدد اللايكات عند حذف لايك
    UPDATE content
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.content_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 8. إنشاء Trigger لتحديث likes_count تلقائياً
DROP TRIGGER IF EXISTS trigger_update_likes_count ON likes;

CREATE TRIGGER trigger_update_likes_count
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_content_likes_count();

-- =====================================================
-- 9. تصحيح likes_count الحالي (اختياري)
-- =====================================================
-- إذا كان لديك بيانات قديمة في likes_count، هذا الكود يصححها
-- بناءً على عدد اللايكات الفعلي في جدول likes

-- ⚠️ ملاحظة: شغل هذا فقط إذا كان عندك بيانات قديمة تحتاج تصحيح
-- وإلا اتركه معلق (commented)

/*
UPDATE content
SET likes_count = (
  SELECT COUNT(*)
  FROM likes
  WHERE likes.content_id = content.id
);
*/

-- =====================================================
-- 10. اختبار النظام
-- =====================================================
-- يمكنك اختبار النظام بهذه الأوامر:

/*
-- إضافة لايك تجريبي (استبدل الـ UUIDs بقيم حقيقية من قاعدة بياناتك)
INSERT INTO likes (user_id, content_id)
VALUES ('user-uuid-here', 'content-uuid-here');

-- التحقق من تحديث likes_count
SELECT id, title, likes_count FROM content WHERE id = 'content-uuid-here';

-- حذف اللايك
DELETE FROM likes WHERE user_id = 'user-uuid-here' AND content_id = 'content-uuid-here';

-- التحقق من تقليل likes_count
SELECT id, title, likes_count FROM content WHERE id = 'content-uuid-here';
*/

-- =====================================================
-- ملاحظات مهمة:
-- =====================================================
-- ✅ العمود likes_count سيبقى موجود ويتحدث تلقائياً
-- ✅ جدول likes الجديد يوفر تفاصيل كاملة (من أعجب ومتى)
-- ✅ النظام يمنع التكرار تلقائياً
-- ✅ الأداء ممتاز لأن likes_count محدث دائماً
-- ✅ يمكنك عرض likes_count بدون عد كل مرة (أسرع بكثير)

-- انتهى الملف ✅
