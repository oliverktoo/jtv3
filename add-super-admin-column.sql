-- Add is_super_admin column to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- Update oliverkiptook@gmail.com to super admin
UPDATE users 
SET is_super_admin = true 
WHERE email = 'oliverkiptook@gmail.com';

-- Verify the update
SELECT id, email, first_name, last_name, is_super_admin, created_at
FROM users
WHERE email = 'oliverkiptook@gmail.com';
