-- ==========================================
-- MASHEED — FULL DATABASE SETUP (fresh Supabase project)
-- Generated from supabase/migrations/ (initial_schema → 14) in order.
-- Run once, in the Supabase SQL Editor or with `node scripts/deploy_schema.js`.
-- ==========================================

-- Safety: initial_schema drops and recreates profiles, assets, transactions, ...
-- Refuse to run anywhere those already exist, so this can never wipe a live database.
do $$
begin
  if to_regclass('public.profiles') is not null or to_regclass('public.waqfs') is not null then
    raise exception 'public.profiles/public.waqfs already exist — this script is only for an empty Masheed project';
  end if;
end $$;


-- >>>>>>>>>> initial_schema.sql
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


-- >>>>>>>>>> 02_update_schema.sql
-- ==========================================
-- MASHEED ERP – SCHEMA UPDATE MIGRATION (V2)
-- Tokenization, Waqf Types, and Real Data Support
-- ==========================================

-- 1. ENUMS (New Types)
create type public.waqf_type as enum ('khairi', 'ahli', 'mushtarak');
create type public.beneficiary_status as enum ('active', 'suspended', 'deceased');

-- 2. ALTER WAQFS TABLE
-- Adding waqf_type and total_shares for tokenization (ERP logic)
alter table public.waqfs
  add column if not exists type public.waqf_type default 'khairi',
  add column if not exists total_shares numeric(20,2) default 100.00; -- Can represent 100% or absolute number of shares (tokens)

-- 3. ALTER BENEFICIARIES TABLE
-- Adding shares for the tokenization/ERP distribution logic
alter table public.beneficiaries
  add column if not exists shares_owned numeric(20,2) default 0.00,
  add column if not exists status public.beneficiary_status default 'active',
  add column if not exists national_id text,
  add column if not exists wallet_balance numeric(20,2) default 0.00; -- To hold undistributed funds

-- 4. ERP DISTRIBUTION SYSTEM (New Tables)
-- Track distributions to beneficiaries based on their shares
create table public.distributions (
  id uuid primary key default gen_random_uuid(),
  waqf_id uuid references public.waqfs(id) not null,
  transaction_id uuid references public.transactions(id), -- the source income transaction
  total_amount numeric(20,2) not null,
  distribution_date date default current_date,
  status text default 'pending', -- pending, completed
  created_at timestamptz default now()
);

-- Individual payout records for each beneficiary per distribution
create table public.distribution_payouts (
  id uuid primary key default gen_random_uuid(),
  distribution_id uuid references public.distributions(id) on delete cascade not null,
  beneficiary_id uuid references public.beneficiaries(id) not null,
  amount numeric(20,2) not null,
  shares_at_time numeric(20,2) not null, -- snapshot of shares owned when distributed
  status text default 'unpaid', -- unpaid, transferred
  created_at timestamptz default now()
);

-- Enable RLS on new tables
alter table public.distributions enable row level security;
alter table public.distribution_payouts enable row level security;

-- Policies for new tables
create policy "Waqf access: Distributions"
  on public.distributions for all
  using ( waqf_id in (select waqf_id from public.profiles where id = auth.uid()) );

create policy "Waqf access: Distribution Payouts"
  on public.distribution_payouts for all
  using ( 
    distribution_id in (
      select id from public.distributions 
      where waqf_id in (select waqf_id from public.profiles where id = auth.uid())
    ) 
  );

-- 5. Helper Function: Calculate distribution amounts based on shares
create or replace function public.calculate_distribution(p_distribution_id uuid)
returns void as $$
declare
  v_waqf_id uuid;
  v_total_amount numeric;
  v_total_shares numeric;
  b record;
  v_payout numeric;
begin
  -- Get distribution details
  select waqf_id, total_amount into v_waqf_id, v_total_amount 
  from public.distributions where id = p_distribution_id;

  -- Get total shares for the waqf
  select total_shares into v_total_shares 
  from public.waqfs where id = v_waqf_id;

  if v_total_shares <= 0 then
    raise exception 'Waqf has 0 total shares';
  end if;

  -- Loop through active beneficiaries and create payouts
  for b in select id, shares_owned from public.beneficiaries where waqf_id = v_waqf_id and status = 'active' and shares_owned > 0
  loop
    v_payout := (b.shares_owned / v_total_shares) * v_total_amount;
    
    insert into public.distribution_payouts (distribution_id, beneficiary_id, amount, shares_at_time)
    values (p_distribution_id, b.id, v_payout, b.shares_owned);
    
    -- Update beneficiary wallet (optional, if keeping track internally)
    update public.beneficiaries 
    set wallet_balance = wallet_balance + v_payout 
    where id = b.id;
  end loop;

  update public.distributions set status = 'completed' where id = p_distribution_id;
end;
$$ language plpgsql security definer;


-- >>>>>>>>>> 03_workflow_roles.sql
-- ==========================================
-- MASHEED ERP – MIGRATION V3
-- Real Workflow: Roles enforcement, Distribution engine, Full audit
-- ==========================================

-- 1. Helper: current user's role
create or replace function public.my_role()
returns public.user_role
language sql security definer stable as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Helper: current user's waqf (security definer, so RLS policies can call it
-- without re-entering the profiles policies)
create or replace function public.get_user_waqf_id()
returns uuid
language sql security definer stable as $$
  select waqf_id from public.profiles where id = auth.uid();
$$;

-- 2. ATOMIC DISTRIBUTION ENGINE
-- One RPC does the whole workflow: validate -> distribute -> ledger -> audit
create or replace function public.distribute_yield(p_amount numeric)
returns uuid as $$
declare
  v_waqf uuid;
  v_total_shares numeric;
  v_available numeric;
  v_dist_id uuid;
  b record;
  v_payout numeric;
