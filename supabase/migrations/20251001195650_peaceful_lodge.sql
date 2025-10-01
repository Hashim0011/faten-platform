/*
  # Fix RLS infinite recursion and user registration policies

  1. Policy Issues Fixed
    - Remove circular dependencies in RLS policies
    - Fix infinite recursion in user role checking
    - Allow proper user registration and data insertion

  2. Security Updates
    - Simple, non-recursive policies for user data access
    - Proper INSERT policy for new user registration
    - Admin access policies without recursion

  3. Changes Made
    - Drop all existing problematic policies
    - Create new, simplified policies
    - Ensure auth.uid() works correctly without recursion
*/

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;

-- Create simple, non-recursive policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin policy without recursion - check email directly
CREATE POLICY "Admin can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@faten.com'
    )
  );

CREATE POLICY "Admin can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@faten.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@faten.com'
    )
  );