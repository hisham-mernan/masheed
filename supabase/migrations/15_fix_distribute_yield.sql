-- ============================================================
-- 15: restore the distribution engine used by execute_approval
-- execute_approval (06) calls distribute_yield(amount, waqf_id), but only the
-- one-argument version was ever created (03) and 05 dropped it, so every
-- approved distribution failed on execute.
-- Run on the Masheed project only.
-- ============================================================

drop function if exists public.distribute_yield(numeric, uuid);

create function public.distribute_yield(p_amount numeric, p_waqf_id uuid)
returns uuid as $$
declare
  v_total_shares numeric;
  v_available numeric;
  v_dist_id uuid;
  b record;
  v_payout numeric;
begin
  -- Permission and waqf checks happen in execute_approval, the only caller.
  if p_waqf_id is null then
    raise exception 'لم يُحدَّد الوقف';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'المبلغ يجب أن يكون أكبر من صفر';
  end if;

  -- Available yield = income (Ri'a) - previous distributions
  select coalesce(sum(amount) filter (where type = 'income' and is_yield), 0)
       - coalesce(sum(amount) filter (where type = 'distribution'), 0)
    into v_available
    from public.transactions
   where waqf_id = p_waqf_id;

  if p_amount > v_available then
    raise exception 'المبلغ يتجاوز الريع المتاح للتوزيع (% ر.س)', v_available;
  end if;

  select total_shares into v_total_shares from public.waqfs where id = p_waqf_id;
  if coalesce(v_total_shares, 0) <= 0 then
    raise exception 'الوقف بدون أسهم (total_shares = 0)';
  end if;

  insert into public.distributions (waqf_id, total_amount, status)
  values (p_waqf_id, p_amount, 'pending')
  returning id into v_dist_id;

  for b in
    select id, shares_owned from public.beneficiaries
    where waqf_id = p_waqf_id and status = 'active' and shares_owned > 0
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
  values (p_waqf_id, p_amount, 'distribution', 'distribution', false,
          'توزيع ريع آلي على المستفيدين حسب الأسهم', 'DIST-' || v_dist_id::text);

  update public.distributions set status = 'completed' where id = v_dist_id;
  return v_dist_id;
end;
$$ language plpgsql security definer set search_path = public;

-- Not callable from the API: a direct call would skip maker-checker approval.
-- execute_approval runs as the function owner, so it can still call it.
revoke all on function public.distribute_yield(numeric, uuid) from public, anon, authenticated;