begin
  v_waqf := public.get_user_waqf_id();
  if v_waqf is null then
    raise exception 'لا يوجد وقف مرتبط بحسابك';
  end if;

  if public.my_role() not in ('admin','supervisor') then
    raise exception 'غير مصرح: التوزيع متاح للمدير والمشرف فقط';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'المبلغ يجب أن يكون أكبر من صفر';
  end if;

  -- Available yield = income (Ri'a) - previous distributions
  select coalesce(sum(amount) filter (where type = 'income' and is_yield), 0)
       - coalesce(sum(amount) filter (where type = 'distribution'), 0)
    into v_available
    from public.transactions
   where waqf_id = v_waqf;

  if p_amount > v_available then
    raise exception 'المبلغ يتجاوز الريع المتاح للتوزيع (% ر.س)', v_available;
  end if;

  select total_shares into v_total_shares from public.waqfs where id = v_waqf;
  if coalesce(v_total_shares, 0) <= 0 then
    raise exception 'الوقف بدون أسهم (total_shares = 0)';
  end if;

  insert into public.distributions (waqf_id, total_amount, status)
  values (v_waqf, p_amount, 'pending')
  returning id into v_dist_id;

  for b in
    select id, shares_owned from public.beneficiaries
    where waqf_id = v_waqf and status = 'active' and shares_owned > 0
  loop
    v_payout := round((b.shares_owned / v_total_shares) * p_amount, 2);
    insert into public.distribution_payouts (distribution_id, beneficiary_id, amount, shares_at_time)
    values (v_dist_id, b.id, v_payout, b.shares_owned);
    update public.beneficiaries
       set wallet_balance = wallet_balance + v_payout
     where id = b.id;
  end loop;

  -- Ledger entry so the distribution appears in finance & dashboard totals
  insert into public.transactions (waqf_id, amount, type, category, is_yield, description, reference_no)
  values (v_waqf, p_amount, 'distribution', 'distribution', false,
          'توزيع ريع آلي على المستفيدين حسب الأسهم', 'DIST-' || v_dist_id::text);

  update public.distributions set status = 'completed' where id = v_dist_id;
  return v_dist_id;
end;
$$ language plpgsql security definer;

-- 3. SIGNUP TRIGGER: support joining an existing waqf (invite flow)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_waqf_id uuid;
  waqf_name_text text;
  invite_waqf uuid;
  req_role text;
begin
  waqf_name_text := new.raw_user_meta_data->>'waqf_name';
  invite_waqf := nullif(new.raw_user_meta_data->>'invite_waqf_id', '')::uuid;
  req_role := new.raw_user_meta_data->>'role';

  if invite_waqf is not null and exists (select 1 from public.waqfs where id = invite_waqf) then
    -- Join an existing waqf with a requested (non-admin) role
    insert into public.profiles (id, full_name, waqf_id, role)
    values (
      new.id,
      new.raw_user_meta_data->>'full_name',
      invite_waqf,
      case
        when req_role in ('supervisor','auditor','viewer') then req_role::public.user_role
        else 'viewer'::public.user_role
      end
    );
    return new;
  end if;

  if waqf_name_text is not null then
    insert into public.waqfs (name) values (waqf_name_text) returning id into new_waqf_id;
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

-- 4. AUDIT COVERAGE: beneficiaries + distributions
drop trigger if exists audit_beneficiaries on public.beneficiaries;
create trigger audit_beneficiaries after insert or update or delete on public.beneficiaries
  for each row execute procedure public.log_changes();

drop trigger if exists audit_distributions on public.distributions;
create trigger audit_distributions after insert or update or delete on public.distributions
  for each row execute procedure public.log_changes();

-- 5. ROLE-AWARE RLS (replace permissive "for all" policies)
-- Assets
drop policy if exists "Waqf access: Assets" on public.assets;
create policy "assets read"   on public.assets for select using (waqf_id = public.get_user_waqf_id());
create policy "assets insert" on public.assets for insert with check (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor'));
create policy "assets update" on public.assets for update using (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor'));
create policy "assets delete" on public.assets for delete using (waqf_id = public.get_user_waqf_id() and public.my_role() = 'admin');

-- Transactions
drop policy if exists "Waqf access: Transactions" on public.transactions;
create policy "tx read"   on public.transactions for select using (waqf_id = public.get_user_waqf_id());
create policy "tx insert" on public.transactions for insert with check (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor'));
create policy "tx update" on public.transactions for update using (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor'));
create policy "tx delete" on public.transactions for delete using (waqf_id = public.get_user_waqf_id() and public.my_role() = 'admin');

-- Beneficiaries
drop policy if exists "Waqf access: Beneficiaries" on public.beneficiaries;
create policy "ben read"   on public.beneficiaries for select using (waqf_id = public.get_user_waqf_id());
create policy "ben insert" on public.beneficiaries for insert with check (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor'));
create policy "ben update" on public.beneficiaries for update using (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor'));
create policy "ben delete" on public.beneficiaries for delete using (waqf_id = public.get_user_waqf_id() and public.my_role() = 'admin');

-- Distributions (writes go through distribute_yield RPC only)
drop policy if exists "Waqf access: Distributions" on public.distributions;
create policy "dist read" on public.distributions for select using (waqf_id = public.get_user_waqf_id());

-- Distribution payouts (read-only for users; written by the RPC)
drop policy if exists "Waqf access: Distribution Payouts" on public.distribution_payouts;
create policy "payouts read" on public.distribution_payouts for select
  using (distribution_id in (select id from public.distributions where waqf_id = public.get_user_waqf_id()));

-- 6. OLD FUNCTION kept for backward compatibility
-- (calculate_distribution remains; new flow uses distribute_yield)


-- >>>>>>>>>> 04_tasks_documents.sql
-- ==========================================
-- MASHEED ERP – MIGRATION V4
-- Maintenance tasks + Document archive (human-driven workflows)
-- ==========================================

-- 1. Maintenance tasks (per asset, human managed)
create table if not exists public.maintenance_tasks (
  id uuid primary key default gen_random_uuid(),
  waqf_id uuid references public.waqfs(id) not null,
  asset_id uuid references public.assets(id) on delete set null,
  title text not null,
  priority text not null default 'scheduled', -- urgent | in_progress | scheduled
  status text not null default 'open',        -- open | done | cancelled
  due_date date,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  completed_at timestamptz
);

alter table public.maintenance_tasks enable row level security;

create policy "tasks read"   on public.maintenance_tasks for select using (waqf_id = public.get_user_waqf_id());
create policy "tasks insert" on public.maintenance_tasks for insert with check (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor'));
create policy "tasks update" on public.maintenance_tasks for update using (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor'));
create policy "tasks delete" on public.maintenance_tasks for delete using (waqf_id = public.get_user_waqf_id() and public.my_role() = 'admin');

drop trigger if exists audit_tasks on public.maintenance_tasks;
create trigger audit_tasks after insert or update or delete on public.maintenance_tasks
  for each row execute procedure public.log_changes();

-- 2. Document archive (OCR / scanned deeds)
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  waqf_id uuid references public.waqfs(id) not null,
  asset_id uuid references public.assets(id) on delete set null,
  doc_type text not null default 'sukuk',   -- sukuk | contract | receipt | other
  title text not null,
  reference_no text,
  doc_date text,
  conditions_text text,                      -- شروط الواقف
  file_name text,
  file_data text,                            -- base64 payload of the scan (small files)
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.documents enable row level security;

create policy "docs read"   on public.documents for select using (waqf_id = public.get_user_waqf_id());
create policy "docs insert" on public.documents for insert with check (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor'));
create policy "docs delete" on public.documents for delete using (waqf_id = public.get_user_waqf_id() and public.my_role() = 'admin');

drop trigger if exists audit_documents on public.documents;
create trigger audit_documents after insert or update or delete on public.documents
  for each row execute procedure public.log_changes();


-- >>>>>>>>>> 05_platform_admin_settle.sql
-- ==========================================
-- MASHEED ERP – MIGRATION V5
-- Platform admin (sees all waqfs) + wallet settlement RPC
-- ==========================================

-- 1. Platform admin flag
alter table public.profiles add column if not exists is_platform_admin boolean default false;

-- Dev stage: existing admins are platform operators
update public.profiles set is_platform_admin = true where role = 'admin';

create or replace function public.is_platform_admin()
returns boolean language sql security definer stable as $$
  select coalesce((select is_platform_admin from public.profiles where id = auth.uid()), false);
$$;

-- 2. RLS: platform admin sees/writes all waqfs
-- assets
drop policy if exists "assets read" on public.assets;
drop policy if exists "assets insert" on public.assets;
drop policy if exists "assets update" on public.assets;
drop policy if exists "assets delete" on public.assets;
create policy "assets read"   on public.assets for select using (public.is_platform_admin() or waqf_id = public.get_user_waqf_id());
create policy "assets insert" on public.assets for insert with check (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "assets update" on public.assets for update using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "assets delete" on public.assets for delete using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() = 'admin'));

-- transactions
drop policy if exists "tx read" on public.transactions;
drop policy if exists "tx insert" on public.transactions;
drop policy if exists "tx update" on public.transactions;
drop policy if exists "tx delete" on public.transactions;
create policy "tx read"   on public.transactions for select using (public.is_platform_admin() or waqf_id = public.get_user_waqf_id());
create policy "tx insert" on public.transactions for insert with check (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "tx update" on public.transactions for update using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "tx delete" on public.transactions for delete using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() = 'admin'));

-- beneficiaries
drop policy if exists "ben read" on public.beneficiaries;
drop policy if exists "ben insert" on public.beneficiaries;
drop policy if exists "ben update" on public.beneficiaries;
drop policy if exists "ben delete" on public.beneficiaries;
create policy "ben read"   on public.beneficiaries for select using (public.is_platform_admin() or waqf_id = public.get_user_waqf_id());
create policy "ben insert" on public.beneficiaries for insert with check (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "ben update" on public.beneficiaries for update using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "ben delete" on public.beneficiaries for delete using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() = 'admin'));

-- distributions / payouts
drop policy if exists "dist read" on public.distributions;
create policy "dist read" on public.distributions for select using (public.is_platform_admin() or waqf_id = public.get_user_waqf_id());

drop policy if exists "payouts read" on public.distribution_payouts;
create policy "payouts read" on public.distribution_payouts for select
  using (public.is_platform_admin() or distribution_id in (select id from public.distributions where waqf_id = public.get_user_waqf_id()));
create policy "payouts update" on public.distribution_payouts for update
  using (public.is_platform_admin() or (distribution_id in (select id from public.distributions where waqf_id = public.get_user_waqf_id()) and public.my_role() in ('admin','supervisor')));

-- tasks
drop policy if exists "tasks read" on public.maintenance_tasks;
drop policy if exists "tasks insert" on public.maintenance_tasks;
drop policy if exists "tasks update" on public.maintenance_tasks;
drop policy if exists "tasks delete" on public.maintenance_tasks;
create policy "tasks read"   on public.maintenance_tasks for select using (public.is_platform_admin() or waqf_id = public.get_user_waqf_id());
create policy "tasks insert" on public.maintenance_tasks for insert with check (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "tasks update" on public.maintenance_tasks for update using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "tasks delete" on public.maintenance_tasks for delete using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() = 'admin'));

-- documents
drop policy if exists "docs read" on public.documents;
drop policy if exists "docs insert" on public.documents;
drop policy if exists "docs delete" on public.documents;
create policy "docs read"   on public.documents for select using (public.is_platform_admin() or waqf_id = public.get_user_waqf_id());
create policy "docs insert" on public.documents for insert with check (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "docs delete" on public.documents for delete using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() = 'admin'));

-- waqfs: platform admin reads all
drop policy if exists "Waqf access: Waqfs" on public.waqfs;
create policy "Waqf access: Waqfs" on public.waqfs for select
  using (public.is_platform_admin() or id = public.get_user_waqf_id());

-- audit logs
drop policy if exists "Waqf access: Audit Logs" on public.audit_logs;
create policy "Waqf access: Audit Logs" on public.audit_logs for select
  using (public.is_platform_admin() or waqf_id = public.get_user_waqf_id());

-- profiles: platform admin sees all profiles
drop policy if exists "Waqf access: Profiles" on public.profiles;
create policy "Waqf access: Profiles" on public.profiles for all
  using (public.is_platform_admin() or waqf_id = public.get_user_waqf_id());

-- 3. Wallet settlement: mark unpaid payouts as transferred and zero wallets
create or replace function public.settle_wallets()
returns integer as $$
declare
  v_waqf uuid;
  v_count integer;
begin
  v_waqf := public.get_user_waqf_id();
  if v_waqf is null and not public.is_platform_admin() then
    raise exception 'لا يوجد وقف مرتبط بحسابك';
  end if;
  if public.my_role() not in ('admin','supervisor') then
    raise exception 'غير مصرح: الصرف متاح للمدير والمشرف فقط';
  end if;

  update public.distribution_payouts p
     set status = 'transferred'
    from public.distributions d
   where p.distribution_id = d.id
     and p.status = 'unpaid'
     and (v_waqf is null or d.waqf_id = v_waqf);
  get diagnostics v_count = row_count;

  update public.beneficiaries
     set wallet_balance = 0
   where wallet_balance > 0
     and (v_waqf is null or waqf_id = v_waqf);

  return v_count;
end;
$$ language plpgsql security definer;

-- 6. FIX: remove legacy single-arg overload (breaks PostgREST dispatch)
drop function if exists public.distribute_yield(numeric);


-- >>>>>>>>>> 06_approvals.sql
-- ==========================================
-- MASHEED ERP – MIGRATION V6
-- Maker–Checker approval engine
-- التوزيع والتسوية يصبحان طلبات تمر بمعتمد مختلف عن المنشئ
-- ==========================================

-- 1. Approval requests table
create table if not exists public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  waqf_id uuid references public.waqfs(id) not null,
  type text not null check (type in ('distribute_yield', 'settle_wallets')),
  amount numeric(20,2),                     -- للتوزيع؛ null للتسوية
  status text not null default 'pending' check (status in ('pending','approved','rejected','executed','cancelled')),
  created_by uuid references public.profiles(id) not null,
  created_at timestamptz default now(),
  decided_by uuid references public.profiles(id),
  decided_at timestamptz,
  decision_note text,
  executed_by uuid references public.profiles(id),
  executed_at timestamptz,
  result jsonb                              -- نتيجة التنفيذ (مثلاً distribution_id)
);

alter table public.approval_requests enable row level security;

-- قراءة: أعضاء الوقف + مدير المنصة
create policy "approvals read" on public.approval_requests for select
  using (public.is_platform_admin() or waqf_id = public.get_user_waqf_id());

-- إنشاء: المدير والمشرف فقط (Maker)
create policy "approvals insert" on public.approval_requests for insert
  with check ((public.is_platform_admin() or waqf_id = public.get_user_waqf_id())
              and public.my_role() in ('admin','supervisor'));

-- لا تحديث مباشر: القرار والتنفيذ عبر RPC فقط (Security Definer)

drop trigger if exists audit_approvals on public.approval_requests;
create trigger audit_approvals after insert or update or delete on public.approval_requests
  for each row execute procedure public.log_changes();

-- 2. قرار الاعتماد (Checker) — يجب أن يكون شخصاً مختلفاً عن المنشئ
create or replace function public.decide_approval(p_id uuid, p_decision text, p_note text default null)
returns uuid as $$
declare
  v_req public.approval_requests%rowtype;
begin
  select * into v_req from public.approval_requests where id = p_id;
  if not found then raise exception 'الطلب غير موجود'; end if;

  if not (public.is_platform_admin() or v_req.waqf_id = public.get_user_waqf_id()) then
    raise exception 'غير مصرح: الطلب ليس ضمن وقفك';
  end if;
  if public.my_role() not in ('admin','supervisor') then
    raise exception 'غير مصرح: الاعتماد متاح للمدير والمشرف فقط';
  end if;
  if v_req.status <> 'pending' then
    raise exception 'لا يمكن اتخاذ قرار: حالة الطلب "%"', v_req.status;
  end if;
  if v_req.created_by = auth.uid() then
    raise exception 'مبدأ الفصل بين المهام: لا يمكنك اعتماد طلب أنشأته بنفسك — يجب أن يعتمد شخص آخر';
  end if;
  if p_decision not in ('approved','rejected') then
    raise exception 'قرار غير صالح';
  end if;

  update public.approval_requests
     set status = p_decision,
         decided_by = auth.uid(),
         decided_at = now(),
         decision_note = p_note
   where id = p_id;

  return p_id;
end;
$$ language plpgsql security definer;

-- 3. تنفيذ طلب معتمد
create or replace function public.execute_approval(p_id uuid)
returns jsonb as $$
declare
  v_req public.approval_requests%rowtype;
  v_result jsonb;
  v_dist uuid;
  v_count integer;
begin
  select * into v_req from public.approval_requests where id = p_id;
  if not found then raise exception 'الطلب غير موجود'; end if;

  if not (public.is_platform_admin() or v_req.waqf_id = public.get_user_waqf_id()) then
    raise exception 'غير مصرح: الطلب ليس ضمن وقفك';
  end if;
  if public.my_role() not in ('admin','supervisor') then
    raise exception 'غير مصرح: التنفيذ متاح للمدير والمشرف فقط';
  end if;
  if v_req.status = 'executed' then
    raise exception 'هذا الطلب نُفّذ بالفعل';
  end if;
  if v_req.status <> 'approved' then
    raise exception 'لا يمكن التنفيذ قبل الاعتماد (الحالة الحالية: %)', v_req.status;
  end if;

  if v_req.type = 'distribute_yield' then
    v_dist := public.distribute_yield(v_req.amount, v_req.waqf_id);
    v_result := jsonb_build_object('distribution_id', v_dist);
  elsif v_req.type = 'settle_wallets' then
    -- تصفية محافظ الوقف المطلوب مباشرة (لا تعتمد على جلسة المنفذ)
    update public.distribution_payouts p
       set status = 'transferred'
      from public.distributions d
     where p.distribution_id = d.id
       and p.status = 'unpaid'
       and d.waqf_id = v_req.waqf_id;
    get diagnostics v_count = row_count;

    update public.beneficiaries
       set wallet_balance = 0
     where wallet_balance > 0
       and waqf_id = v_req.waqf_id;

    v_result := jsonb_build_object('settled_payouts', v_count);
  else
    raise exception 'نوع طلب غير معروف: %', v_req.type;
  end if;

  update public.approval_requests
     set status = 'executed',
         executed_by = auth.uid(),
         executed_at = now(),
         result = v_result
   where id = p_id;

  return v_result;
end;
$$ language plpgsql security definer;


-- >>>>>>>>>> 07_notification_reads.sql
-- ==========================================
-- MASHEED ERP – MIGRATION V7
-- Notification read-state per user
-- كل مستخدم له حالة قراءة مستقلة لكل إشعار
-- ==========================================

create table if not exists public.notification_reads (
  user_id uuid references public.profiles(id) on delete cascade not null,
  ref_key text not null,               -- مثال: task:<uuid> | log:<uuid> | approval:<uuid>
  read_at timestamptz default now(),
  primary key (user_id, ref_key)
);

alter table public.notification_reads enable row level security;

-- كل مستخدم يدير حالة القراءة الخاصة به فقط
create policy "reads select" on public.notification_reads for select
  using (auth.uid() = user_id);
create policy "reads insert" on public.notification_reads for insert
  with check (auth.uid() = user_id);
create policy "reads delete" on public.notification_reads for delete
  using (auth.uid() = user_id);


-- >>>>>>>>>> 08_erp_modules.sql
-- ==========================================
-- MASHEED ERP – MIGRATION V8
-- ERP modules: Waqifs, Meetings, Decisions (Governance),
-- Investments, Contracts, Budgets, Consultations, Listing Requests
-- دمج وحدات المواصفات (MPS) ببيانات حقيقية
-- ==========================================

-- 1) الواقفون (مؤسسو الوقف)
create table if not exists public.waqifs (
  id uuid primary key default gen_random_uuid(),
  waqf_id uuid references public.waqfs(id) on delete cascade not null,
  name text not null,
  nationality text,
  national_id text,
  birth_date date,
  relationship text,              -- صلته بالوقف
  founder_type text default 'individual',  -- individual | organization
  biography text,
  status text default 'active',   -- active | deceased
  created_at timestamptz default now()
);

-- 2) اجتماعات مجالس النظارة واللجان
create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  waqf_id uuid references public.waqfs(id) on delete cascade not null,
  title text not null,
  committee text,                 -- اللجنة / المجلس
  meeting_date date not null,
  quorum_pct int,                 -- معدل التصويت/النصاب %
  status text default 'scheduled',-- scheduled | in_voting | documented
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- 3) سجل القرارات (الحوكمة)
create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  waqf_id uuid references public.waqfs(id) on delete cascade not null,
  meeting_id uuid references public.meetings(id) on delete set null,
  title text not null,
  type text default 'other',      -- asset_sale | budget | distribution | appointment | policy | other
  description text,
  reason text,                    -- المبررات
  impact_analysis text,           -- تحليل الأثر
  status text default 'pending',  -- pending | approved | rejected
  decided_by uuid references public.profiles(id),
  decided_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- 4) محافظ الاستثمار الوقفية
