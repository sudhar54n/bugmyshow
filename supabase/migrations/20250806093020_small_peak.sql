/*
  # Add user_id column to users table

  1. Changes
    - Add `user_id` column to `users` table as unique integer
    - Set default starting value to 101 for new users
    - Update existing users with sequential user_id values starting from 101
    - Add unique constraint on user_id column

  2. Notes
    - Admin user will get user_id = 100
    - Regular users start from 101
    - Ensures all users have unique numeric identifiers
*/

-- Add user_id column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE users ADD COLUMN user_id integer;
  END IF;
END $$;

-- Update existing admin user to have user_id = 100
UPDATE users 
SET user_id = 100 
WHERE username = 'admin' AND user_id IS NULL;

-- Update other existing users with sequential user_id starting from 101
DO $$
DECLARE
  user_record RECORD;
  current_id integer := 101;
BEGIN
  FOR user_record IN 
    SELECT id FROM users 
    WHERE user_id IS NULL 
    ORDER BY id
  LOOP
    UPDATE users 
    SET user_id = current_id 
    WHERE id = user_record.id;
    current_id := current_id + 1;
  END LOOP;
END $$;

-- Make user_id NOT NULL after updating existing records
ALTER TABLE users ALTER COLUMN user_id SET NOT NULL;

-- Add unique constraint on user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'users' AND constraint_name = 'users_user_id_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_user_id_key UNIQUE (user_id);
  END IF;
END $$;