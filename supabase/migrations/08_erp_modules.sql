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
