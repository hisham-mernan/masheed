-- ============================================================
-- 18: waqf profile — GAW registration, deed, size tier, nazirs, bank accounts
-- Gives the system the data the GAW rules are checked against:
--   R01/R02 registration and certificate dates, R04 bank account in the waqf's
--   name, R14/R15 nazir eligibility and court appointment. The size tier decides
--   which rules apply (large ≥ SAR 200m, medium 50–200m, small < 50m, direct use).
-- Also: audit rows now carry the changed row's waqf (not the editor's), and
-- budgets, investments, contracts and decisions are audited like the rest.
-- Run on the Masheed project only.
-- ============================================================

-- 1) Waqf profile fields
alter table public.waqfs add column if not exists size_tier text
  check (size_tier is null or size_tier in ('large', 'medium', 'small', 'direct_use'));
alter table public.waqfs add column if not exists deed_number text check (deed_number is null or char_length(deed_number) <= 60);
alter table public.waqfs add column if not exists deed_date date;
alter table public.waqfs add column if not exists deed_court text check (deed_court is null or char_length(deed_court) <= 120);
alter table public.waqfs add column if not exists gaw_registered_at date;
alter table public.waqfs add column if not exists gaw_certificate_expires date;
alter table public.waqfs add column if not exists purposes text check (purposes is null or char_length(purposes) <= 4000);

grant update (name, description, registration_number, total_shares, holding_type, assets_range,
              type, size_tier, deed_number, deed_date, deed_court, gaw_registered_at, gaw_certificate_expires, purposes)
  on public.waqfs to authenticated;

-- Who may change a waqf's own registers: its admin, or a platform admin
create or replace function public.is_waqf_admin(p_waqf uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_platform_admin()
      or exists (select 1 from public.profiles where id = auth.uid() and waqf_id = p_waqf and role = 'admin')
$$;
revoke all on function public.is_waqf_admin(uuid) from public, anon;
grant execute on function public.is_waqf_admin(uuid) to authenticated;

-- 2) Nazirs (R14 eligibility and residency, R15 court appointment, powers and fees)
create table if not exists public.waqf_nazirs (
  id uuid primary key default gen_random_uuid(),
  waqf_id uuid not null references public.waqfs(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 160),
  kind text not null default 'individual' check (kind in ('individual', 'entity')),
  national_id text check (national_id is null or national_id ~ '^[0-9]{10}$'),
  nationality text check (nationality is null or char_length(nationality) <= 60),
  saudi_resident boolean not null default true,
  appointment_court text check (appointment_court is null or char_length(appointment_court) <= 120),
  appointment_ref text check (appointment_ref is null or char_length(appointment_ref) <= 60),
  appointed_at date,
  term_ends date,
  powers text check (powers is null or char_length(powers) <= 2000),
  fee_basis text check (fee_basis is null or char_length(fee_basis) <= 500),
  status text not null default 'active' check (status in ('active', 'ended')),
  ended_at date,
  created_by uuid references auth.users on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  check (term_ends is null or appointed_at is null or term_ends >= appointed_at)
);
create index if not exists waqf_nazirs_waqf on public.waqf_nazirs(waqf_id, status);

-- 3) Bank accounts in the waqf's name (R04, R05; R27 for a fundraising account)
create table if not exists public.waqf_bank_accounts (
  id uuid primary key default gen_random_uuid(),
  waqf_id uuid not null references public.waqfs(id) on delete cascade,
  bank_name text not null check (char_length(bank_name) between 2 and 80),
  account_name text not null check (char_length(account_name) between 2 and 160),
  iban text not null check (iban ~ '^SA[0-9]{22}$'),
  purpose text not null default 'main' check (purpose in ('main', 'fundraising', 'other')),
  opened_at date,
  status text not null default 'active' check (status in ('active', 'closed')),
  closed_at date,
  created_by uuid references auth.users on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  unique (waqf_id, iban)
);
create index if not exists waqf_bank_accounts_waqf on public.waqf_bank_accounts(waqf_id, status);

alter table public.waqf_nazirs enable row level security;
alter table public.waqf_bank_accounts enable row level security;

drop policy if exists "nazirs read" on public.waqf_nazirs;
drop policy if exists "nazirs write" on public.waqf_nazirs;
create policy "nazirs read" on public.waqf_nazirs for select
  using (public.is_platform_admin() or waqf_id = public.get_user_waqf_id());
create policy "nazirs write" on public.waqf_nazirs for all
  using (public.is_waqf_admin(waqf_id)) with check (public.is_waqf_admin(waqf_id));

drop policy if exists "bank accounts read" on public.waqf_bank_accounts;
drop policy if exists "bank accounts write" on public.waqf_bank_accounts;
create policy "bank accounts read" on public.waqf_bank_accounts for select
  using (public.is_platform_admin() or waqf_id = public.get_user_waqf_id());
create policy "bank accounts write" on public.waqf_bank_accounts for all
  using (public.is_waqf_admin(waqf_id)) with check (public.is_waqf_admin(waqf_id));

revoke all on public.waqf_nazirs, public.waqf_bank_accounts from anon, authenticated;
grant select, insert, update on public.waqf_nazirs, public.waqf_bank_accounts to authenticated;
-- Records are ended or closed, never deleted (records are kept 10 years, R22)

-- 4) Audit: log the changed row's waqf, and cover every waqf register
create or replace function public.log_changes()
returns trigger as $$
declare
  rec jsonb := to_jsonb(coalesce(NEW, OLD));
begin
  insert into public.audit_logs (user_id, waqf_id, action, entity_type, entity_id, changes)
  values (
    auth.uid(),
    coalesce(
      case when TG_TABLE_NAME = 'waqfs' then (rec->>'id')::uuid else (rec->>'waqf_id')::uuid end,
      (select waqf_id from public.profiles where id = auth.uid())
    ),
    TG_OP,
    TG_TABLE_NAME,
    (rec->>'id')::uuid,
    case
      when TG_OP = 'INSERT' then jsonb_build_object('new', to_jsonb(NEW))
      when TG_OP = 'UPDATE' then jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
      else jsonb_build_object('old', to_jsonb(OLD))
    end
  );
  return null;
end;
$$ language plpgsql security definer set search_path = public;

do $$
declare t text;
begin
  foreach t in array array['waqfs', 'waqf_nazirs', 'waqf_bank_accounts', 'budgets', 'investments', 'contracts', 'decisions', 'meetings', 'waqifs']
  loop
    execute format('drop trigger if exists audit_%1$s on public.%1$I', t);
    execute format('create trigger audit_%1$s after insert or update or delete on public.%1$I for each row execute procedure public.log_changes()', t);
  end loop;
end $$;
