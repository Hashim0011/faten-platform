-- =====================================================
-- SETUP ADMIN AND EXPERT ACCOUNTS
-- =====================================================
-- Run this SQL in your Supabase SQL Editor to create
-- the default admin and expert accounts
-- =====================================================

-- CREATE ADMIN ACCOUNT
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Check if admin account already exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@example.com';

  IF admin_user_id IS NULL THEN
    -- Create admin user
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

    -- Create admin profile
    INSERT INTO admins (
      user_id,
      full_name,
      email,
      status,
      permissions
    ) VALUES (
      admin_user_id,
      'Platform Admin',
      'admin@example.com',
      'active',
      '{"full_access": true}'::jsonb
    );

    RAISE NOTICE 'Admin created: admin@example.com / Admin@123';
  ELSE
    RAISE NOTICE 'Admin already exists: admin@example.com / Admin@123';
  END IF;
END $$;

-- CREATE EXPERT ACCOUNT
DO $$
DECLARE
  expert_user_id UUID;
BEGIN
  -- Check if expert account already exists
  SELECT id INTO expert_user_id
  FROM auth.users
  WHERE email = 'expert@example.com';

  IF expert_user_id IS NULL THEN
    -- Create expert user
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

    -- Create expert profile
    INSERT INTO experts (
      user_id,
      full_name,
      email,
      specialization,
      status,
      bio
    ) VALUES (
      expert_user_id,
      'Platform Expert',
      'expert@example.com',
      'Intellectual Security',
      'active',
      'Platform expert account'
    );

    RAISE NOTICE 'Expert created: expert@example.com / Expert@123';
  ELSE
    RAISE NOTICE 'Expert already exists: expert@example.com / Expert@123';
  END IF;
END $$;
