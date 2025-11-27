-- Create a table for vehicle expenses
create table expenses (
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

-- Create a policy that allows users to view their own expenses
create policy "Users can view their own expenses"
on expenses for select
using (auth.uid() = user_id);

-- Create a policy that allows users to insert their own expenses
create policy "Users can insert their own expenses"
on expenses for insert
with check (auth.uid() = user_id);

-- Create a policy that allows users to update their own expenses
create policy "Users can update their own expenses"
on expenses for update
using (auth.uid() = user_id);

-- Create a policy that allows users to delete their own expenses
create policy "Users can delete their own expenses"
on expenses for delete
using (auth.uid() = user_id);
