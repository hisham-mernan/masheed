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
