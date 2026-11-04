-- ============================================================
-- 17: invites are one-time codes issued by the waqf's admin
-- Until now the sign-up trigger trusted an invite_waqf_id sent with the sign-up
-- request, so anyone who knew a waqf's id could join it as a supervisor.
-- Now an admin creates an invite for one email; sign-up must present its code,
-- with that same email, before it expires, and the code works once.
-- Run on the Masheed project only.
-- ============================================================

create table if not exists public.waqf_invites (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  waqf_id uuid not null references public.waqfs(id) on delete cascade,
  email text not null check (email = lower(email) and char_length(email) <= 254),
  role public.user_role not null check (role in ('supervisor', 'auditor', 'viewer')),
  created_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  used_at timestamptz,
  used_by uuid references auth.users on delete set null
);
create index if not exists waqf_invites_waqf on public.waqf_invites(waqf_id, created_at desc);

-- Only the functions below touch invites; nothing is readable from the API
alter table public.waqf_invites enable row level security;
revoke all on public.waqf_invites from anon, authenticated;

-- The waqf's admin (or a platform admin) issues an invite and gets its code back
create or replace function public.create_waqf_invite(p_waqf uuid, p_email text, p_role text)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(trim(p_email));
  v_code text;
begin
  if not (public.is_platform_admin()
          or exists (select 1 from public.profiles where id = auth.uid() and waqf_id = p_waqf and role = 'admin')) then
    raise exception 'not_allowed';
  end if;
  if v_email is null or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'email_invalid'; end if;
  if p_role not in ('supervisor', 'auditor', 'viewer') then raise exception 'role_invalid'; end if;
  insert into public.waqf_invites (waqf_id, email, role, created_by)
  values (p_waqf, v_email, p_role::public.user_role, auth.uid())
  returning code into v_code;
  return v_code;
end;
$$;
revoke all on function public.create_waqf_invite(uuid, text, text) from public, anon;
grant execute on function public.create_waqf_invite(uuid, text, text) to authenticated;

-- SIGN-UP — same as 14, except joining a waqf now needs a valid invite code
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_waqf_id uuid;
  new_acc uuid;
  waqf_name_text text;
  acc_name text;
  acc_phone text;
  invite_code text;
  inv record;
begin
  waqf_name_text := new.raw_user_meta_data->>'waqf_name';
  acc_name := nullif(trim(new.raw_user_meta_data->>'account_name'), '');
  acc_phone := new.raw_user_meta_data->>'phone';
  invite_code := nullif(trim(new.raw_user_meta_data->>'invite_code'), '');

  if invite_code is not null then
    select * into inv from public.waqf_invites
    where code = invite_code and used_at is null and expires_at > now() and email = lower(new.email)
    for update;
    if inv.id is null then raise exception 'invite_invalid'; end if;
    update public.waqf_invites set used_at = now(), used_by = new.id where id = inv.id;
    insert into public.profiles (id, full_name, waqf_id, account_id, role)
    values (
      new.id,
      new.raw_user_meta_data->>'full_name',
      inv.waqf_id,
      (select account_id from public.waqfs where id = inv.waqf_id),
      inv.role
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
