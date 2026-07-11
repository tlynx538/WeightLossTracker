-- Run this in the Supabase SQL editor for your project.

-- 1. Profile table: one row per user, stores their goal weight & units.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  goal_weight_kg numeric,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. Entries table: one row per logged measurement.
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null default current_date,
  weight_kg numeric not null,
  waist_cm numeric,
  hip_cm numeric,
  chest_cm numeric,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.entries enable row level security;

create policy "Users can view their own entries"
  on public.entries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own entries"
  on public.entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own entries"
  on public.entries for update
  using (auth.uid() = user_id);

create policy "Users can delete their own entries"
  on public.entries for delete
  using (auth.uid() = user_id);

-- Helpful index for sorting a user's entries by date.
create index if not exists entries_user_date_idx
  on public.entries (user_id, entry_date desc);

-- 3. Automatically create a profile row whenever a new user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
