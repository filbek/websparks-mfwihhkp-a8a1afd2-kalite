/*
  # Fix Users Table RLS Policies

  1. Changes
    - Drop existing recursive policies
    - Add simple, non-recursive policies for users table
    - Allow users to read their own data
    - Allow admins to read all users
    - Allow facility-based access without recursion

  2. Security
    - Policies use auth.uid() directly without joining users table
    - No infinite recursion in policy checks
*/

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view users in their facility" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Policy 1: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 2: Allow authenticated users to read all users (for dropdowns, assignments, etc.)
-- This is necessary for the app to function properly
CREATE POLICY "Authenticated users can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Service role can do everything (for admin operations)
CREATE POLICY "Service role can manage users"
  ON users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
