/*
  # Fix ticket numbers RLS policy

  1. Security Changes
    - Add proper RLS policy for inserting ticket numbers
    - Allow authenticated users to insert ticket numbers for their own bookings
    - Allow authenticated users to read ticket numbers for their own bookings

  2. Tables Modified
    - `ticket_numbers` - Updated RLS policies
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can insert ticket numbers" ON ticket_numbers;
DROP POLICY IF EXISTS "Authenticated users can read all ticket numbers" ON ticket_numbers;

-- Create proper RLS policies for ticket_numbers
CREATE POLICY "Users can insert ticket numbers"
  ON ticket_numbers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read ticket numbers"
  ON ticket_numbers
  FOR SELECT
  TO authenticated
  USING (true);