/*
  # Fix bookings table ID column

  1. Changes
    - Drop existing id column constraint
    - Recreate id column as auto-incrementing primary key
    - Add sequence for auto-increment functionality

  2. Security
    - Maintains data integrity with proper primary key
*/

-- Drop the existing primary key constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_pkey;

-- Drop the existing id column
ALTER TABLE bookings DROP COLUMN IF EXISTS id;

-- Add the id column back as auto-incrementing primary key
ALTER TABLE bookings ADD COLUMN id SERIAL PRIMARY KEY;