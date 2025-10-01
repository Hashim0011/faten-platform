/*
  # Fix Authentication System with Proper Role Separation

  1. Database Structure
    - Three separate tables: users, experts, admins
    - All linked to auth.users via user_id
    - Proper UNIQUE constraints for ON CONFLICT operations

  2. Authentication Rules
    - Users: Can sign up and login (role: "user")
    - Experts: Login only, manually created (role: "expert")
    - Admins: Login only, manually created (role: "admin")

  3. Security
    - Role-based RLS policies
    - Proper constraints for data integrity
    - Pre-created test accounts with verified emails
*/

-- First, ensure we have proper UNIQUE constraints for ON CONFLICT operations

-- Add UNIQUE constraint to users.user_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_user_id_key' 
    AND table_name = 'users'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Add UNIQUE constraint to experts.user_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'experts_user_id_key' 
    AND table_name = 'experts'
  ) THEN
    ALTER TABLE experts ADD CONSTRAINT experts_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Create admins table if it doesn't exist
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  permissions jsonb DEFAULT '{"full_access": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admins
DROP POLICY IF EXISTS "Admins can manage all data" ON admins;
CREATE POLICY "Admins can manage all data"
  ON admins
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.user_metadata->>'role')::text = 'admin'
    )
  );

-- Update RLS policies for users table
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Update RLS policies for experts table
DROP POLICY IF EXISTS "Experts can read own data" ON experts;
DROP POLICY IF EXISTS "Experts can update own data" ON experts;
DROP POLICY IF EXISTS "Anyone can read verified experts" ON experts;

CREATE POLICY "Experts can read own data"
  ON experts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Experts can update own data"
  ON experts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can read verified experts"
  ON experts
  FOR SELECT
  TO authenticated
  USING (verified = true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Only create user record for accounts with 'user' role or no role specified
  IF (NEW.user_metadata->>'role' IS NULL OR NEW.user_metadata->>'role' = 'user') THEN
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
      COALESCE(NEW.user_metadata->>'full_name', NEW.email),
      NEW.user_metadata->>'phone',
      'student',
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

-- Now create the pre-verified accounts with proper error handling

-- Create admin account
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Insert into auth.users with proper metadata
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    user_metadata,
    raw_user_meta_data,
    confirmation_token,
    email_change_token_new,
    recovery_token
  ) VALUES (
    gen_random_uuid(),
    'admin@faten.com',
    crypt('Admin123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"role": "admin", "full_name": "مدير النظام"}'::jsonb,
    '{"role": "admin", "full_name": "مدير النظام"}'::jsonb,
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = COALESCE(users.email_confirmed_at, now()),
    user_metadata = EXCLUDED.user_metadata,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = now()
  RETURNING id INTO admin_user_id;

  -- Get the user ID if it was updated instead of inserted
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@faten.com';
  END IF;

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
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    permissions = EXCLUDED.permissions,
    updated_at = now();
END $$;

-- Create expert account
DO $$
DECLARE
  expert_user_id uuid;
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    user_metadata,
    raw_user_meta_data,
    confirmation_token,
    email_change_token_new,
    recovery_token
  ) VALUES (
    gen_random_uuid(),
    'expert@faten.com',
    crypt('Expert123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"role": "expert", "full_name": "د. أحمد السالم"}'::jsonb,
    '{"role": "expert", "full_name": "د. أحمد السالم"}'::jsonb,
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = COALESCE(users.email_confirmed_at, now()),
    user_metadata = EXCLUDED.user_metadata,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = now()
  RETURNING id INTO expert_user_id;

  -- Get the user ID if it was updated instead of inserted
  IF expert_user_id IS NULL THEN
    SELECT id INTO expert_user_id FROM auth.users WHERE email = 'expert@faten.com';
  END IF;

  -- Insert into experts table
  INSERT INTO experts (
    user_id,
    specialization,
    bio,
    rating,
    verified
  ) VALUES (
    expert_user_id,
    'الأمن الفكري',
    'خبير متخصص في مجال الأمن الفكري والتربية الإسلامية',
    4.8,
    true
  )
  ON CONFLICT (user_id) DO UPDATE SET
    specialization = EXCLUDED.specialization,
    bio = EXCLUDED.bio,
    rating = EXCLUDED.rating,
    verified = EXCLUDED.verified,
    updated_at = now();
END $$;