-- Create payroll_settings table to persist settings per user
create extension if not exists pgcrypto;

create table if not exists public.payroll_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payroll_settings_user_unique unique(user_id)
);

-- Enable Row Level Security
alter table public.payroll_settings enable row level security;

-- Only owner can access their settings
create policy "Users can view their own payroll settings"
  on public.payroll_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own payroll settings"
  on public.payroll_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own payroll settings"
  on public.payroll_settings for update
  using (auth.uid() = user_id);

-- Trigger to update updated_at
create or replace trigger trigger_payroll_settings_updated_at
before update on public.payroll_settings
for each row execute function public.update_updated_at_column();