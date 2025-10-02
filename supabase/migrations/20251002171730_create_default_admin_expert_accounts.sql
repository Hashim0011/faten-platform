/*
  # Create Default Admin and Expert Accounts
  
  ## Overview
  This migration creates two default accounts for testing and initial platform access:
  
  1. Admin Account:
     - Email: admin@example.com
     - Password: Admin@123
     - Role: admin (set in user_metadata)
  
  2. Expert Account:
     - Email: expert@example.com
     - Password: Expert@123
     - Role: expert (set in user_metadata)
  
  ## Security Notes
  - These are default test accounts and should be changed in production
  - Passwords are set during account creation
  - Roles are stored in auth.users.raw_user_meta_data
  - Email confirmation is bypassed for these accounts
  
  ## Tables Affected
  - auth.users (Supabase Auth users)
  - admins (Admin profile)
  - experts (Expert profile)
*/

-- =====================================================
-- CREATE ADMIN ACCOUNT
-- =====================================================

DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Check if admin account already exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@example.com';

  -- Only create if doesn't exist
  IF admin_user_id IS NULL THEN
    -- Create admin user in auth.users
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

    -- Create admin profile in admins table
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
      '{"full_access": true, "manage_users": true, "manage_experts": true, "manage_content": true, "manage_events": true, "view_analytics": true}'::jsonb
    );

    RAISE NOTICE 'Admin account created successfully with email: admin@example.com';
  ELSE
    RAISE NOTICE 'Admin account already exists with email: admin@example.com';
  END IF;
END $$;

-- =====================================================
-- CREATE EXPERT ACCOUNT
-- =====================================================

DO $$
DECLARE
  expert_user_id UUID;
BEGIN
  -- Check if expert account already exists
  SELECT id INTO expert_user_id
  FROM auth.users
  WHERE email = 'expert@example.com';

  -- Only create if doesn't exist
  IF expert_user_id IS NULL THEN
    -- Create expert user in auth.users
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

    -- Create expert profile in experts table
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
      'Default expert account for platform testing and initial setup.'
    );

    RAISE NOTICE 'Expert account created successfully with email: expert@example.com';
  ELSE
    RAISE NOTICE 'Expert account already exists with email: expert@example.com';
  END IF;
END $$;