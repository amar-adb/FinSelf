/*
  # Create Personal Finance Schema

  1. New Tables
    - `users` (extends auth.users)
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp)
    - `income` - stores monthly income records
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `month` (date)
      - `amount` (numeric)
      - `source` (text)
      - `created_at` (timestamp)
    - `expenses` - stores individual expenses
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `date` (date)
      - `amount` (numeric)
      - `category` (text)
      - `subcategory` (text)
      - `account` (text)
      - `description` (text)
      - `bill_url` (text, optional)
      - `created_at` (timestamp)
    - `transfers` - stores money transfers
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `date` (date)
      - `amount` (numeric)
      - `send_from` (text)
      - `send_to` (text)
      - `received_from` (text)
      - `mode` (text)
      - `description` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
*/

CREATE TABLE IF NOT EXISTS income (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month date NOT NULL,
  amount numeric(12, 2) NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month)
);

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric(12, 2) NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT '',
  subcategory text NOT NULL DEFAULT '',
  account text NOT NULL DEFAULT 'Credit Card',
  description text NOT NULL DEFAULT '',
  bill_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric(12, 2) NOT NULL DEFAULT 0,
  send_from text NOT NULL DEFAULT '',
  send_to text NOT NULL DEFAULT '',
  received_from text NOT NULL DEFAULT '',
  mode text NOT NULL DEFAULT 'UPI',
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own income"
  ON income FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own income"
  ON income FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own income"
  ON income FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own income"
  ON income FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transfers"
  ON transfers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transfers"
  ON transfers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transfers"
  ON transfers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transfers"
  ON transfers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS income_user_id_month ON income(user_id, month);
CREATE INDEX IF NOT EXISTS expenses_user_id_date ON expenses(user_id, date);
CREATE INDEX IF NOT EXISTS transfers_user_id_date ON transfers(user_id, date);
