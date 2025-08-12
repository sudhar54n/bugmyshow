/*
  # Add sequential ticket numbers for IDOR vulnerability

  1. New Tables
    - `ticket_numbers`
      - `id` (integer, primary key, auto-increment)
      - `booking_id` (text, references booking)
      - `ticket_number` (integer, sequential)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `ticket_numbers` table
    - Add policy for users to read their own tickets (vulnerable - allows IDOR)

  3. Changes
    - Creates sequential ticket numbering system
    - Intentionally vulnerable to IDOR attacks for educational purposes
*/

-- Create ticket_numbers table for sequential ticket IDs
CREATE TABLE IF NOT EXISTS ticket_numbers (
  id SERIAL PRIMARY KEY,
  booking_id TEXT NOT NULL,
  ticket_number INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (but make it vulnerable)
ALTER TABLE ticket_numbers ENABLE ROW LEVEL SECURITY;

-- Vulnerable policy - allows any authenticated user to access any ticket by ticket_number
CREATE POLICY "Users can access tickets by ticket number"
  ON ticket_numbers
  FOR SELECT
  TO authenticated
  USING (true); -- VULNERABLE: No user ownership check

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_ticket_numbers_booking_id ON ticket_numbers(booking_id);
CREATE INDEX IF NOT EXISTS idx_ticket_numbers_ticket_number ON ticket_numbers(ticket_number);

-- Insert initial ticket numbers for existing bookings (if any)
DO $$
DECLARE
  booking_record RECORD;
  next_ticket_num INTEGER := 1001; -- Start ticket numbers from 1001
BEGIN
  FOR booking_record IN 
    SELECT id FROM bookings 
    WHERE id NOT IN (SELECT booking_id FROM ticket_numbers)
    ORDER BY booking_date ASC
  LOOP
    INSERT INTO ticket_numbers (booking_id, ticket_number)
    VALUES (booking_record.id, next_ticket_num);
    next_ticket_num := next_ticket_num + 1;
  END LOOP;
END $$;