create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  waqf_id uuid references public.waqfs(id) on delete cascade not null,
  name text not null,
  type text default 'fund',       -- fund | sukuk | stocks | deposit | other
  valuation numeric default 0,
  expected_return numeric,        -- % سنوي
  risk_level text default 'low',  -- low | medium | high
  status text default 'active',   -- active | exited | suspended
  created_at timestamptz default now()
);

-- 5) عقود الإيجار والاستثمار
create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  waqf_id uuid references public.waqfs(id) on delete cascade not null,
  counterparty text not null,     -- المستأجر / الطرف الثاني
  asset_id uuid references public.assets(id) on delete set null,
  start_date date,
  end_date date,
  annual_rent numeric default 0,
  status text default 'active',   -- active | expired | suspended
  created_at timestamptz default now()
);

-- 6) الميزانيات
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  waqf_id uuid references public.waqfs(id) on delete cascade not null,
  name text not null,
  allocated numeric default 0,
  period text,                    -- مثال: الربع الثالث 2026
  status text default 'active',   -- active | closed
  created_at timestamptz default now()
);

-- 7) طلبات الاستشارات (شرعية/قانونية/مالية/فنية)
create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  waqf_id uuid references public.waqfs(id) on delete cascade not null,
  expert_name text,
  topic text not null,
  type text default 'sharia',     -- sharia | legal | financial | technical
  status text default 'under_review', -- under_review | scheduled | resolved
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- 8) طلبات طرح الصكوك (وقف باي مشيد — Marketplace)
create table if not exists public.listing_requests (
  id uuid primary key default gen_random_uuid(),
  waqf_id uuid references public.waqfs(id) on delete cascade not null,
  asset_id uuid references public.assets(id) on delete set null,
  target_funding numeric,
  price_per_share numeric,
  shares_count int,
  status text default 'pending',  -- pending | approved | trading | rejected
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ==========================================
-- RLS — نفس نمط النظام: مدير المنصة يرى الكل، وكل وقف يرى بياناته
-- ==========================================
alter table public.waqifs enable row level security;
alter table public.meetings enable row level security;
alter table public.decisions enable row level security;
alter table public.investments enable row level security;
alter table public.contracts enable row level security;
alter table public.budgets enable row level security;
alter table public.consultations enable row level security;
alter table public.listing_requests enable row level security;

-- ماكرو منطقي مكرر لكل جدول
-- read: platform admin أو صاحب الوقف
-- write: admin/supervisor
-- delete: admin فقط

create policy "waqifs read"   on public.waqifs for select using (public.is_platform_admin() or waqf_id = public.get_user_waqf_id());
create policy "waqifs insert" on public.waqifs for insert with check (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "waqifs update" on public.waqifs for update using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "waqifs delete" on public.waqifs for delete using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() = 'admin'));

