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
