/*
  # Create ticket numbers table for IDOR vulnerability

  1. New Tables
    - `ticket_numbers`
      - `id` (uuid, primary key)
      - `booking_id` (text, references bookings)
      - `ticket_number` (integer, unique sequential number)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `ticket_numbers` table
    - Add policy for authenticated users to read all ticket numbers (VULNERABLE - IDOR)

  3. Notes
    - Sequential ticket numbers starting from 1001
    - VULNERABLE: Any authenticated user can access any ticket by number
    - This creates an IDOR (Insecure Direct Object Reference) vulnerability
*/

CREATE TABLE IF NOT EXISTS ticket_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id text NOT NULL,
  ticket_number integer UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ticket_numbers ENABLE ROW LEVEL SECURITY;

-- VULNERABLE POLICY: Any authenticated user can read all ticket numbers
CREATE POLICY "Authenticated users can read all ticket numbers"
  ON ticket_numbers
  FOR SELECT
  TO authenticated
  USING (true);

-- VULNERABLE POLICY: Any authenticated user can insert ticket numbers
CREATE POLICY "Authenticated users can insert ticket numbers"
  ON ticket_numbers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_ticket_numbers_booking_id ON ticket_numbers(booking_id);
CREATE INDEX IF NOT EXISTS idx_ticket_numbers_ticket_number ON ticket_numbers(ticket_number);