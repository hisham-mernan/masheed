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
