-- Rider location tracking
create table if not exists rider_location (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid references auth.users(id),
  latitude float,
  longitude float,
  updated_at timestamp default now()
);

-- Enable RLS for rider_location (Optional based on your setup, but good practice)
-- alter table rider_location enable row level security;
-- create policy "Riders can insert their own location" on rider_location for insert with check (auth.uid() = rider_id);
-- create policy "Consumers can read rider locations" on rider_location for select using (true);

-- Add role column to user_profiles if not present
alter table user_profiles add column if not exists role text default 'consumer';

-- Add partner_id to orders if not present
alter table orders add column if not exists partner_id uuid references auth.users(id);

-- Make sure to run this via Supabase SQL Editor
