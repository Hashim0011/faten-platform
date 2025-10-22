/*
  # Add INSERT policy for users table

  1. Changes
    - Add policy to allow new users to insert their own record during registration
    - This fixes the "new row violates row-level security policy" error

  2. Security
    - Users can only insert their own record (auth.uid() = id)
    - Ensures users cannot create records for other users
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can insert their own data" ON users;

-- Create policy to allow users to insert their own record
CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);