/*
  # Fix Authentication System with Role Separation

  1. Database Structure
    - Three separate tables: users, experts, admins
    - All linked to auth.users via user_id (auth.uid())
    - Proper UNIQUE constraints for ON CONFLICT operations

  2. Authentication Rules
    - Users: Can sign up and login → role: "user"
    - Experts: Login only, manually created → role: "expert"
    - Admins: Login only, manually created → role: "admin"

  3. Security
    - Role-based RLS policies
    - Proper constraints and indexes
    - Pre-created verified accounts for testing
*/

-- First, ensure we have proper UNIQUE constraints
DO $$
BEGIN
  -- Add UNIQUE constraint on users.user_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_user_id_key' 
    AND table_name = 'users'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_user_id_key UNIQUE (user_id);
  END IF;

  -- Add UNIQUE constraint on experts.user_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'experts_user_id_key' 
    AND table_name = 'experts'
  ) THEN
    ALTER TABLE experts ADD CONSTRAINT experts_user_id_key UNIQUE (user_id);
  END IF;

  -- Add UNIQUE constraint on users.email if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_email_key' 
    AND table_name = 'users'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
  END IF;
END $$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create user record for accounts with 'user' role
  IF (NEW.raw_user_meta_data->>'role') = 'user' OR (NEW.raw_user_meta_data->>'role') IS NULL THEN
    INSERT INTO users (
      user_id,
      email,
      full_name,
      phone,
      role,
      status
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      'student', -- Default role for normal users
      'active'
    )
    ON CONFLICT (user_id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, users.full_name),
      phone = COALESCE(EXCLUDED.phone, users.phone),
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create pre-verified admin account
DO $$
DECLARE
  admin_user_id uuid;
  expert_user_id uuid;
BEGIN
  -- Create admin account in auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'admin@faten.com',
    crypt('Admin123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "admin", "full_name": "مدير النظام"}',
    false,
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (email) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = now(),
    updated_at = now(),
    raw_user_meta_data = EXCLUDED.raw_user_meta_data
  RETURNING id INTO admin_user_id;

  -- Get the admin user ID if it already exists
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@faten.com';
  END IF;

  -- Create admin record in users table (admins are also in users table with admin role)
  INSERT INTO users (
    user_id,
    email,
    full_name,
    role,
    status
  ) VALUES (
    admin_user_id,
    'admin@faten.com',
    'مدير النظام',
    'other', -- Admin role in users table
    'active'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = now();

  -- Create expert account in auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'expert@faten.com',
    crypt('Expert123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "expert", "full_name": "د. أحمد السالم"}',
    false,
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (email) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = now(),
    updated_at = now(),
    raw_user_meta_data = EXCLUDED.raw_user_meta_data
  RETURNING id INTO expert_user_id;

  -- Get the expert user ID if it already exists
  IF expert_user_id IS NULL THEN
    SELECT id INTO expert_user_id FROM auth.users WHERE email = 'expert@faten.com';
  END IF;

  -- Create expert record in experts table
  INSERT INTO experts (
    user_id,
    specialization,
    bio,
    verified
  ) VALUES (
    expert_user_id,
    'الأمن الفكري',
    'خبير متخصص في مجال الأمن الفكري والتربية الإسلامية',
    true
  )
  ON CONFLICT (user_id) DO UPDATE SET
    specialization = EXCLUDED.specialization,
    bio = EXCLUDED.bio,
    verified = EXCLUDED.verified,
    updated_at = now();

END $$;

-- Update RLS policies for proper role-based access

-- Users table policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Admin can manage all users" ON users;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role') = 'admin'
    )
  );

-- Experts table policies
DROP POLICY IF EXISTS "Experts can read own data" ON experts;
DROP POLICY IF EXISTS "Experts can update own data" ON experts;
DROP POLICY IF EXISTS "Anyone can read verified experts" ON experts;
DROP POLICY IF EXISTS "Admins can manage all experts" ON experts;

CREATE POLICY "Experts can read own data"
  ON experts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Experts can update own data"
  ON experts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read verified experts"
  ON experts FOR SELECT
  TO authenticated
  USING (verified = true);

CREATE POLICY "Admins can manage all experts"
  ON experts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role') = 'admin'
    )
  );

-- Content table policies
DROP POLICY IF EXISTS "Anyone can read published content" ON content;
DROP POLICY IF EXISTS "Experts can create content" ON content;
DROP POLICY IF EXISTS "Experts can update own content" ON content;
DROP POLICY IF EXISTS "Admins can manage all content" ON content;

CREATE POLICY "Anyone can read published content"
  ON content FOR SELECT
  TO authenticated
  USING (status = 'published');

CREATE POLICY "Experts can create content"
  ON content FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM experts 
      WHERE experts.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role') = 'admin'
    )
  );

CREATE POLICY "Experts can update own content"
  ON content FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role') = 'admin'
    )
  );

CREATE POLICY "Admins can manage all content"
  ON content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role') = 'admin'
    )
  );