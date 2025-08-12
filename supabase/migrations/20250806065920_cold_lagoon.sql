/*
  # Fix bookings table structure

  1. Table Updates
    - Add missing columns to `bookings` table:
      - `movie_title` (text)
      - `seat_numbers` (text array)
      - `show_time` (text)
      - `payment_status` (text with default 'confirmed')
      - `booking_date` (timestamp with default now())

  2. Notes
    - Uses IF NOT EXISTS checks to avoid errors if columns already exist
    - Maintains compatibility with existing data
*/

-- Add missing columns to bookings table
DO $$
BEGIN
  -- Add movie_title column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'movie_title'
  ) THEN
    ALTER TABLE bookings ADD COLUMN movie_title TEXT;
  END IF;

  -- Add seat_numbers column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'seat_numbers'
  ) THEN
    ALTER TABLE bookings ADD COLUMN seat_numbers TEXT[];
  END IF;

  -- Add show_time column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'show_time'
  ) THEN
    ALTER TABLE bookings ADD COLUMN show_time TEXT;
  END IF;

  -- Add payment_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE bookings ADD COLUMN payment_status TEXT DEFAULT 'confirmed';
  END IF;

  -- Add booking_date column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'booking_date'
  ) THEN
    ALTER TABLE bookings ADD COLUMN booking_date TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;