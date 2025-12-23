-- Enhanced Expense Tracker Schema
-- Supports both vehicle and personal expenses with recurring expense functionality

-- ============================================================================
-- EXPENSES TABLE (Enhanced)
-- ============================================================================

-- First, add new columns to existing expenses table
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS expense_group text DEFAULT 'vehicle' 
CHECK (expense_group IN ('vehicle', 'personal'));

-- Make odometer nullable (only required for vehicle expenses)
ALTER TABLE expenses 
ALTER COLUMN odometer DROP NOT NULL;

-- Drop existing type constraint and add new one with all categories
ALTER TABLE expenses 
DROP CONSTRAINT IF EXISTS expenses_type_check;

ALTER TABLE expenses 
ADD CONSTRAINT expenses_type_check 
CHECK (type IN (
  -- Vehicle categories
  'Fuel', 'Maintenance', 'Insurance', 'Repairs', 'Parking', 
  'Tolls', 'Cleaning', 'Parts', 'Accessories', 'Vehicle Other',
  -- Personal categories
  'Food & Dining', 'Groceries', 'Shopping', 'Entertainment', 
  'Leisure', 'Health & Fitness', 'Transportation', 'Utilities', 
  'Subscriptions', 'Education', 'Gifts', 'Personal Care', 'Personal Other',
  -- Legacy categories (for backward compatibility)
  'Refuel', 'Service', 'Wash', 'Repair', 'Other'
));

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_expense_group ON expenses(expense_group);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at);
CREATE INDEX IF NOT EXISTS idx_expenses_user_group ON expenses(user_id, expense_group);

-- ============================================================================
-- RECURRING EXPENSES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS recurring_expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  
  -- Basic info
  name text NOT NULL, -- e.g., "Car Loan", "Netflix Subscription"
  amount decimal(10, 2) NOT NULL,
  
  -- Categorization
  expense_group text NOT NULL CHECK (expense_group IN ('vehicle', 'personal')),
  type text NOT NULL, -- category from expenses table
  
  -- Recurrence settings
  frequency text NOT NULL CHECK (frequency IN ('monthly', 'weekly', 'yearly')),
  day_of_month integer CHECK (day_of_month BETWEEN 1 AND 31), -- for monthly
  day_of_week integer CHECK (day_of_week BETWEEN 0 AND 6), -- for weekly (0=Sunday)
  
  -- Date range
  start_date date NOT NULL,
  end_date date, -- optional, for fixed-term loans
  
  -- Tracking
  last_generated_date date, -- track last time expense was generated
  next_occurrence_date date, -- calculated next occurrence
  
  -- Optional fields
  odometer integer, -- optional, for vehicle expenses
  notes text,
  
  -- Status
  is_active boolean DEFAULT true -- pause/resume functionality
);

-- Enable RLS on recurring_expenses
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recurring_expenses
CREATE POLICY "Users can view their own recurring expenses"
ON recurring_expenses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring expenses"
ON recurring_expenses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring expenses"
ON recurring_expenses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring expenses"
ON recurring_expenses FOR DELETE
USING (auth.uid() = user_id);

-- Add indexes for recurring_expenses
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user_id ON recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_is_active ON recurring_expenses(is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_next_occurrence ON recurring_expenses(next_occurrence_date);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_recurring_expenses_updated_at ON recurring_expenses;
CREATE TRIGGER update_recurring_expenses_updated_at
  BEFORE UPDATE ON recurring_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate next occurrence date
CREATE OR REPLACE FUNCTION calculate_next_occurrence(
  p_frequency text,
  p_last_date date,
  p_day_of_month integer,
  p_day_of_week integer,
  p_start_date date
)
RETURNS date AS $$
DECLARE
  v_next_date date;
  v_base_date date;
BEGIN
  -- Use last_generated_date if available, otherwise use start_date
  v_base_date := COALESCE(p_last_date, p_start_date);
  
  CASE p_frequency
    WHEN 'monthly' THEN
      -- Add one month
      v_next_date := v_base_date + INTERVAL '1 month';
      -- Adjust to specified day of month
      v_next_date := date_trunc('month', v_next_date) + (p_day_of_month - 1) * INTERVAL '1 day';
      
    WHEN 'weekly' THEN
      -- Add one week
      v_next_date := v_base_date + INTERVAL '1 week';
      
    WHEN 'yearly' THEN
      -- Add one year
      v_next_date := v_base_date + INTERVAL '1 year';
      
    ELSE
      v_next_date := v_base_date;
  END CASE;
  
  RETURN v_next_date;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================

-- To migrate existing data:
-- 1. All existing expenses will have expense_group = 'vehicle' (default)
-- 2. Odometer is now nullable, existing data remains unchanged
-- 3. Old category types (Refuel, Service, Wash, Repair, Other) still work
-- 4. New categories are available for new entries

-- To update old categories to new ones (optional):
-- UPDATE expenses SET type = 'Fuel' WHERE type = 'Refuel';
-- UPDATE expenses SET type = 'Maintenance' WHERE type = 'Service';
-- UPDATE expenses SET type = 'Cleaning' WHERE type = 'Wash';
-- UPDATE expenses SET type = 'Repairs' WHERE type = 'Repair';
-- UPDATE expenses SET type = 'Vehicle Other' WHERE type = 'Other';
