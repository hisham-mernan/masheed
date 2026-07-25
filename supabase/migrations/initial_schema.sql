-- ==========================================
-- MASHEED ERP – INITIAL SCHEMA MIGRATION
-- Project: Saudi Awqaf Management System
-- ==========================================

-- 0. CLEANUP (For re-runs)
drop table if exists public.audit_logs cascade;
drop table if exists public.beneficiaries cascade;
drop table if exists public.transactions cascade;
drop table if exists public.assets cascade;
drop table if exists public.profiles cascade;
drop table if exists public.waqfs cascade;
drop type if exists public.transaction_type cascade;
drop type if exists public.asset_category cascade;
drop type if exists public.user_role cascade;
drop function if exists public.handle_new_user cascade;
drop function if exists public.log_changes cascade;

-- 1. EXTENSIONS
create extension if not exists pgcrypto;

-- 2. ENUMS & TYPES
create type public.user_role as enum ('admin', 'supervisor', 'auditor', 'viewer');
create type public.asset_category as enum ('real_estate', 'agricultural', 'investment', 'cash');
create type public.transaction_type as enum ('income', 'expense', 'distribution');

-- 3. TABLES

-- Waqf Entities (Endowments)
create table public.waqfs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  registration_number text unique,
  description text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- User Profiles (linked to auth.users)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  waqf_id uuid references public.waqfs(id),
  full_name text,
  role public.user_role default 'viewer',
  created_at timestamptz default now()
);

-- Assets (Properties, Farms, Portfolios)
create table public.assets (
  id uuid primary key default gen_random_uuid(),
  waqf_id uuid references public.waqfs(id) not null,
  name text not null,
  category public.asset_category not null,
  valuation numeric(20,2) default 0,
  location text,
  status text default 'active',
  qr_code text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Transactions (Ledger)
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  waqf_id uuid references public.waqfs(id) not null,
  asset_id uuid references public.assets(id),
  amount numeric(20,2) not null,
  type public.transaction_type not null,
  category text, -- e.g., 'rent', 'dividend', 'maintenance'
  is_yield boolean default true, -- true = Ri'a (income), false = Asl (principal)
  description text,
  reference_no text, -- For ZATCA/Receipts
  transaction_date date default current_date,
  created_at timestamptz default now()
);

-- Beneficiaries
create table public.beneficiaries (
  id uuid primary key default gen_random_uuid(),
  waqf_id uuid references public.waqfs(id) not null,
  name text not null,
  contact_info text,
  bank_details text,
  created_at timestamptz default now()
);

-- Audit Logs
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  waqf_id uuid references public.waqfs(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  changes jsonb,
  created_at timestamptz default now()
);

-- 4. ROW LEVEL SECURITY (RLS)

-- Enable RLS
alter table public.waqfs enable row level security;
alter table public.profiles enable row level security;
alter table public.assets enable row level security;
alter table public.transactions enable row level security;
alter table public.beneficiaries enable row level security;
alter table public.audit_logs enable row level security;

-- Policies: Profiles (Users see their own, admins see all in Waqf)
create policy "Users can view their own profile"
  on public.profiles for select
  using ( auth.uid() = id );

-- Policies: Multi-tenancy (Restrict by waqf_id)
create policy "Waqf access: Profiles"
  on public.profiles for all
  using ( waqf_id in (select waqf_id from public.profiles where id = auth.uid()) );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

create policy "Waqf access: Waqfs"
  on public.waqfs for select
  using ( id in (select waqf_id from public.profiles where id = auth.uid()) );

create policy "Users can create a Waqf"
  on public.waqfs for insert
  with check ( auth.role() = 'authenticated' );

create policy "Waqf access: Assets"
  on public.assets for all
  using ( waqf_id in (select waqf_id from public.profiles where id = auth.uid()) );

create policy "Waqf access: Transactions"
  on public.transactions for all
  using ( waqf_id in (select waqf_id from public.profiles where id = auth.uid()) );

create policy "Waqf access: Beneficiaries"
  on public.beneficiaries for all
  using ( waqf_id in (select waqf_id from public.profiles where id = auth.uid()) );

create policy "Waqf access: Audit Logs"
  on public.audit_logs for select
  using ( waqf_id in (select waqf_id from public.profiles where id = auth.uid()) );

-- 5. TRIGGERS & FUNCTIONS

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_waqf_id uuid;
  waqf_name_text text;
begin
  -- Extract waqf name from metadata
  waqf_name_text := new.raw_user_meta_data->>'waqf_name';
  
  -- If a waqf name was provided, create it
  if waqf_name_text is not null then
    insert into public.waqfs (name)
    values (waqf_name_text)
    returning id into new_waqf_id;
  end if;

  insert into public.profiles (id, full_name, waqf_id, role)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new_waqf_id,
    case when new_waqf_id is not null then 'admin'::public.user_role else 'viewer'::public.user_role end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Audit Log Function (Generic)
create or replace function public.log_changes()
returns trigger as $$
begin
  insert into public.audit_logs (user_id, waqf_id, action, entity_type, entity_id, changes)
  values (
    auth.uid(),
    (select waqf_id from public.profiles where id = auth.uid()),
    TG_OP,
    TG_TABLE_NAME,
    case
      when TG_OP = 'DELETE' then OLD.id
      else NEW.id
    end,
    case
      when TG_OP = 'INSERT' then jsonb_build_object('new', to_jsonb(NEW))
      when TG_OP = 'UPDATE' then jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
      else jsonb_build_object('old', to_jsonb(OLD))
    end
  );
  return null;
end;
$$ language plpgsql security definer;

-- Apply audit to core tables
create trigger audit_assets after insert or update or delete on public.assets for each row execute procedure public.log_changes();
create trigger audit_transactions after insert or update or delete on public.transactions for each row execute procedure public.log_changes();
