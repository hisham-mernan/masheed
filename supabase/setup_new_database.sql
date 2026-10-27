-- ==========================================
-- MASHEED — FULL DATABASE SETUP (fresh Supabase project)
-- Generated from supabase/migrations/ (initial_schema → 13) in order.
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

