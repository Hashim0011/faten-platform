/*
  # إنشاء الدوال والمحفزات

  1. الدوال
    - تحديث عدد الإعجابات والمشاهدات
    - تحديث عدد المشاركين في الفعاليات
    - تحديث إحصائيات المستخدمين
    - تحديث تاريخ آخر تحديث

  2. المحفزات
    - تحديث تلقائي للإحصائيات
    - تحديث تاريخ آخر تحديث
*/

-- دالة لتحديث تاريخ آخر تحديث
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- دالة لتحديث عدد الإعجابات
CREATE OR REPLACE FUNCTION update_content_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE content 
        SET likes = likes + 1 
        WHERE id = NEW.content_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE content 
        SET likes = likes - 1 
        WHERE id = OLD.content_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- دالة لتحديث عدد المشاهدات
CREATE OR REPLACE FUNCTION update_content_views_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE content 
    SET views = views + 1 
    WHERE id = NEW.content_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- دالة لتحديث عدد المشاركين في الفعاليات
CREATE OR REPLACE FUNCTION update_event_participants_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'registered' THEN
        UPDATE events 
        SET current_participants = current_participants + 1 
        WHERE id = NEW.event_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'registered' AND NEW.status != 'registered' THEN
            UPDATE events 
            SET current_participants = current_participants - 1 
            WHERE id = NEW.event_id;
        ELSIF OLD.status != 'registered' AND NEW.status = 'registered' THEN
            UPDATE events 
            SET current_participants = current_participants + 1 
            WHERE id = NEW.event_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'registered' THEN
        UPDATE events 
        SET current_participants = current_participants - 1 
        WHERE id = OLD.event_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- دالة لتحديث عدد النقاشات المشارك فيها
CREATE OR REPLACE FUNCTION update_discussion_participation()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- تحديث عدد المشاركين في النقاش
        UPDATE discussions 
        SET participants_count = (
            SELECT COUNT(DISTINCT user_id) 
            FROM discussion_messages 
            WHERE discussion_id = NEW.discussion_id 
            AND is_deleted = false
        )
        WHERE id = NEW.discussion_id;
        
        -- تحديث إحصائيات المستخدم
        UPDATE users 
        SET discussions_participated = (
            SELECT COUNT(DISTINCT discussion_id) 
            FROM discussion_messages 
            WHERE user_id = NEW.user_id 
            AND is_deleted = false
        )
        WHERE id = NEW.user_id;
        
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- إنشاء المحفزات

-- محفز تحديث updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experts_updated_at 
    BEFORE UPDATE ON experts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at 
    BEFORE UPDATE ON content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussions_updated_at 
    BEFORE UPDATE ON discussions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- محفز تحديث عدد الإعجابات
CREATE TRIGGER update_likes_count_trigger
    AFTER INSERT OR DELETE ON content_likes
    FOR EACH ROW EXECUTE FUNCTION update_content_likes_count();

-- محفز تحديث عدد المشاهدات
CREATE TRIGGER update_views_count_trigger
    AFTER INSERT ON content_views
    FOR EACH ROW EXECUTE FUNCTION update_content_views_count();

-- محفز تحديث عدد المشاركين في الفعاليات
CREATE TRIGGER update_participants_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON event_registrations
    FOR EACH ROW EXECUTE FUNCTION update_event_participants_count();

-- محفز تحديث مشاركة النقاشات
CREATE TRIGGER update_discussion_participation_trigger
    AFTER INSERT ON discussion_messages
    FOR EACH ROW EXECUTE FUNCTION update_discussion_participation();