create policy "meetings read"   on public.meetings for select using (public.is_platform_admin() or waqf_id = public.get_user_waqf_id());
create policy "meetings insert" on public.meetings for insert with check (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "meetings update" on public.meetings for update using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "meetings delete" on public.meetings for delete using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() = 'admin'));

create policy "decisions read"   on public.decisions for select using (public.is_platform_admin() or waqf_id = public.get_user_waqf_id());
create policy "decisions insert" on public.decisions for insert with check (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "decisions update" on public.decisions for update using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "decisions delete" on public.decisions for delete using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() = 'admin'));

create policy "investments read"   on public.investments for select using (public.is_platform_admin() or waqf_id = public.get_user_waqf_id());
create policy "investments insert" on public.investments for insert with check (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "investments update" on public.investments for update using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "investments delete" on public.investments for delete using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() = 'admin'));

create policy "contracts read"   on public.contracts for select using (public.is_platform_admin() or waqf_id = public.get_user_waqf_id());
create policy "contracts insert" on public.contracts for insert with check (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "contracts update" on public.contracts for update using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "contracts delete" on public.contracts for delete using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() = 'admin'));

create policy "budgets read"   on public.budgets for select using (public.is_platform_admin() or waqf_id = public.get_user_waqf_id());
create policy "budgets insert" on public.budgets for insert with check (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "budgets update" on public.budgets for update using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "budgets delete" on public.budgets for delete using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() = 'admin'));

create policy "consultations read"   on public.consultations for select using (public.is_platform_admin() or waqf_id = public.get_user_waqf_id());
create policy "consultations insert" on public.consultations for insert with check (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "consultations update" on public.consultations for update using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "consultations delete" on public.consultations for delete using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() = 'admin'));

create policy "listing read"   on public.listing_requests for select using (public.is_platform_admin() or waqf_id = public.get_user_waqf_id());
create policy "listing insert" on public.listing_requests for insert with check (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "listing update" on public.listing_requests for update using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')));
create policy "listing delete" on public.listing_requests for delete using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() = 'admin'));


-- >>>>>>>>>> 09_experts.sql
-- ==========================================
-- MASHEED ERP – MIGRATION V9
-- Experts directory (platform-level) + seed
-- ==========================================

create table if not exists public.experts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text,
  type text default 'sharia',      -- sharia | legal | financial | technical
  rating numeric default 5.0,
  available boolean default true,
  bio text,
  created_at timestamptz default now()
);

alter table public.experts enable row level security;

-- كل مستخدم مسجل يقرأ الدليل؛ الإدارة لمدير المنصة فقط
create policy "experts read" on public.experts for select
  using (auth.uid() is not null);
create policy "experts write" on public.experts for insert
  with check (public.is_platform_admin());
