-- Unified VTT Superapp Schema

-- ==========================================
-- VTT Core (Existing)
-- ==========================================

-- Create a table for vehicle expenses
create table if not exists expenses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  type text check (type in ('Refuel', 'Service', 'Wash', 'Repair', 'Other')) not null,
  odometer integer not null,
  cost decimal(10, 2) not null,
  notes text
);

-- Enable Row Level Security (RLS)
alter table expenses enable row level security;

-- Policies for expenses
create policy "Users can view their own expenses" on expenses for select using (auth.uid() = user_id);
create policy "Users can insert their own expenses" on expenses for insert with check (auth.uid() = user_id);
create policy "Users can update their own expenses" on expenses for update using (auth.uid() = user_id);
create policy "Users can delete their own expenses" on expenses for delete using (auth.uid() = user_id);


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
