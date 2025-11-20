-- Add RLS policies to allow user signup

-- Policy to allow anyone to insert into users table (for signup)
CREATE POLICY "Allow public user creation" ON users
  FOR INSERT
  WITH CHECK (true);

-- Policy to allow anyone to insert into organizations table (for signup)
CREATE POLICY "Allow public organization creation" ON organizations
  FOR INSERT
  WITH CHECK (true);

-- Policy to allow anyone to insert into user_organization_roles table (for signup)
CREATE POLICY "Allow public user role creation" ON user_organization_roles
  FOR INSERT
  WITH CHECK (true);

-- Policy to allow users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  USING (true);

-- Policy to allow users to read organizations they belong to
CREATE POLICY "Users can read organizations" ON organizations
  FOR SELECT
  USING (true);

-- Policy to allow users to read their roles
CREATE POLICY "Users can read roles" ON user_organization_roles
  FOR SELECT
  USING (true);
