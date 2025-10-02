-- =====================================================
-- CREATE UNIFIED PROFILES TABLE
-- =====================================================
-- Run this in Supabase SQL Editor
-- This replaces the separate admins/experts/users tables
-- with a single profiles table
-- =====================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'expert', 'user')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  avatar_url TEXT,
  bio TEXT,
  specialization TEXT,
  permissions JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS profiles_status_idx ON profiles(status);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation on signup" ON profiles;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Users can update their own profile (cannot change role or status)
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM profiles WHERE id = auth.uid()) AND
    status = (SELECT status FROM profiles WHERE id = auth.uid())
  );

-- Policy: Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- Policy: Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- Policy: Allow profile creation on signup
CREATE POLICY "Allow profile creation on signup"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS profiles_updated_at_trigger ON profiles;
CREATE TRIGGER profiles_updated_at_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- =====================================================
-- MIGRATE EXISTING DATA
-- =====================================================

-- Migrate from admins table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admins') THEN
    INSERT INTO profiles (id, email, full_name, role, status, permissions, created_at)
    SELECT
      user_id as id,
      email,
      full_name,
      'admin' as role,
      status,
      permissions,
      created_at
    FROM admins
    WHERE user_id IS NOT NULL
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      permissions = EXCLUDED.permissions;

    RAISE NOTICE 'Migrated data from admins table';
  END IF;
END $$;

-- Migrate from experts table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'experts') THEN
    INSERT INTO profiles (id, email, full_name, role, status, bio, specialization, created_at)
    SELECT
      user_id as id,
      email,
      full_name,
      'expert' as role,
      status,
      bio,
      specialization,
      created_at
    FROM experts
    WHERE user_id IS NOT NULL
    ON CONFLICT (id) DO UPDATE SET
      role = 'expert',
      bio = EXCLUDED.bio,
      specialization = EXCLUDED.specialization;

    RAISE NOTICE 'Migrated data from experts table';
  END IF;
END $$;

-- Migrate from users table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    INSERT INTO profiles (id, email, full_name, role, status, created_at)
    SELECT
      user_id as id,
      email,
      full_name,
      'user' as role,
      status,
      created_at
    FROM users
    WHERE user_id IS NOT NULL
    ON CONFLICT (id) DO UPDATE SET
      role = COALESCE(profiles.role, 'user');

    RAISE NOTICE 'Migrated data from users table';
  END IF;
END $$;

-- =====================================================
-- CREATE DEFAULT ACCOUNTS
-- =====================================================

-- Create admin account (if not exists)
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Check if admin exists in auth.users
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@example.com';

  IF admin_user_id IS NULL THEN
    -- Create admin in auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      raw_app_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token,
      aud,
      role
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'admin@example.com',
      crypt('Admin@123', gen_salt('bf')),
      now(),
      jsonb_build_object('role', 'admin', 'full_name', 'Platform Admin'),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
      now(),
      now(),
      '',
      '',
      '',
      '',
      'authenticated',
      'authenticated'
    )
    RETURNING id INTO admin_user_id;
  END IF;

  -- Create or update profile
  INSERT INTO profiles (id, email, full_name, role, status, permissions)
  VALUES (
    admin_user_id,
    'admin@example.com',
    'Platform Admin',
    'admin',
    'active',
    '{"full_access": true}'::jsonb
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    status = 'active',
    permissions = '{"full_access": true}'::jsonb;

  RAISE NOTICE 'Admin account ready: admin@example.com / Admin@123';
END $$;

-- Create expert account (if not exists)
DO $$
DECLARE
  expert_user_id UUID;
BEGIN
  -- Check if expert exists in auth.users
  SELECT id INTO expert_user_id
  FROM auth.users
  WHERE email = 'expert@example.com';

  IF expert_user_id IS NULL THEN
    -- Create expert in auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      raw_app_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token,
      aud,
      role
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'expert@example.com',
      crypt('Expert@123', gen_salt('bf')),
      now(),
      jsonb_build_object('role', 'expert', 'full_name', 'Platform Expert'),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
      now(),
      now(),
      '',
      '',
      '',
      '',
      'authenticated',
      'authenticated'
    )
    RETURNING id INTO expert_user_id;
  END IF;

  -- Create or update profile
  INSERT INTO profiles (id, email, full_name, role, status, specialization, bio)
  VALUES (
    expert_user_id,
    'expert@example.com',
    'Platform Expert',
    'expert',
    'active',
    'Intellectual Security',
    'Platform expert account'
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'expert',
    status = 'active',
    specialization = 'Intellectual Security';

  RAISE NOTICE 'Expert account ready: expert@example.com / Expert@123';
END $$;

-- =====================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =====================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Profiles table created successfully!';
  RAISE NOTICE '✅ RLS policies enabled';
  RAISE NOTICE '✅ Existing data migrated';
  RAISE NOTICE '✅ Default accounts created';
  RAISE NOTICE '';
  RAISE NOTICE 'Test accounts:';
  RAISE NOTICE '  Admin: admin@example.com / Admin@123';
  RAISE NOTICE '  Expert: expert@example.com / Expert@123';
END $$;
