/*
  # Add seats column to bookings table

  1. Changes
    - Add `seats` column to `bookings` table as INTEGER
    - This column stores the number of seats booked

  2. Notes
    - Uses IF NOT EXISTS to prevent errors if column already exists
    - Column is nullable to maintain compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'seats'
  ) THEN
    ALTER TABLE bookings ADD COLUMN seats INTEGER;
  END IF;
END $$;