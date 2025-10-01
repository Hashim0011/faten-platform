/*
  # Fix User Registration RLS Policies

  1. Security Updates
    - Add policy for users to insert their own data during registration
    - Update existing policies to work correctly with auth.uid()
    - Ensure proper permissions for user registration flow

  2. Changes Made
    - Add "Users can insert own data" policy for INSERT operations
    - Update existing policies to be more permissive for user's own data
    - Fix policy conditions to work with Supabase Auth
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create new policies that work correctly with registration
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Keep admin policy as is
-- The admin policy should already exist and work correctly

-- Also disable email confirmation for development (optional)
-- This can be done in Supabase dashboard under Authentication > Settings
-- Set "Enable email confirmations" to OFF for development