create policy "experts update" on public.experts for update
  using (public.is_platform_admin());
create policy "experts delete" on public.experts for delete
  using (public.is_platform_admin());

insert into public.experts (name, specialty, type, rating, available, bio) values
  ('الشيخ د. عبدالرحمن المطلق', 'صياغة وتوثيق صكوك الأوقاف والوصايا', 'sharia', 4.9, true, 'خبرة 20 عاماً في الفقه المالي والأوقاف.'),
  ('المستشار القانوني أحمد السديري', 'حوكمة مجالس النظارة واللوائح التشغيلية', 'legal', 4.8, true, 'مستشار قانوني معتمد لدى الهيئة العامة للأوقاف.'),
  ('د. سارة العتيبي', 'الاستثمار الوقفي وإدارة المحافظ المتوافقة مع الشريعة', 'financial', 4.9, true, 'دكتوراه في التمويل الإسلامي.'),
  ('المهندس خالد الغامدي', 'التقييم الفني العقاري وإدارة المشاريع الإنشائية', 'technical', 4.7, false, 'مقيّم عقاري معتمد (تقييم).')
on conflict do nothing;


-- >>>>>>>>>> 10_public_listings.sql
-- ==========================================
-- MASHEED ERP – MIGRATION V10
-- Public marketplace feed for وقف مَشيد (waqf-by-masheed /explore)
-- ==========================================

-- Only listings the System has approved for the market, and only the fields the
-- investment platform shows. The view runs with its owner's rights on purpose:
-- visitors are not members of any waqf, so the listing_requests RLS would hide
-- everything from them.
create or replace view public.public_listings as
select
  l.id,
  l.target_funding,
  l.price_per_share,
  l.shares_count,
  l.status,
  a.name            as asset_name,
  a.category::text  as asset_category,
  w.name            as waqf_name,
  l.created_at
from public.listing_requests l
join public.waqfs w on w.id = l.waqf_id
left join public.assets a on a.id = l.asset_id
where l.status in ('approved', 'trading');

revoke all on public.public_listings from public;
grant select on public.public_listings to anon, authenticated;

-- >>>>>>>>>> 11_contact_requests.sql
-- ==========================================
-- MASHEED ERP – MIGRATION V11
-- Contact form on masheedwaqf.com
-- ==========================================

create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  phone text not null check (phone ~ '^\+?[0-9]{9,15}$'),
  organization text not null check (char_length(organization) between 2 and 160),
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message text not null check (char_length(message) between 5 and 4000),
  status text not null default 'new',  -- new | contacted | closed
  created_at timestamptz default now()
);

alter table public.contact_requests enable row level security;

-- Anyone can send the form; nobody but the platform admin can read it back
create policy "contact insert" on public.contact_requests for insert
  to anon, authenticated
  with check (status = 'new');
create policy "contact read" on public.contact_requests for select
  using (public.is_platform_admin());
create policy "contact update" on public.contact_requests for update
  using (public.is_platform_admin());

grant insert on public.contact_requests to anon, authenticated;

-- >>>>>>>>>> 12_system_site_requests.sql
-- ==========================================
-- MASHEED ERP – MIGRATION V12
-- System website (system.masheedwaqf.com): contact topics + service requests
-- ==========================================

-- Contact form now runs on two sites; record which one and the chosen topic
alter table public.contact_requests add column if not exists topic text check (topic is null or char_length(topic) <= 80);
alter table public.contact_requests add column if not exists source text not null default 'gateway' check (source in ('gateway', 'system'));

-- Orders for fixed-price services and quote requests for scoped services.
-- Payment is not taken on the website: the team confirms the order and follows up.
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  service_id text not null check (char_length(service_id) between 1 and 40),
  service_title text not null check (char_length(service_title) <= 160),
  kind text not null check (kind in ('direct', 'request')),
  quantity int not null default 1 check (quantity between 1 and 20),
  unit_price numeric check (unit_price is null or unit_price >= 0),
  name text not null check (char_length(name) between 2 and 120),
  phone text not null check (phone ~ '^\+?[0-9]{9,15}$'),
  organization text not null check (char_length(organization) between 2 and 160),
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  waqf_size text check (waqf_size is null or char_length(waqf_size) <= 60),
  details text check (details is null or char_length(details) <= 4000),
  status text not null default 'new',  -- new | contacted | quoted | paid | in_progress | done | cancelled
  created_at timestamptz default now()
);

alter table public.service_requests enable row level security;

-- Anyone can place a request; only the platform admin reads and manages them
create policy "service req insert" on public.service_requests for insert
  to anon, authenticated
  with check (status = 'new');
create policy "service req read" on public.service_requests for select
  using (public.is_platform_admin());
create policy "service req update" on public.service_requests for update
  using (public.is_platform_admin());

grant insert on public.service_requests to anon, authenticated;

-- >>>>>>>>>> 13_investment_interests.sql
-- ==========================================
-- MASHEED ERP – MIGRATION V13
-- Waqf by Masheed (investment.masheedwaqf.com): register-interest requests
-- ==========================================

-- No money moves on the website. A visitor registers interest in a listed
-- opportunity (or in future opportunities, listing_id null) and the team follows up.
create table if not exists public.investment_interests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listing_requests(id) on delete set null,
  listing_title text check (listing_title is null or char_length(listing_title) <= 200),
  amount numeric check (amount is null or (amount > 0 and amount <= 100000000)),
  investor_type text not null default 'individual' check (investor_type in ('individual', 'entity', 'waqf')),
  name text not null check (char_length(name) between 2 and 120),
  phone text not null check (phone ~ '^\+?[0-9]{9,15}$'),
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message text check (message is null or char_length(message) <= 4000),
  status text not null default 'new',  -- new | contacted | closed
  created_at timestamptz default now()
);

alter table public.investment_interests enable row level security;

-- Anyone can register interest; only the platform admin reads and manages them
create policy "interest insert" on public.investment_interests for insert
  to anon, authenticated
  with check (status = 'new');
create policy "interest read" on public.investment_interests for select
  using (public.is_platform_admin());
create policy "interest update" on public.investment_interests for update
  using (public.is_platform_admin());

grant insert on public.investment_interests to anon, authenticated;


-- >>>>>>>>>> 14_platform_flow.sql
-- ==========================================
-- MASHEED ERP – MIGRATION V14
-- Platform flow: accounts + 15-day trial, onboarding, services catalog, packages,
-- Moyasar payments, consultant booking (Zego meetings), investment applications.
-- Also closes the profile hole that let a user edit their own role / platform-admin flag.
-- ==========================================

-- 0) Helpers are security definer so policies that call them don't recurse into RLS
create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_platform_admin from public.profiles where id = auth.uid()), false)
$$;

-- 1) ACCOUNTS — the customer (organization or waqf) that signs up, holds the trial and packages
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  phone text check (phone is null or phone ~ '^\+?[0-9]{9,15}$'),
  owner_id uuid references auth.users on delete set null,
  has_waqf boolean,                      -- null until the first-login question is answered
  trial_ends_at timestamptz not null default now() + interval '15 days',
  created_at timestamptz default now()
);

alter table public.profiles add column if not exists account_id uuid references public.accounts(id) on delete set null;
alter table public.waqfs add column if not exists account_id uuid references public.accounts(id) on delete set null;
alter table public.waqfs add column if not exists holding_type text check (holding_type is null or char_length(holding_type) <= 60);
alter table public.waqfs add column if not exists assets_range text check (assets_range is null or char_length(assets_range) <= 60);

-- Existing waqfs get an account each, so current users keep working
do $$
declare w record; acc uuid;
begin
  for w in select id, name from public.waqfs where account_id is null loop
    insert into public.accounts (name, has_waqf)
    values (left(case when char_length(coalesce(w.name, '')) >= 2 then w.name else 'وقف' end, 160), true)
    returning id into acc;
    update public.waqfs set account_id = acc where id = w.id;
    update public.profiles set account_id = acc where waqf_id = w.id and account_id is null;
  end loop;
end $$;

create or replace function public.get_user_account_id()
returns uuid language sql stable security definer set search_path = public as $$
  select account_id from public.profiles where id = auth.uid()
$$;

