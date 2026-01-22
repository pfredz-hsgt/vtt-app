-- Unified VTT Superapp Schema

-- ==========================================
-- VTT Core (Existing)
-- ==========================================

-- Create a table for expenses
create table if not exists expenses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expense_group text default 'vehicle',
  type text not null,
  odometer integer,
  cost decimal(10, 2) not null,
  notes text
  -- user_id removed as auth is disabled
);

-- Enable Row Level Security (RLS)
alter table expenses enable row level security;

-- Policies for expenses (Public Access)
create policy "Public full access to expenses" on expenses
  for all to public
  using (true)
  with check (true);


-- Create a table for recurring expenses
create table if not exists recurring_expenses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  amount decimal(10, 2) not null,
  expense_group text default 'personal',
  type text not null,
  frequency text not null, -- 'monthly', 'weekly', 'yearly'
  day_of_month integer,
  day_of_week integer,
  start_date date not null,
  end_date date,
  next_occurrence_date date,
  notes text,
  is_active boolean default true
);

-- Enable Row Level Security (RLS)
alter table recurring_expenses enable row level security;

-- Policies for recurring_expenses (Public Access)
create policy "Public full access to recurring_expenses" on recurring_expenses
  for all to public
  using (true)
  with check (true);


-- ==========================================
-- Luncheon App (Namespaced: luncheon_*)
-- ==========================================

CREATE TABLE IF NOT EXISTS luncheon_menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  menu_date DATE NOT NULL,
  is_closed BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS luncheon_menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id UUID REFERENCES luncheon_menus(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS luncheon_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id UUID REFERENCES luncheon_menus(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  remarks TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS luncheon_order_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES luncheon_orders(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1
);

-- Indexes for Luncheon
CREATE INDEX IF NOT EXISTS idx_luncheon_menu_items_menu_id ON luncheon_menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_luncheon_orders_menu_id ON luncheon_orders(menu_id);
CREATE INDEX IF NOT EXISTS idx_luncheon_order_details_order_id ON luncheon_order_details(order_id);
CREATE INDEX IF NOT EXISTS idx_luncheon_menus_date ON luncheon_menus(menu_date DESC);


-- ==========================================
-- Dolce App (Namespaced: dolce_*)
-- ==========================================

CREATE TABLE IF NOT EXISTS dolce_menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  menu_date DATE NOT NULL,
  is_closed BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS dolce_menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id UUID REFERENCES dolce_menus(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  price NUMERIC(10, 2) DEFAULT 0.00,
  category TEXT DEFAULT 'General Menu',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dolce_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id UUID REFERENCES dolce_menus(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  remarks TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  is_delivery BOOLEAN DEFAULT FALSE,
  delivery_address TEXT,
  phone_number TEXT,
  total_amount NUMERIC(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dolce_order_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES dolce_orders(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10, 2) DEFAULT 0.00
);

-- Indexes for Dolce
CREATE INDEX IF NOT EXISTS idx_dolce_menu_items_menu_id ON dolce_menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_dolce_orders_menu_id ON dolce_orders(menu_id);
CREATE INDEX IF NOT EXISTS idx_dolce_order_details_order_id ON dolce_order_details(order_id);
CREATE INDEX IF NOT EXISTS idx_dolce_menus_date ON dolce_menus(menu_date DESC);
