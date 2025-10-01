/*
  # Fix Authentication System with Role Separation

  1. Database Structure
    - Keep separate tables: users, experts, admins
    - All linked to auth.users via auth.uid()
    - Use auth.users.user_metadata.role for role management

  2. Authentication Rules
    - Users: Can sign up and login (role: "user")
    - Experts: Login only, manually created (role: "expert") 
    - Admins: Login only, manually created (role: "admin")

  3. RLS Policies
    - Users: Can only see/edit their own data
    - Experts: Can manage discussions and content
    - Admins: Full access to everything

  4. Pre-created Accounts
    - Create admin account: admin@faten.com / Admin123!
    - Create expert account: expert@faten.com / Expert123!
*/

-- First, let's create the admins table if it doesn't exist
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  permissions jsonb DEFAULT '{"full_access": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Update users table to ensure proper structure
ALTER TABLE users DROP COLUMN IF EXISTS role CASCADE;
ALTER TABLE users DROP COLUMN IF EXISTS status CASCADE;

-- Add status back with proper enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status_new') THEN
    CREATE TYPE user_status_new AS ENUM ('active', 'suspended', 'deleted');
  END IF;
END $$;

ALTER TABLE users ADD COLUMN IF NOT EXISTS status user_status_new DEFAULT 'active';

-- Update experts table structure
ALTER TABLE experts DROP COLUMN IF EXISTS verified CASCADE;
ALTER TABLE experts ADD COLUMN IF NOT EXISTS status user_status_new DEFAULT 'active';
ALTER TABLE experts ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '{"manage_discussions": true, "manage_content": true}'::jsonb;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_experts_user_id ON experts(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Admin can manage all users" ON users;
DROP POLICY IF EXISTS "Admin can read all users" ON users;

DROP POLICY IF EXISTS "Experts can read own data" ON experts;
DROP POLICY IF EXISTS "Experts can update own data" ON experts;
DROP POLICY IF EXISTS "Anyone can read verified experts" ON experts;
DROP POLICY IF EXISTS "Admins can manage all experts" ON experts;

-- Create new RLS policies for users table
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

CREATE POLICY "Admins can manage all users"
  ON users FOR ALL
  TO authenticated
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

-- Create RLS policies for experts table
CREATE POLICY "Experts can read own data"
  ON experts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Experts can update own data"
  ON experts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read active experts"
  ON experts FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Admins can manage all experts"
  ON experts FOR ALL
  TO authenticated
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

-- Create RLS policies for admins table
CREATE POLICY "Admins can read own data"
  ON admins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update own data"
  ON admins FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admin can manage all admins"
  ON admins FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND email = 'admin@faten.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND email = 'admin@faten.com'
    )
  );

-- Update content policies to work with new structure
DROP POLICY IF EXISTS "Admins can manage all content" ON content;
DROP POLICY IF EXISTS "Experts can create content" ON content;
DROP POLICY IF EXISTS "Experts can update own content" ON content;

CREATE POLICY "Admins can manage all content"
  ON content FOR ALL
  TO authenticated
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

CREATE POLICY "Experts can create content"
  ON content FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM experts 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Experts can update own content"
  ON content FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM experts 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  )
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM experts 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Function to get user role from auth metadata
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  -- Check if user is admin
  IF EXISTS (SELECT 1 FROM admins WHERE admins.user_id = get_user_role.user_id) THEN
    RETURN 'admin';
  END IF;
  
  -- Check if user is expert
  IF EXISTS (SELECT 1 FROM experts WHERE experts.user_id = get_user_role.user_id) THEN
    RETURN 'expert';
  END IF;
  
  -- Check if user is regular user
  IF EXISTS (SELECT 1 FROM users WHERE users.user_id = get_user_role.user_id) THEN
    RETURN 'user';
  END IF;
  
  -- Default fallback
  RETURN 'user';
END;
$$;

-- Function to handle new user registration (only for regular users)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only create user record if role is 'user' or not specified
  IF (NEW.raw_user_meta_data->>'role' IS NULL OR NEW.raw_user_meta_data->>'role' = 'user') THEN
    INSERT INTO users (
      user_id,
      email,
      full_name,
      phone,
      status
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      'active'
    );
    
    -- Update user metadata to ensure role is set
    UPDATE auth.users 
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "user"}'::jsonb
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Now let's create the pre-configured accounts
DO $$
DECLARE
  admin_user_id uuid;
  expert_user_id uuid;
  admin_exists boolean;
  expert_exists boolean;
BEGIN
  -- Check if admin already exists
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin@faten.com') INTO admin_exists;
  
  -- Create admin account if it doesn't exist
  IF NOT admin_exists THEN
    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data,
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
      '{"role": "admin", "full_name": "مدير النظام"}'::jsonb,
      'authenticated',
      'authenticated'
    ) RETURNING id INTO admin_user_id;
    
    -- Insert into admins table
    INSERT INTO admins (
      user_id,
      full_name,
      email,
      permissions
    ) VALUES (
      admin_user_id,
      'مدير النظام',
      'admin@faten.com',
      '{"full_access": true, "manage_users": true, "manage_experts": true, "manage_content": true}'::jsonb
    );
    
    RAISE NOTICE 'Admin account created successfully';
  ELSE
    RAISE NOTICE 'Admin account already exists';
  END IF;
  
  -- Check if expert already exists
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'expert@faten.com') INTO expert_exists;
  
  -- Create expert account if it doesn't exist
  IF NOT expert_exists THEN
    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data,
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
      '{"role": "expert", "full_name": "د. أحمد السالم"}'::jsonb,
      'authenticated',
      'authenticated'
    ) RETURNING id INTO expert_user_id;
    
    -- Insert into experts table
    INSERT INTO experts (
      user_id,
      specialization,
      bio,
      rating,
      status,
      permissions
    ) VALUES (
      expert_user_id,
      'الأمن الفكري',
      'خبير في مجال الأمن الفكري والتربية الإسلامية',
      4.8,
      'active',
      '{"manage_discussions": true, "manage_content": true, "create_events": true}'::jsonb
    );
    
    RAISE NOTICE 'Expert account created successfully';
  ELSE
    RAISE NOTICE 'Expert account already exists';
  END IF;
END $$;