alter table public.accounts enable row level security;
create policy "accounts read" on public.accounts for select
  using (public.is_platform_admin() or id = public.get_user_account_id());
create policy "accounts update" on public.accounts for update
  using (public.is_platform_admin() or id = public.get_user_account_id());
-- Users may rename their account or change its phone; trial, owner and onboarding stay server-side
revoke all on public.accounts from anon, authenticated;
grant select on public.accounts to authenticated;
grant update (name, phone) on public.accounts to authenticated;

-- 2) PROFILES / WAQFS — tighten write access
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Waqf access: Profiles" on public.profiles;
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "profiles read" on public.profiles for select
  using (id = auth.uid() or public.is_platform_admin() or (waqf_id is not null and waqf_id = public.get_user_waqf_id()));
create policy "profiles update" on public.profiles for update
  using (id = auth.uid() or public.is_platform_admin());
-- Only the display name is user-editable; role, waqf, account and platform-admin are not
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;

drop policy if exists "Users can create a Waqf" on public.waqfs;
drop policy if exists "waqfs update" on public.waqfs;
create policy "waqfs update" on public.waqfs for update
  using (public.is_platform_admin() or (id = public.get_user_waqf_id() and public.my_role() = 'admin'));
revoke insert, update, delete on public.waqfs from anon, authenticated;
grant update (name, description, registration_number, total_shares, holding_type, assets_range) on public.waqfs to authenticated;

-- 3) SIGNUP — the new register form sends account_name + phone; invite flow unchanged
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_waqf_id uuid;
  new_acc uuid;
  waqf_name_text text;
  acc_name text;
  acc_phone text;
  invite_waqf uuid;
  req_role text;
begin
  waqf_name_text := new.raw_user_meta_data->>'waqf_name';
  acc_name := nullif(trim(new.raw_user_meta_data->>'account_name'), '');
  acc_phone := new.raw_user_meta_data->>'phone';
  invite_waqf := nullif(new.raw_user_meta_data->>'invite_waqf_id', '')::uuid;
  req_role := new.raw_user_meta_data->>'role';

  if invite_waqf is not null and exists (select 1 from public.waqfs where id = invite_waqf) then
    insert into public.profiles (id, full_name, waqf_id, account_id, role)
    values (
      new.id,
      new.raw_user_meta_data->>'full_name',
      invite_waqf,
      (select account_id from public.waqfs where id = invite_waqf),
      case
        when req_role in ('supervisor','auditor','viewer') then req_role::public.user_role
        else 'viewer'::public.user_role
      end
    );
    return new;
  end if;

  if acc_name is not null then
    insert into public.accounts (name, phone, owner_id)
    values (left(acc_name, 160), case when acc_phone ~ '^\+?[0-9]{9,15}$' then acc_phone end, new.id)
    returning id into new_acc;
    insert into public.profiles (id, full_name, account_id, role)
    values (new.id, coalesce(new.raw_user_meta_data->>'full_name', acc_name), new_acc, 'admin');
    return new;
  end if;

  -- Legacy path (old register form): account + waqf together
  if waqf_name_text is not null then
    insert into public.accounts (name, owner_id, has_waqf)
    values (left(case when char_length(waqf_name_text) >= 2 then waqf_name_text else 'وقف' end, 160), new.id, true)
    returning id into new_acc;
    insert into public.waqfs (name, account_id) values (waqf_name_text, new_acc) returning id into new_waqf_id;
  end if;

  insert into public.profiles (id, full_name, waqf_id, account_id, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new_waqf_id,
    new_acc,
    case when new_waqf_id is not null then 'admin'::public.user_role else 'viewer'::public.user_role end
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- 4) ONBOARDING — "do you have a waqf?" Yes creates the waqf; No can add one later
create or replace function public.complete_onboarding(
  p_has_waqf boolean,
  p_name text default null,
  p_holding_type text default null,
  p_assets_range text default null,
  p_registration text default null,
  p_description text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  acc uuid := public.get_user_account_id();
  wid uuid;
begin
  if acc is null then raise exception 'no_account'; end if;
  if not p_has_waqf then
    update public.accounts set has_waqf = coalesce(has_waqf, false) where id = acc;
    return null;
  end if;
  if (select waqf_id from public.profiles where id = auth.uid()) is not null then
    raise exception 'waqf_exists';
  end if;
  if char_length(coalesce(trim(p_name), '')) < 2 or char_length(p_name) > 160 then
    raise exception 'invalid_name';
  end if;
  insert into public.waqfs (name, account_id, holding_type, assets_range, registration_number, description)
  values (trim(p_name), acc, left(p_holding_type, 60), left(p_assets_range, 60),
          nullif(trim(left(p_registration, 60)), ''), nullif(trim(left(p_description, 2000)), ''))
  returning id into wid;
  update public.profiles set waqf_id = wid, role = 'admin' where id = auth.uid();
  update public.accounts set has_waqf = true where id = acc;
  return wid;
end;
$$;
revoke all on function public.complete_onboarding(boolean, text, text, text, text, text) from public, anon;
grant execute on function public.complete_onboarding(boolean, text, text, text, text, text) to authenticated;

-- 5) CATALOG — packages and services (admin-editable later; prices are VAT-inclusive SAR)
create table if not exists public.packages (
  id text primary key check (id ~ '^[a-z0-9_-]{2,40}$'),
  name text not null,
  users_label text,
  max_users int check (max_users is null or max_users > 0),   -- null = unlimited
  price numeric not null check (price >= 0),                   -- per year
  tier int not null check (tier between 1 and 9),              -- feature access is by tier
  free_sessions int not null default 0 check (free_sessions >= 0),
  features text[] not null default '{}',
  best boolean not null default false,
  sort int not null default 0,
  active boolean not null default true
);

create table if not exists public.services (
  id text primary key check (id ~ '^[a-z0-9_-]{2,40}$'),
  title text not null,
  subtitle text,
  description text,
  includes text[] not null default '{}',
  price_label text,
  pricing text not null check (pricing in ('quote', 'fixed', 'booking')),
  price numeric check (price is null or price >= 0),
  package_id text references public.packages(id),   -- a fixed service that also opens a package
  package_months int check (package_months is null or package_months between 1 and 36),
  icon text,
  sort int not null default 0,
  active boolean not null default true,
  check (pricing = 'quote' or price is not null)
);

insert into public.packages (id, name, users_label, max_users, price, tier, free_sessions, best, sort, features) values
  ('basic', 'الأساسية', 'من 1 إلى 3 مستخدمين', 3, 5900, 1, 0, false, 1,
    array['إدارة بيانات وأصول الوقف','المستفيدون والالتزامات','الإدارة المالية والتوزيعات','العقود والوثائق والحوكمة','سجل تتبع كامل للإجراءات','تقارير قابلة للتصدير']),
  ('advanced', 'المتقدمة', 'من 1 إلى 7 مستخدمين', 7, 12900, 2, 2, true, 2,
    array['كل مزايا الأساسية','المساعد الذكي بحد استخدام','جلستان استشاريتان مجانيتان','إشعارات المستفيدين عند التوزيع','استجابة خلال 4 ساعات عمل']),
  ('extended', 'الموسعة', 'بلا حد للمستخدمين أو المستفيدين', null, 19900, 3, 4, false, 3,
    array['كل مزايا المتقدمة','مساعد ذكي بحد استخدام أعلى','أربع جلسات استشارية مجانية','إعداد الحساب وإدخال البيانات الأولية','جلسات تدريب مباشرة'])
on conflict (id) do nothing;

