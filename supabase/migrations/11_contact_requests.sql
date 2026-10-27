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
