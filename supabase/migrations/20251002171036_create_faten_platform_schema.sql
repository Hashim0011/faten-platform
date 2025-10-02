/*
  # Faten Platform - Complete Database Schema
  
  ## Overview
  Digital library platform focused on intellectual security with role-based access control.
  
  ## Tables Created
  
  ### 1. Authentication & User Management
  - **users**: Regular platform users (can self-register)
    - Links to auth.users via user_id
    - Stores profile info: full_name, email, avatar_url
    - Tracks engagement: total_hours_spent, engagement_rate
    - Status tracking: active/suspended/deleted
    - Timestamps: created_at, updated_at, last_active
  
  - **experts**: Content creators and discussion moderators (admin-created only)
    - Links to auth.users via user_id
    - Stores: full_name, email, avatar_url, specialization
    - Tracks: discussions_handled, activity_hours, rating
    - Status: active/suspended/deleted
    - Timestamps: created_at, updated_at
  
  - **admins**: Platform administrators (admin-created only)
    - Links to auth.users via user_id
    - Stores: full_name, email, avatar_url, permissions (JSONB)
    - Status: active/suspended
    - Timestamps: created_at, updated_at
  
  ### 2. Content Management
  - **content**: Digital library items (articles, videos, ebooks)
    - Supports multiple content types: article, video, ebook
    - Tracks: title, description, author, category
    - Stores: image_url, content_url, file_size
    - Status: published/draft/archived
    - Metrics: views_count, likes_count
    - Created by experts: created_by_expert_id
    - Timestamps: created_at, updated_at, published_at
  
  - **content_views**: Track individual content views
    - Links user to content with view timestamp
    - Prevents duplicate counting per user
    - Tracks: user_id, content_id, viewed_at
  
  - **content_likes**: Track content likes
    - Links user to content with like timestamp
    - Prevents duplicate likes per user
    - Tracks: user_id, content_id, liked_at
  
  ### 3. Discussion Forum
  - **discussions**: Discussion topics
    - Title and description
    - Created by users, managed by experts
    - Status: active/closed/archived
    - Metrics: participants_count, messages_count
    - Assignment: assigned_expert_id
    - Timestamps: created_at, updated_at, closed_at
  
  - **discussion_messages**: Messages in discussions
    - Links to discussion, user/expert
    - Supports both user and expert messages
    - Status: active/deleted/flagged
    - Tracks: content, is_expert_reply
    - Timestamps: created_at, updated_at, deleted_at
  
  ### 4. Events Management
  - **events**: Workshops and webinars (announcements only)
    - Tracks: title, description, location
    - Event type: workshop/webinar/lecture/course
    - Status: upcoming/ongoing/completed/cancelled
    - Dates: event_date, registration_deadline
    - Metrics: max_participants, registered_count
    - Timestamps: created_at, updated_at
  
  - **event_registrations**: User event registrations
    - Links user to event
    - Status: registered/attended/cancelled
    - Timestamps: registered_at, cancelled_at
  
  ### 5. Analytics & Tracking
  - **analytics_snapshots**: Weekly platform analytics
    - Captures: total users, experts, content, discussions
    - Metrics: active users, growth rate, engagement rates
    - Period: snapshot_date, period_start, period_end
    - JSONB field for additional metrics
    - Timestamps: created_at
  
  ## Security Features
  - All tables have RLS enabled
  - Role-based access control via auth.uid() and user_metadata.role
  - Users can only access their own data
  - Experts can manage discussions and content
  - Admins have full access to all tables
  
  ## Data Integrity
  - Foreign key constraints ensure referential integrity
  - Unique constraints prevent duplicate entries
  - Check constraints validate data (e.g., ratings 1-5)
  - Timestamps track all changes
  - Status enums enforce valid states
  - Cascading deletes handle related data cleanup
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE (Regular platform users)
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  total_hours_spent NUMERIC(10, 2) DEFAULT 0 CHECK (total_hours_spent >= 0),
  engagement_rate NUMERIC(5, 2) DEFAULT 0 CHECK (engagement_rate >= 0 AND engagement_rate <= 100),
  content_engaged_count INTEGER DEFAULT 0 CHECK (content_engaged_count >= 0),
  discussions_participated INTEGER DEFAULT 0 CHECK (discussions_participated >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_active TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 2. EXPERTS TABLE (Content creators & moderators)
-- =====================================================

CREATE TABLE IF NOT EXISTS experts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  specialization TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  discussions_handled INTEGER DEFAULT 0 CHECK (discussions_handled >= 0),
  activity_hours NUMERIC(10, 2) DEFAULT 0 CHECK (activity_hours >= 0),
  engagement_rate NUMERIC(5, 2) DEFAULT 0 CHECK (engagement_rate >= 0 AND engagement_rate <= 100),
  rating NUMERIC(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 3. ADMINS TABLE (Platform administrators)
-- =====================================================

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  permissions JSONB DEFAULT '{"full_access": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 4. CONTENT TABLE (Articles, videos, ebooks)
-- =====================================================

CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'video', 'ebook')),
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  image_url TEXT,
  content_url TEXT,
  file_size BIGINT CHECK (file_size >= 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'archived')),
  views_count INTEGER DEFAULT 0 CHECK (views_count >= 0),
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
  created_by_expert_id UUID REFERENCES experts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- Create index for faster content queries
CREATE INDEX IF NOT EXISTS idx_content_type ON content(content_type);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_category ON content(category);
CREATE INDEX IF NOT EXISTS idx_content_created_by ON content(created_by_expert_id);

-- =====================================================
-- 5. CONTENT VIEWS (Track content views)
-- =====================================================

CREATE TABLE IF NOT EXISTS content_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_id)
);

CREATE INDEX IF NOT EXISTS idx_content_views_user ON content_views(user_id);
CREATE INDEX IF NOT EXISTS idx_content_views_content ON content_views(content_id);

-- =====================================================
-- 6. CONTENT LIKES (Track content likes)
-- =====================================================

CREATE TABLE IF NOT EXISTS content_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  liked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_id)
);

CREATE INDEX IF NOT EXISTS idx_content_likes_user ON content_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_content_likes_content ON content_likes(content_id);

-- =====================================================
-- 7. DISCUSSIONS (Forum topics)
-- =====================================================

CREATE TABLE IF NOT EXISTS discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  created_by_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  assigned_expert_id UUID REFERENCES experts(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  participants_count INTEGER DEFAULT 1 CHECK (participants_count >= 0),
  messages_count INTEGER DEFAULT 0 CHECK (messages_count >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_discussions_user ON discussions(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_expert ON discussions(assigned_expert_id);
CREATE INDEX IF NOT EXISTS idx_discussions_status ON discussions(status);

-- =====================================================
-- 8. DISCUSSION MESSAGES (Forum messages)
-- =====================================================

CREATE TABLE IF NOT EXISTS discussion_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  expert_id UUID REFERENCES experts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_expert_reply BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted', 'flagged')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CHECK (
    (user_id IS NOT NULL AND expert_id IS NULL AND is_expert_reply = false) OR
    (user_id IS NULL AND expert_id IS NOT NULL AND is_expert_reply = true)
  )
);

CREATE INDEX IF NOT EXISTS idx_messages_discussion ON discussion_messages(discussion_id);
CREATE INDEX IF NOT EXISTS idx_messages_user ON discussion_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_expert ON discussion_messages(expert_id);

-- =====================================================
-- 9. EVENTS (Workshops, webinars, etc.)
-- =====================================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('workshop', 'webinar', 'lecture', 'course')),
  location TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ,
  max_participants INTEGER CHECK (max_participants > 0),
  registered_count INTEGER DEFAULT 0 CHECK (registered_count >= 0),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  image_url TEXT,
  created_by_admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);

-- =====================================================
-- 10. EVENT REGISTRATIONS (User event signups)
-- =====================================================

CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  registered_at TIMESTAMPTZ DEFAULT now(),
  cancelled_at TIMESTAMPTZ,
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON event_registrations(user_id);

-- =====================================================
-- 11. ANALYTICS SNAPSHOTS (Weekly metrics)
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  snapshot_date DATE NOT NULL UNIQUE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_users INTEGER DEFAULT 0,
  total_experts INTEGER DEFAULT 0,
  total_content INTEGER DEFAULT 0,
  total_discussions INTEGER DEFAULT 0,
  active_users_count INTEGER DEFAULT 0,
  platform_growth_rate NUMERIC(5, 2) DEFAULT 0,
  content_engagement_rate NUMERIC(5, 2) DEFAULT 0,
  discussion_engagement_rate NUMERIC(5, 2) DEFAULT 0,
  additional_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_snapshots(snapshot_date);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get user role from auth metadata
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role')::text,
    'user'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is expert
CREATE OR REPLACE FUNCTION is_expert()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'expert';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is regular user
CREATE OR REPLACE FUNCTION is_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'user';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS POLICIES - USERS TABLE
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can insert users
CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Admins can update any user
CREATE POLICY "Admins can update any user"
  ON users FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can delete users
CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- RLS POLICIES - EXPERTS TABLE
-- =====================================================

-- Experts can view their own profile
CREATE POLICY "Experts can view own profile"
  ON experts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Experts can update their own profile
CREATE POLICY "Experts can update own profile"
  ON experts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Everyone can view active experts (for assignment)
CREATE POLICY "Anyone can view active experts"
  ON experts FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Admins can manage all experts
CREATE POLICY "Admins can insert experts"
  ON experts FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update any expert"
  ON experts FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete experts"
  ON experts FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- RLS POLICIES - ADMINS TABLE
-- =====================================================

-- Admins can view their own profile
CREATE POLICY "Admins can view own profile"
  ON admins FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Admins can update their own profile
CREATE POLICY "Admins can update own profile"
  ON admins FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Only admins can manage other admins
CREATE POLICY "Admins can insert other admins"
  ON admins FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update any admin"
  ON admins FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete admins"
  ON admins FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- RLS POLICIES - CONTENT TABLE
-- =====================================================

-- Everyone can view published content
CREATE POLICY "Anyone can view published content"
  ON content FOR SELECT
  TO authenticated
  USING (status = 'published' OR is_admin() OR is_expert());

-- Experts can create content
CREATE POLICY "Experts can create content"
  ON content FOR INSERT
  TO authenticated
  WITH CHECK (is_expert() OR is_admin());

-- Experts can update their own content
CREATE POLICY "Experts can update own content"
  ON content FOR UPDATE
  TO authenticated
  USING (
    created_by_expert_id IN (
      SELECT id FROM experts WHERE user_id = auth.uid()
    ) OR is_admin()
  )
  WITH CHECK (
    created_by_expert_id IN (
      SELECT id FROM experts WHERE user_id = auth.uid()
    ) OR is_admin()
  );

-- Experts and admins can delete content
CREATE POLICY "Experts can delete own content"
  ON content FOR DELETE
  TO authenticated
  USING (
    created_by_expert_id IN (
      SELECT id FROM experts WHERE user_id = auth.uid()
    ) OR is_admin()
  );

-- =====================================================
-- RLS POLICIES - CONTENT VIEWS
-- =====================================================

-- Users can view their own views
CREATE POLICY "Users can view own content views"
  ON content_views FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Users can insert their own views
CREATE POLICY "Users can track their own views"
  ON content_views FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins can view all views
CREATE POLICY "Admins can view all content views"
  ON content_views FOR SELECT
  TO authenticated
  USING (is_admin());

-- =====================================================
-- RLS POLICIES - CONTENT LIKES
-- =====================================================

-- Users can view their own likes
CREATE POLICY "Users can view own likes"
  ON content_likes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Users can insert their own likes
CREATE POLICY "Users can like content"
  ON content_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own likes (unlike)
CREATE POLICY "Users can unlike content"
  ON content_likes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all likes
CREATE POLICY "Admins can view all likes"
  ON content_likes FOR SELECT
  TO authenticated
  USING (is_admin());

-- =====================================================
-- RLS POLICIES - DISCUSSIONS
-- =====================================================

-- Everyone can view active discussions
CREATE POLICY "Anyone can view active discussions"
  ON discussions FOR SELECT
  TO authenticated
  USING (status = 'active' OR is_admin() OR is_expert());

-- Users can create discussions
CREATE POLICY "Users can create discussions"
  ON discussions FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by_user_id IN (
      SELECT user_id FROM users WHERE user_id = auth.uid()
    )
  );

-- Users can update their own discussions
CREATE POLICY "Users can update own discussions"
  ON discussions FOR UPDATE
  TO authenticated
  USING (created_by_user_id = auth.uid())
  WITH CHECK (created_by_user_id = auth.uid());

-- Experts can update assigned discussions
CREATE POLICY "Experts can update assigned discussions"
  ON discussions FOR UPDATE
  TO authenticated
  USING (
    assigned_expert_id IN (
      SELECT id FROM experts WHERE user_id = auth.uid()
    ) OR is_admin()
  )
  WITH CHECK (
    assigned_expert_id IN (
      SELECT id FROM experts WHERE user_id = auth.uid()
    ) OR is_admin()
  );

-- Admins can delete discussions
CREATE POLICY "Admins can delete discussions"
  ON discussions FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- RLS POLICIES - DISCUSSION MESSAGES
-- =====================================================

-- Users can view messages in discussions
CREATE POLICY "Users can view discussion messages"
  ON discussion_messages FOR SELECT
  TO authenticated
  USING (status = 'active' OR is_admin() OR is_expert());

-- Users can create their own messages
CREATE POLICY "Users can create messages"
  ON discussion_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    (user_id = auth.uid() AND expert_id IS NULL AND is_expert_reply = false) OR
    (expert_id IN (SELECT id FROM experts WHERE user_id = auth.uid()) AND user_id IS NULL AND is_expert_reply = true) OR
    is_admin()
  );

-- Users can update their own messages
CREATE POLICY "Users can update own messages"
  ON discussion_messages FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- Experts can update their own messages
CREATE POLICY "Experts can update own messages"
  ON discussion_messages FOR UPDATE
  TO authenticated
  USING (
    expert_id IN (
      SELECT id FROM experts WHERE user_id = auth.uid()
    ) OR is_admin()
  )
  WITH CHECK (
    expert_id IN (
      SELECT id FROM experts WHERE user_id = auth.uid()
    ) OR is_admin()
  );

-- Experts and admins can delete messages
CREATE POLICY "Experts can delete messages in their discussions"
  ON discussion_messages FOR DELETE
  TO authenticated
  USING (
    discussion_id IN (
      SELECT id FROM discussions WHERE assigned_expert_id IN (
        SELECT id FROM experts WHERE user_id = auth.uid()
      )
    ) OR is_admin()
  );

-- =====================================================
-- RLS POLICIES - EVENTS
-- =====================================================

-- Everyone can view upcoming and ongoing events
CREATE POLICY "Anyone can view active events"
  ON events FOR SELECT
  TO authenticated
  USING (status IN ('upcoming', 'ongoing') OR is_admin());

-- Admins can create events
CREATE POLICY "Admins can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Admins can update events
CREATE POLICY "Admins can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can delete events
CREATE POLICY "Admins can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- RLS POLICIES - EVENT REGISTRATIONS
-- =====================================================

-- Users can view their own registrations
CREATE POLICY "Users can view own registrations"
  ON event_registrations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Users can register for events
CREATE POLICY "Users can register for events"
  ON event_registrations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can cancel their own registrations
CREATE POLICY "Users can cancel own registrations"
  ON event_registrations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their registrations
CREATE POLICY "Users can delete own registrations"
  ON event_registrations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all registrations
CREATE POLICY "Admins can view all registrations"
  ON event_registrations FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can manage all registrations
CREATE POLICY "Admins can manage all registrations"
  ON event_registrations FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- RLS POLICIES - ANALYTICS SNAPSHOTS
-- =====================================================

-- Only admins can view analytics
CREATE POLICY "Admins can view analytics"
  ON analytics_snapshots FOR SELECT
  TO authenticated
  USING (is_admin());

-- Only admins can create analytics
CREATE POLICY "Admins can create analytics"
  ON analytics_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Only admins can update analytics
CREATE POLICY "Admins can update analytics"
  ON analytics_snapshots FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experts_updated_at BEFORE UPDATE ON experts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussions_updated_at BEFORE UPDATE ON discussions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussion_messages_updated_at BEFORE UPDATE ON discussion_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGERS FOR AUTOMATIC COUNTS
-- =====================================================

-- Update content views count
CREATE OR REPLACE FUNCTION increment_content_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE content
  SET views_count = views_count + 1
  WHERE id = NEW.content_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_content_views
  AFTER INSERT ON content_views
  FOR EACH ROW EXECUTE FUNCTION increment_content_views();

-- Update content likes count
CREATE OR REPLACE FUNCTION update_content_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE content
    SET likes_count = likes_count + 1
    WHERE id = NEW.content_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE content
    SET likes_count = likes_count - 1
    WHERE id = OLD.content_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_content_likes_count
  AFTER INSERT OR DELETE ON content_likes
  FOR EACH ROW EXECUTE FUNCTION update_content_likes_count();

-- Update discussion messages count
CREATE OR REPLACE FUNCTION update_discussion_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE discussions
    SET messages_count = messages_count + 1,
        updated_at = now()
    WHERE id = NEW.discussion_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE discussions
    SET messages_count = messages_count - 1,
        updated_at = now()
    WHERE id = OLD.discussion_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_discussion_message_count
  AFTER INSERT OR DELETE ON discussion_messages
  FOR EACH ROW EXECUTE FUNCTION update_discussion_message_count();

-- Update event registrations count
CREATE OR REPLACE FUNCTION update_event_registration_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events
    SET registered_count = registered_count + 1
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events
    SET registered_count = registered_count - 1
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_event_registration_count
  AFTER INSERT OR DELETE ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION update_event_registration_count();