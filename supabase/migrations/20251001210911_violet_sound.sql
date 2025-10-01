/*
  # Complete Database Schema for Digital Library Platform

  This migration creates a comprehensive database schema for a digital library platform
  focused on intellectual security with three distinct user roles and proper authentication.

  ## Tables Created:
  1. Users - Regular platform users
  2. Experts - Content creators and discussion moderators  
  3. Admins - Platform administrators
  4. Content - Articles, books, videos
  5. Content Views/Likes - User engagement tracking
  6. Discussions - Forum topics
  7. Discussion Messages - User-expert conversations
  8. Events - Workshops and webinars
  9. Event Registrations - User event signups

  ## Security:
  - Row Level Security (RLS) enabled on all tables
  - Role-based access control
  - Proper foreign key relationships
  - Data integrity constraints
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for better data consistency
CREATE TYPE user_role AS ENUM ('parent', 'teacher', 'student', 'other');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deleted');
CREATE TYPE content_type AS ENUM ('book', 'video', 'article');
CREATE TYPE content_status AS ENUM ('published', 'draft', 'archived');
CREATE TYPE discussion_status AS ENUM ('active', 'closed', 'archived');
CREATE TYPE event_type AS ENUM ('workshop', 'course', 'lecture', 'seminar');
CREATE TYPE event_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');
CREATE TYPE registration_status AS ENUM ('registered', 'attended', 'cancelled');

-- Helper function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- USERS TABLE (Regular platform users)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role DEFAULT 'student',
    status user_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW(),
    
    -- Analytics fields
    hours_spent NUMERIC DEFAULT 0,
    engagement_rate NUMERIC DEFAULT 0,
    content_engaged INTEGER DEFAULT 0,
    discussions_participated INTEGER DEFAULT 0,
    
    -- Constraints
    CONSTRAINT users_user_id_key UNIQUE (user_id),
    CONSTRAINT users_email_key UNIQUE (email)
);

COMMENT ON TABLE users IS 'Regular platform users - students, teachers, parents';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Add trigger for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- EXPERTS TABLE (Content creators and moderators)
-- =============================================
CREATE TABLE IF NOT EXISTS experts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    specialization TEXT NOT NULL,
    bio TEXT,
    rating NUMERIC DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    discussions_handled INTEGER DEFAULT 0,
    activity_hours NUMERIC DEFAULT 0,
    engagement_rate NUMERIC DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT experts_user_id_key UNIQUE (user_id)
);

COMMENT ON TABLE experts IS 'Platform experts who manage discussions and content';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_experts_user_id ON experts(user_id);
CREATE INDEX IF NOT EXISTS idx_experts_specialization ON experts(specialization);
CREATE INDEX IF NOT EXISTS idx_experts_rating ON experts(rating);
CREATE INDEX IF NOT EXISTS idx_experts_verified ON experts(verified);

-- Add trigger for updated_at
CREATE TRIGGER update_experts_updated_at
    BEFORE UPDATE ON experts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ADMINS TABLE (Platform administrators)
-- =============================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    permissions JSONB DEFAULT '{"full_access": true}',
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT admins_user_id_key UNIQUE (user_id),
    CONSTRAINT admins_email_key UNIQUE (email)
);

COMMENT ON TABLE admins IS 'Platform administrators with full system access';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Add trigger for updated_at
CREATE TRIGGER update_admins_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- CONTENT TABLE (Articles, books, videos)
-- =============================================
CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type content_type NOT NULL,
    category TEXT NOT NULL,
    author TEXT NOT NULL,
    image_url TEXT,
    content_url TEXT,
    status content_status DEFAULT 'draft',
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE content IS 'Digital library content - books, videos, articles';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_content_type ON content(type);
CREATE INDEX IF NOT EXISTS idx_content_category ON content(category);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_created_by ON content(created_by);
CREATE INDEX IF NOT EXISTS idx_content_views ON content(views);
CREATE INDEX IF NOT EXISTS idx_content_likes ON content(likes);

-- Add trigger for updated_at
CREATE TRIGGER update_content_updated_at
    BEFORE UPDATE ON content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DISCUSSIONS TABLE (Forum topics)
-- =============================================
CREATE TABLE IF NOT EXISTS discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    expert_id UUID REFERENCES experts(id) ON DELETE SET NULL,
    status discussion_status DEFAULT 'active',
    participants_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE discussions IS 'Discussion forum topics';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_discussions_created_by ON discussions(created_by);
CREATE INDEX IF NOT EXISTS idx_discussions_expert_id ON discussions(expert_id);
CREATE INDEX IF NOT EXISTS idx_discussions_status ON discussions(status);

-- Add trigger for updated_at
CREATE TRIGGER update_discussions_updated_at
    BEFORE UPDATE ON discussions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DISCUSSION MESSAGES TABLE (User-expert conversations)
-- =============================================
CREATE TABLE IF NOT EXISTS discussion_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE discussion_messages IS 'Messages within discussion topics';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_discussion_messages_discussion_id ON discussion_messages(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_messages_user_id ON discussion_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_messages_created_at ON discussion_messages(created_at);

-- =============================================
-- EVENTS TABLE (Workshops and webinars)
-- =============================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type event_type NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INTEGER DEFAULT 60, -- minutes
    location TEXT,
    max_participants INTEGER DEFAULT 50,
    current_participants INTEGER DEFAULT 0,
    instructor_id UUID REFERENCES experts(id) ON DELETE SET NULL,
    status event_status DEFAULT 'upcoming',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE events IS 'Platform events - workshops, courses, lectures';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_instructor_id ON events(instructor_id);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);

-- Add trigger for updated_at
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- CONTENT VIEWS TABLE (User engagement tracking)
-- =============================================
CREATE TABLE IF NOT EXISTS content_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    view_duration INTEGER DEFAULT 0, -- seconds
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE content_views IS 'Track user content viewing behavior';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_content_views_user_id ON content_views(user_id);
CREATE INDEX IF NOT EXISTS idx_content_views_content_id ON content_views(content_id);

-- =============================================
-- CONTENT LIKES TABLE (User engagement tracking)
-- =============================================
CREATE TABLE IF NOT EXISTS content_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one like per user per content
    CONSTRAINT content_likes_user_id_content_id_key UNIQUE (user_id, content_id)
);

COMMENT ON TABLE content_likes IS 'Track user content likes';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_content_likes_user_id ON content_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_content_likes_content_id ON content_likes(content_id);

-- =============================================
-- EVENT REGISTRATIONS TABLE (User event signups)
-- =============================================
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    status registration_status DEFAULT 'registered',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one registration per user per event
    CONSTRAINT event_registrations_user_id_event_id_key UNIQUE (user_id, event_id)
);

COMMENT ON TABLE event_registrations IS 'User event registrations';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);

-- =============================================
-- TRIGGERS FOR ANALYTICS AND COUNTERS
-- =============================================

-- Function to update content views count
CREATE OR REPLACE FUNCTION update_content_views_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE content 
    SET views = views + 1 
    WHERE id = NEW.content_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for content views
CREATE TRIGGER update_views_count_trigger
    AFTER INSERT ON content_views
    FOR EACH ROW
    EXECUTE FUNCTION update_content_views_count();

-- Function to update content likes count
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
$$ LANGUAGE plpgsql;

-- Trigger for content likes
CREATE TRIGGER update_likes_count_trigger
    AFTER INSERT OR DELETE ON content_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_content_likes_count();

-- Function to update event participants count
CREATE OR REPLACE FUNCTION update_event_participants_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE events 
        SET current_participants = current_participants + 1 
        WHERE id = NEW.event_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE events 
        SET current_participants = current_participants - 1 
        WHERE id = OLD.event_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle status changes
        IF OLD.status = 'registered' AND NEW.status = 'cancelled' THEN
            UPDATE events 
            SET current_participants = current_participants - 1 
            WHERE id = NEW.event_id;
        ELSIF OLD.status = 'cancelled' AND NEW.status = 'registered' THEN
            UPDATE events 
            SET current_participants = current_participants + 1 
            WHERE id = NEW.event_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for event participants
CREATE TRIGGER update_participants_count_trigger
    AFTER INSERT OR DELETE OR UPDATE ON event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_event_participants_count();

-- Function to update discussion participation
CREATE OR REPLACE FUNCTION update_discussion_participation()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user's discussion participation count
    UPDATE users 
    SET discussions_participated = discussions_participated + 1 
    WHERE user_id = NEW.user_id;
    
    -- Update discussion participants count
    UPDATE discussions 
    SET participants_count = (
        SELECT COUNT(DISTINCT user_id) 
        FROM discussion_messages 
        WHERE discussion_id = NEW.discussion_id
    )
    WHERE id = NEW.discussion_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for discussion participation
CREATE TRIGGER update_discussion_participation_trigger
    AFTER INSERT ON discussion_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_discussion_participation();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USERS TABLE POLICIES
-- =============================================

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can insert their own data
CREATE POLICY "Users can insert own data" ON users
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Admins can manage all users
CREATE POLICY "Admins can manage all users" ON users
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid()
        )
    );

-- =============================================
-- EXPERTS TABLE POLICIES
-- =============================================

-- Experts can read their own data
CREATE POLICY "Experts can read own data" ON experts
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Experts can update their own data
CREATE POLICY "Experts can update own data" ON experts
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

-- Anyone can read verified experts
CREATE POLICY "Anyone can read verified experts" ON experts
    FOR SELECT TO authenticated
    USING (verified = true);

-- Admins can manage all experts
CREATE POLICY "Admins can manage all experts" ON experts
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid()
        )
    );

-- =============================================
-- ADMINS TABLE POLICIES
-- =============================================

-- Only admins can access admin data
CREATE POLICY "Only admins can access admin data" ON admins
    FOR ALL TO authenticated
    USING (auth.uid() = user_id);

-- =============================================
-- CONTENT TABLE POLICIES
-- =============================================

-- Anyone can read published content
CREATE POLICY "Anyone can read published content" ON content
    FOR SELECT TO authenticated
    USING (status = 'published');

-- Experts can create content
CREATE POLICY "Experts can create content" ON content
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM experts 
            WHERE user_id = auth.uid()
        )
    );

-- Experts can update their own content
CREATE POLICY "Experts can update own content" ON content
    FOR UPDATE TO authenticated
    USING (created_by = auth.uid());

-- Admins can manage all content
CREATE POLICY "Admins can manage all content" ON content
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid()
        )
    );

-- =============================================
-- DISCUSSIONS TABLE POLICIES
-- =============================================

-- Anyone can read active discussions
CREATE POLICY "Anyone can read active discussions" ON discussions
    FOR SELECT TO authenticated
    USING (status = 'active');

-- Users can create discussions
CREATE POLICY "Users can create discussions" ON discussions
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

-- Creators can update their own discussions
CREATE POLICY "Creators can update own discussions" ON discussions
    FOR UPDATE TO authenticated
    USING (created_by = auth.uid());

-- Experts can manage assigned discussions
CREATE POLICY "Experts can manage assigned discussions" ON discussions
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM experts 
            WHERE user_id = auth.uid() AND id = discussions.expert_id
        )
    );

-- =============================================
-- DISCUSSION MESSAGES TABLE POLICIES
-- =============================================

-- Anyone can read non-deleted messages
CREATE POLICY "Anyone can read non-deleted messages" ON discussion_messages
    FOR SELECT TO authenticated
    USING (is_deleted = false);

-- Users can create messages
CREATE POLICY "Users can create messages" ON discussion_messages
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can update their own messages
CREATE POLICY "Users can update own messages" ON discussion_messages
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

-- Experts can manage messages in their discussions
CREATE POLICY "Experts can manage messages in their discussions" ON discussion_messages
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM discussions d
            JOIN experts e ON d.expert_id = e.id
            WHERE d.id = discussion_messages.discussion_id 
            AND e.user_id = auth.uid()
        )
    );

-- =============================================
-- EVENTS TABLE POLICIES
-- =============================================

-- Anyone can read upcoming and ongoing events
CREATE POLICY "Anyone can read upcoming and ongoing events" ON events
    FOR SELECT TO authenticated
    USING (status IN ('upcoming', 'ongoing'));

-- Experts can create events
CREATE POLICY "Experts can create events" ON events
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM experts 
            WHERE user_id = auth.uid()
        )
    );

-- Instructors can update their own events
CREATE POLICY "Instructors can update own events" ON events
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM experts 
            WHERE user_id = auth.uid() AND id = events.instructor_id
        )
    );

-- Admins can manage all events
CREATE POLICY "Admins can manage all events" ON events
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid()
        )
    );

-- =============================================
-- CONTENT VIEWS TABLE POLICIES
-- =============================================

-- Users can create their own views
CREATE POLICY "Users can create own views" ON content_views
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can read their own views
CREATE POLICY "Users can read own views" ON content_views
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- =============================================
-- CONTENT LIKES TABLE POLICIES
-- =============================================

-- Users can manage their own likes
CREATE POLICY "Users can manage own likes" ON content_likes
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

-- Anyone can read likes count
CREATE POLICY "Anyone can read likes count" ON content_likes
    FOR SELECT TO authenticated
    USING (true);

-- =============================================
-- EVENT REGISTRATIONS TABLE POLICIES
-- =============================================

-- Users can manage their own registrations
CREATE POLICY "Users can manage own registrations" ON event_registrations
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

-- Event instructors can read registrations
CREATE POLICY "Event instructors can read registrations" ON event_registrations
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM events e
            JOIN experts ex ON e.instructor_id = ex.id
            WHERE e.id = event_registrations.event_id 
            AND ex.user_id = auth.uid()
        )
    );

-- =============================================
-- CREATE DEFAULT ADMIN ACCOUNT
-- =============================================

-- Insert default admin account (will be created in auth.users separately)
DO $$
BEGIN
    -- Insert admin user if not exists
    INSERT INTO admins (user_id, email, full_name, permissions)
    VALUES (
        '00000000-0000-0000-0000-000000000001'::uuid,
        'admin@faten.com',
        'مدير النظام',
        '{"full_access": true, "analytics": true, "user_management": true}'::jsonb
    )
    ON CONFLICT (email) DO NOTHING;
    
    -- Insert expert user if not exists
    INSERT INTO experts (user_id, specialization, bio, verified)
    VALUES (
        '00000000-0000-0000-0000-000000000002'::uuid,
        'الأمن الفكري والتربية الإسلامية',
        'خبير متخصص في مجال الأمن الفكري والتربية الإسلامية مع خبرة تزيد عن 10 سنوات',
        true
    )
    ON CONFLICT (user_id) DO NOTHING;
    
EXCEPTION
    WHEN others THEN
        -- Ignore errors if auth users don't exist yet
        NULL;
END $$;

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Insert sample content
INSERT INTO content (title, description, type, category, author, status, views, likes) VALUES
('أسس الأمن الفكري', 'دليل شامل لفهم وتطبيق مبادئ الأمن الفكري في المجتمع المعاصر', 'book', 'الأمن الفكري', 'د. محمد الشهري', 'published', 1247, 189),
('الوسطية في الإسلام', 'سلسلة تعليمية تشرح مفهوم الوسطية وتطبيقاتها العملية', 'video', 'التربية الإسلامية', 'د. أحمد السالم', 'published', 892, 156),
('التحديات المعاصرة للشباب', 'تحليل شامل للتحديات التي تواجه الشباب في العصر الرقمي', 'article', 'قضايا معاصرة', 'د. سارة الحربي', 'published', 654, 98),
('مهارات التفكير النقدي', 'دليل عملي لتنمية مهارات التفكير النقدي والتحليلي', 'book', 'التطوير الذاتي', 'د. عبدالله النمر', 'published', 543, 87);

-- Insert sample discussions
INSERT INTO discussions (title, description, status) VALUES
('دور الأسرة في تعزيز الأمن الفكري', 'نقاش حول الدور المحوري للأسرة في بناء الأمن الفكري للأبناء', 'active'),
('التحديات المعاصرة للشباب', 'مناقشة التحديات التي يواجهها الشباب في عصر التكنولوجيا', 'active'),
('الوسطية في الإسلام', 'حوار حول مفهوم الوسطية وتطبيقاتها في الحياة اليومية', 'active');

-- Insert sample events
INSERT INTO events (title, description, type, date, time, duration, location, max_participants, status) VALUES
('ورشة عمل: تعزيز الهوية الوطنية', 'ورشة تفاعلية حول أهمية الهوية الوطنية وطرق تعزيزها', 'workshop', '2024-04-15', '19:00', 120, 'قاعة المؤتمرات الرئيسية', 50, 'upcoming'),
('دورة: مهارات التفكير النقدي', 'دورة شاملة لتطوير مهارات التفكير النقدي والتحليلي', 'course', '2024-04-20', '18:00', 180, 'المركز التدريبي', 30, 'upcoming'),
('محاضرة: الأمن الفكري في العصر الرقمي', 'محاضرة حول تحديات الأمن الفكري في عصر التكنولوجيا', 'lecture', '2024-04-25', '20:00', 90, 'القاعة الكبرى', 100, 'upcoming');

-- Create indexes for better performance on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_content_created_at ON content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON discussions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_date_status ON events(date, status);
CREATE INDEX IF NOT EXISTS idx_discussion_messages_discussion_created ON discussion_messages(discussion_id, created_at);

-- Add comments for documentation
COMMENT ON SCHEMA public IS 'Digital Library Platform Schema - Intellectual Security Focus';
COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates the updated_at timestamp';
COMMENT ON FUNCTION update_content_views_count() IS 'Updates content view count when a new view is recorded';
COMMENT ON FUNCTION update_content_likes_count() IS 'Updates content like count when likes are added/removed';
COMMENT ON FUNCTION update_event_participants_count() IS 'Updates event participant count based on registrations';
COMMENT ON FUNCTION update_discussion_participation() IS 'Updates user discussion participation statistics';