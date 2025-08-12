/*
  # Add reviews column to movies table

  1. Changes
    - Add `reviews` column to `movies` table as JSONB array
    - This will store movie reviews as JSON objects with user, comment, rating, and date

  2. Notes
    - Using JSONB for better performance and querying capabilities
    - Default empty array for existing movies
*/

-- Add reviews column to movies table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'movies' AND column_name = 'reviews'
  ) THEN
    ALTER TABLE movies ADD COLUMN reviews JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;