insert into public.services (id, title, subtitle, description, includes, price_label, pricing, price, package_id, package_months, icon, sort) values
  ('establish', 'التأسيس', 'وقف جديد بخطوات واضحة',
    'نرافقك في تأسيس وقفك من دراسة المشروع وصياغة الوثيقة إلى توثيقه وتسجيله لدى الجهات المختصة.',
    array['قبل التأسيس: دراسة المشروع والأنظمة وصياغة الوثيقة وتجهيز المستندات','التأسيس: توثيق الوقف وتسجيله لدى الجهات المختصة','بالتعاون مع شريك قانوني مرخص، ويشمل تأسيس الوقف النقدي'],
    'السعر: حسب حالتك', 'quote', null, null, null, 'layers', 1),
  ('evaluation', 'التقييم', 'تقييم الأداء المالي والتشغيلي',
    'تقييم شامل لوضع الجهة المالي والتشغيلي يحدد نقاط التحسين وفرص التطوير.',
    array['تحليل الوضع المالي والتشغيلي للجهة','تحديد نقاط التحسين','تحديد فرص التطوير'],
    'السعر: حسب حالتك', 'quote', null, null, null, 'report', 2),
  ('consulting', 'الاستشارات', 'رأي متخصص قبل القرار',
    'جلسة مرئية مدتها 30 دقيقة مع مستشار متخصص، تحجز موعدها من داخل المنصة.',
    array['استشارة مالية','استشارة شرعية','استشارة قانونية، بالتعاون مع شريك قانوني مرخص'],
    '199 ريال للجلسة (30 دقيقة)', 'booking', 199, null, null, 'message', 3),
  ('followup', 'المتابعة التنفيذية', 'متابعة خطة العمل طوال العام',
    'متابعة تنفيذ خطة العمل مع فريق الجهة على مدار عام كامل، مع اشتراك في إحدى باقات النظام.',
    array['تقييم أولي وخطة متابعة وتحديد الأولويات','متابعة التنفيذ مع فريق الجهة، وأربعة اجتماعات وأربعة تقارير ربع سنوية','تشمل اشتراكًا في إحدى الباقات'],
    '55,000 ريال سنويًا (شامل الضريبة)', 'fixed', 55000, 'advanced', 12, 'trendingUp', 4)
on conflict (id) do nothing;

alter table public.packages enable row level security;
alter table public.services enable row level security;
create policy "packages read" on public.packages for select using (active or public.is_platform_admin());
create policy "packages admin" on public.packages for all using (public.is_platform_admin()) with check (public.is_platform_admin());
create policy "services read" on public.services for select using (active or public.is_platform_admin());
create policy "services admin" on public.services for all using (public.is_platform_admin()) with check (public.is_platform_admin());
grant select on public.packages, public.services to anon, authenticated;
grant insert, update, delete on public.packages, public.services to authenticated;

-- 6) SUBSCRIPTIONS — written by the server after a verified payment, or by the admin
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  package_id text not null references public.packages(id),
  source text not null check (source in ('purchase', 'service', 'admin')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  payment_id uuid,
  created_at timestamptz default now(),
  check (ends_at > starts_at)
);
create index if not exists subscriptions_account on public.subscriptions(account_id, ends_at);
alter table public.subscriptions enable row level security;
create policy "subs read" on public.subscriptions for select
  using (public.is_platform_admin() or account_id = public.get_user_account_id());
create policy "subs admin" on public.subscriptions for all
  using (public.is_platform_admin()) with check (public.is_platform_admin());
revoke all on public.subscriptions from anon;
grant select, insert, update, delete on public.subscriptions to authenticated;

-- 7) PAYMENTS — one row per Moyasar checkout; only the server writes (after verifying with Moyasar)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  purpose text not null check (purpose in ('service', 'package', 'booking')),
  ref_id text not null,                  -- service_requests.id | packages.id | bookings.id
  amount_halalas int not null check (amount_halalas >= 100),
  description text not null,
  status text not null default 'initiated' check (status in ('initiated', 'paid', 'failed')),
  moyasar_id text unique,
  created_by uuid references auth.users on delete set null,
  created_at timestamptz default now(),
  paid_at timestamptz
);
create index if not exists payments_account on public.payments(account_id, created_at desc);
alter table public.payments enable row level security;
create policy "payments read" on public.payments for select
  using (public.is_platform_admin() or account_id = public.get_user_account_id());
revoke all on public.payments from anon, authenticated;
grant select on public.payments to authenticated;

-- 8) SERVICE REQUESTS — the same table serves the website form and in-platform requests
alter table public.service_requests add column if not exists account_id uuid references public.accounts(id) on delete set null;
alter table public.service_requests add column if not exists org_type text check (org_type is null or char_length(org_type) <= 60);
alter table public.service_requests add column if not exists holding_type text check (holding_type is null or char_length(holding_type) <= 60);
alter table public.service_requests add column if not exists consult_type text check (consult_type is null or char_length(consult_type) <= 60);
alter table public.service_requests add column if not exists preferred_time text check (preferred_time is null or char_length(preferred_time) <= 120);
alter table public.service_requests add column if not exists quote_amount numeric check (quote_amount is null or quote_amount >= 1);
alter table public.service_requests add column if not exists quote_note text check (quote_note is null or char_length(quote_note) <= 4000);
alter table public.service_requests add column if not exists quoted_at timestamptz;
alter table public.service_requests add column if not exists paid_at timestamptz;
alter table public.service_requests add column if not exists created_by uuid references auth.users on delete set null default auth.uid();
create index if not exists service_requests_account on public.service_requests(account_id, created_at desc);

drop policy if exists "service req insert" on public.service_requests;
create policy "service req insert" on public.service_requests for insert
  to anon, authenticated
  with check (
    status = 'new' and quote_amount is null and quoted_at is null and paid_at is null
    and (account_id is null or account_id = public.get_user_account_id())
  );
drop policy if exists "service req read" on public.service_requests;
create policy "service req read" on public.service_requests for select
  using (public.is_platform_admin() or (account_id is not null and account_id = public.get_user_account_id()));
grant select on public.service_requests to authenticated;

-- 9) CONSULTANTS — per-consultant weekly availability (default Sun–Thu 09:00–17:00 Riyadh)
alter table public.experts add column if not exists slot_minutes int not null default 30 check (slot_minutes between 15 and 120);

create table if not exists public.expert_availability (
  id uuid primary key default gen_random_uuid(),
  expert_id uuid not null references public.experts(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),   -- 0 = Sunday … 6 = Saturday
  start_time time not null,
  end_time time not null,
  check (end_time > start_time)
);
create index if not exists expert_availability_expert on public.expert_availability(expert_id, weekday);

insert into public.expert_availability (expert_id, weekday, start_time, end_time)
select e.id, d, '09:00', '17:00' from public.experts e cross join generate_series(0, 4) d
where not exists (select 1 from public.expert_availability a where a.expert_id = e.id);

create or replace function public.expert_default_availability()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.expert_availability (expert_id, weekday, start_time, end_time)
  select new.id, d, '09:00', '17:00' from generate_series(0, 4) d;
  return new;
end;
$$;
drop trigger if exists expert_default_availability on public.experts;
create trigger expert_default_availability after insert on public.experts
  for each row execute procedure public.expert_default_availability();

alter table public.expert_availability enable row level security;
create policy "availability read" on public.expert_availability for select using (auth.uid() is not null);
create policy "availability admin" on public.expert_availability for all
  using (public.is_platform_admin()) with check (public.is_platform_admin());
grant select, insert, update, delete on public.expert_availability to authenticated;

-- 10) BOOKINGS — a 30-minute slot with one consultant; held 15 minutes while the user pays
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  expert_id uuid not null references public.experts(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  topic text check (topic is null or char_length(topic) <= 1000),
  status text not null default 'pending_payment' check (status in ('pending_payment', 'confirmed', 'cancelled', 'done')),
  hold_until timestamptz,
  paid_via text check (paid_via is null or paid_via in ('payment', 'package', 'admin')),
  room_code text unique check (room_code is null or room_code ~ '^[a-f0-9]{32}$'),
  created_by uuid references auth.users on delete set null,
  created_at timestamptz default now(),
  check (ends_at > starts_at)
);
create unique index if not exists bookings_slot_taken on public.bookings(expert_id, starts_at)
  where status in ('pending_payment', 'confirmed');
create index if not exists bookings_account on public.bookings(account_id, starts_at desc);

alter table public.bookings enable row level security;
create policy "bookings read" on public.bookings for select
  using (public.is_platform_admin() or account_id = public.get_user_account_id());
create policy "bookings admin" on public.bookings for update
  using (public.is_platform_admin());
revoke all on public.bookings from anon, authenticated;
grant select, update on public.bookings to authenticated;

