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
