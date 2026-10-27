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