-- Busy slots of one consultant (no details of who booked)
create or replace function public.expert_busy_slots(p_expert uuid, p_from timestamptz, p_to timestamptz)
returns setof timestamptz language sql stable security definer set search_path = public as $$
  select starts_at from public.bookings
  where expert_id = p_expert and starts_at >= p_from and starts_at < p_to
    and (status = 'confirmed' or (status = 'pending_payment' and hold_until > now()))
$$;
revoke all on function public.expert_busy_slots(uuid, timestamptz, timestamptz) from public, anon;
grant execute on function public.expert_busy_slots(uuid, timestamptz, timestamptz) to authenticated;

-- Book a slot. Uses a free package session when one is left; otherwise holds it for payment.
create or replace function public.book_consultation(p_expert uuid, p_starts timestamptz, p_topic text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  acc uuid := public.get_user_account_id();
  ex record;
  loc timestamp;
  free_left int;
  bid uuid;
begin
  if acc is null then raise exception 'no_account'; end if;
  select id, available, slot_minutes into ex from public.experts where id = p_expert;
  if ex.id is null or not ex.available then raise exception 'expert_unavailable'; end if;
  if p_starts < now() + interval '1 hour' or p_starts > now() + interval '60 days' then
    raise exception 'slot_out_of_range';
  end if;
  loc := p_starts at time zone 'Asia/Riyadh';
  if extract(second from loc) <> 0 or (extract(hour from loc) * 60 + extract(minute from loc))::int % ex.slot_minutes <> 0 then
    raise exception 'slot_invalid';
  end if;
  if not exists (
    select 1 from public.expert_availability a
    where a.expert_id = p_expert and a.weekday = extract(dow from loc)::int
      and loc::time >= a.start_time and (loc + make_interval(mins => ex.slot_minutes))::time <= a.end_time
      and (loc + make_interval(mins => ex.slot_minutes))::time > a.start_time
  ) then
    raise exception 'slot_invalid';
  end if;

  -- Release this slot if an earlier hold on it expired unpaid
  update public.bookings set status = 'cancelled'
  where expert_id = p_expert and starts_at = p_starts and status = 'pending_payment' and hold_until <= now();

  -- Free sessions from the best active package, minus those already used in its period
  select coalesce(max(p.free_sessions - (
           select count(*) from public.bookings b
           where b.account_id = acc and b.paid_via = 'package' and b.status <> 'cancelled'
             and b.created_at >= s.starts_at)), 0)
    into free_left
  from public.subscriptions s join public.packages p on p.id = s.package_id
  where s.account_id = acc and now() between s.starts_at and s.ends_at;

  begin
    if free_left > 0 then
      insert into public.bookings (account_id, expert_id, starts_at, ends_at, topic, status, paid_via, room_code, created_by)
      values (acc, p_expert, p_starts, p_starts + make_interval(mins => ex.slot_minutes), nullif(trim(left(p_topic, 1000)), ''),
              'confirmed', 'package', replace(gen_random_uuid()::text, '-', ''), auth.uid())
      returning id into bid;
    else
      insert into public.bookings (account_id, expert_id, starts_at, ends_at, topic, status, hold_until, created_by)
      values (acc, p_expert, p_starts, p_starts + make_interval(mins => ex.slot_minutes), nullif(trim(left(p_topic, 1000)), ''),
              'pending_payment', now() + interval '15 minutes', auth.uid())
      returning id into bid;
    end if;
  exception when unique_violation then
    raise exception 'slot_taken';
  end;
  return bid;
end;
$$;
revoke all on function public.book_consultation(uuid, timestamptz, text) from public, anon;
grant execute on function public.book_consultation(uuid, timestamptz, text) to authenticated;

-- 11) INVESTMENT PLATFORM APPLICATIONS — extend listing_requests; reviewed by the admin
alter table public.listing_requests add column if not exists title text check (title is null or char_length(title) <= 160);
alter table public.listing_requests add column if not exists category text check (category is null or category in ('real_estate', 'agricultural', 'education', 'health', 'investment', 'other'));
alter table public.listing_requests add column if not exists description text check (description is null or char_length(description) <= 6000);
alter table public.listing_requests add column if not exists city text check (city is null or char_length(city) <= 80);
alter table public.listing_requests add column if not exists expected_return text check (expected_return is null or char_length(expected_return) <= 80);
alter table public.listing_requests add column if not exists duration_months int check (duration_months is null or duration_months between 1 and 600);
alter table public.listing_requests add column if not exists contact_name text check (contact_name is null or char_length(contact_name) <= 120);
alter table public.listing_requests add column if not exists contact_phone text check (contact_phone is null or contact_phone ~ '^\+?[0-9]{9,15}$');
alter table public.listing_requests add column if not exists documents text[] not null default '{}';
alter table public.listing_requests add column if not exists review_note text check (review_note is null or char_length(review_note) <= 4000);
alter table public.listing_requests add column if not exists reviewed_at timestamptz;

-- Waqf members may submit (pending) and edit only while pending; approval is the admin's
drop policy if exists "listing insert" on public.listing_requests;
drop policy if exists "listing update" on public.listing_requests;
drop policy if exists "listing delete" on public.listing_requests;
create policy "listing insert" on public.listing_requests for insert with check (
  public.is_platform_admin()
  or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor')
      and status = 'pending' and review_note is null and reviewed_at is null));
create policy "listing update" on public.listing_requests for update
  using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor') and status = 'pending'))
  with check (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and status = 'pending' and review_note is null and reviewed_at is null));
create policy "listing delete" on public.listing_requests for delete
  using (public.is_platform_admin() or (waqf_id = public.get_user_waqf_id() and public.my_role() = 'admin' and status = 'pending'));

-- The investment site now shows the application's own title, category and terms
create or replace view public.public_listings as
select
  l.id,
  l.target_funding,
  l.price_per_share,
  l.shares_count,
  l.status,
  a.name            as asset_name,
  a.category::text  as asset_category,
  w.name            as waqf_name,
  l.created_at,
  l.title,
  l.category,
  l.description,
  l.city,
  l.expected_return,
  l.duration_months
from public.listing_requests l
join public.waqfs w on w.id = l.waqf_id
left join public.assets a on a.id = l.asset_id
where l.status in ('approved', 'trading');

revoke all on public.public_listings from public;
grant select on public.public_listings to anon, authenticated;

-- Application documents: private bucket, one folder per waqf
insert into storage.buckets (id, name, public, file_size_limit)
values ('listing-docs', 'listing-docs', false, 10485760)
on conflict (id) do nothing;

drop policy if exists "listing docs read" on storage.objects;
drop policy if exists "listing docs insert" on storage.objects;
drop policy if exists "listing docs delete" on storage.objects;
create policy "listing docs read" on storage.objects for select to authenticated
  using (bucket_id = 'listing-docs' and (public.is_platform_admin() or (storage.foldername(name))[1] = public.get_user_waqf_id()::text));
create policy "listing docs insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-docs' and (storage.foldername(name))[1] = public.get_user_waqf_id()::text
              and public.my_role() in ('admin','supervisor'));
create policy "listing docs delete" on storage.objects for delete to authenticated
  using (bucket_id = 'listing-docs' and (public.is_platform_admin() or ((storage.foldername(name))[1] = public.get_user_waqf_id()::text and public.my_role() = 'admin')));

-- 12) ACCESS — one call for the app's gate: onboarding state, waqf, trial and best active package
create or replace function public.my_access()
returns table (
  account_id uuid, has_waqf boolean, waqf_id uuid, is_admin boolean,
  trial_ends_at timestamptz, tier int, package_id text, package_ends_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select p.account_id, a.has_waqf, p.waqf_id, coalesce(p.is_platform_admin, false), a.trial_ends_at,
         s.tier, s.package_id, s.ends_at
  from public.profiles p
  left join public.accounts a on a.id = p.account_id
  left join lateral (
    select k.tier, s.package_id, s.ends_at
    from public.subscriptions s join public.packages k on k.id = s.package_id
    where s.account_id = p.account_id and now() >= s.starts_at and now() < s.ends_at
    order by k.tier desc, s.ends_at desc
    limit 1
  ) s on true
  where p.id = auth.uid()
$$;
revoke all on function public.my_access() from public, anon;
grant execute on function public.my_access() to authenticated;
