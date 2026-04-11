-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Available days table
create table if not exists public.available_days (
  id uuid primary key default uuid_generate_v4(),
  date date not null unique,
  start_time time not null,
  end_time time not null,
  is_available boolean not null default true,
  created_at timestamptz default now()
);

-- Bookings table
create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  time time not null,
  status text not null default 'active' check (status in ('active', 'cancelled')),
  customer_name text not null,
  customer_email text not null,
  created_at timestamptz default now()
);

-- Unique constraint: only one active booking per slot
create unique index if not exists bookings_active_slot_unique
  on public.bookings(date, time)
  where status = 'active';

-- Row Level Security
alter table public.available_days enable row level security;
alter table public.bookings enable row level security;

-- Drop existing policies before recreating
drop policy if exists "Anyone can view available days" on public.available_days;
drop policy if exists "Service role can manage available days" on public.available_days;
drop policy if exists "Users see own bookings" on public.bookings;
drop policy if exists "Users can create bookings" on public.bookings;
drop policy if exists "Users can cancel own bookings" on public.bookings;

-- available_days: everyone can read
create policy "Anyone can view available days"
  on public.available_days for select
  using (true);

-- available_days: service role manages via API (bypasses RLS automatically)
create policy "Service role can manage available days"
  on public.available_days for all
  using (true)
  with check (true);

-- bookings: users see only their own
create policy "Users see own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

-- bookings: users can insert their own
create policy "Users can create bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

-- bookings: users can update their own (cancellation)
create policy "Users can cancel own bookings"
  on public.bookings for update
  using (auth.uid() = user_id);
