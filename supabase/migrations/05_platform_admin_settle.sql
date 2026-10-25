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
