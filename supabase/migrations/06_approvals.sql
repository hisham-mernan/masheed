-- ==========================================
-- MASHEED ERP – MIGRATION V6
-- Maker–Checker approval engine
-- التوزيع والتسوية يصبحان طلبات تمر بمعتمد مختلف عن المنشئ
-- ==========================================

-- 1. Approval requests table
create table if not exists public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  waqf_id uuid references public.waqfs(id) not null,
  type text not null check (type in ('distribute_yield', 'settle_wallets')),
  amount numeric(20,2),                     -- للتوزيع؛ null للتسوية
  status text not null default 'pending' check (status in ('pending','approved','rejected','executed','cancelled')),
  created_by uuid references public.profiles(id) not null,
  created_at timestamptz default now(),
  decided_by uuid references public.profiles(id),
  decided_at timestamptz,
  decision_note text,
  executed_by uuid references public.profiles(id),
  executed_at timestamptz,
  result jsonb                              -- نتيجة التنفيذ (مثلاً distribution_id)
);

alter table public.approval_requests enable row level security;

-- قراءة: أعضاء الوقف + مدير المنصة
create policy "approvals read" on public.approval_requests for select
  using (public.is_platform_admin() or waqf_id = public.get_user_waqf_id());

-- إنشاء: المدير والمشرف فقط (Maker)
create policy "approvals insert" on public.approval_requests for insert
  with check ((public.is_platform_admin() or waqf_id = public.get_user_waqf_id())
              and public.my_role() in ('admin','supervisor'));

-- لا تحديث مباشر: القرار والتنفيذ عبر RPC فقط (Security Definer)

drop trigger if exists audit_approvals on public.approval_requests;
create trigger audit_approvals after insert or update or delete on public.approval_requests
  for each row execute procedure public.log_changes();

-- 2. قرار الاعتماد (Checker) — يجب أن يكون شخصاً مختلفاً عن المنشئ
create or replace function public.decide_approval(p_id uuid, p_decision text, p_note text default null)
returns uuid as $$
declare
  v_req public.approval_requests%rowtype;
begin
  select * into v_req from public.approval_requests where id = p_id;
  if not found then raise exception 'الطلب غير موجود'; end if;

  if not (public.is_platform_admin() or v_req.waqf_id = public.get_user_waqf_id()) then
    raise exception 'غير مصرح: الطلب ليس ضمن وقفك';
  end if;
  if public.my_role() not in ('admin','supervisor') then
    raise exception 'غير مصرح: الاعتماد متاح للمدير والمشرف فقط';
  end if;
  if v_req.status <> 'pending' then
    raise exception 'لا يمكن اتخاذ قرار: حالة الطلب "%"', v_req.status;
  end if;
  if v_req.created_by = auth.uid() then
    raise exception 'مبدأ الفصل بين المهام: لا يمكنك اعتماد طلب أنشأته بنفسك — يجب أن يعتمد شخص آخر';
  end if;
  if p_decision not in ('approved','rejected') then
    raise exception 'قرار غير صالح';
  end if;

  update public.approval_requests
     set status = p_decision,
         decided_by = auth.uid(),
         decided_at = now(),
         decision_note = p_note
   where id = p_id;

  return p_id;
end;
$$ language plpgsql security definer;

-- 3. تنفيذ طلب معتمد
create or replace function public.execute_approval(p_id uuid)
returns jsonb as $$
declare
  v_req public.approval_requests%rowtype;
  v_result jsonb;
  v_dist uuid;
  v_count integer;
begin
  select * into v_req from public.approval_requests where id = p_id;
  if not found then raise exception 'الطلب غير موجود'; end if;

  if not (public.is_platform_admin() or v_req.waqf_id = public.get_user_waqf_id()) then
    raise exception 'غير مصرح: الطلب ليس ضمن وقفك';
  end if;
  if public.my_role() not in ('admin','supervisor') then
    raise exception 'غير مصرح: التنفيذ متاح للمدير والمشرف فقط';
  end if;
  if v_req.status = 'executed' then
    raise exception 'هذا الطلب نُفّذ بالفعل';
  end if;
  if v_req.status <> 'approved' then
    raise exception 'لا يمكن التنفيذ قبل الاعتماد (الحالة الحالية: %)', v_req.status;
  end if;

  if v_req.type = 'distribute_yield' then
    v_dist := public.distribute_yield(v_req.amount, v_req.waqf_id);
    v_result := jsonb_build_object('distribution_id', v_dist);
  elsif v_req.type = 'settle_wallets' then
    -- تصفية محافظ الوقف المطلوب مباشرة (لا تعتمد على جلسة المنفذ)
    update public.distribution_payouts p
       set status = 'transferred'
      from public.distributions d
     where p.distribution_id = d.id
       and p.status = 'unpaid'
       and d.waqf_id = v_req.waqf_id;
    get diagnostics v_count = row_count;

    update public.beneficiaries
       set wallet_balance = 0
     where wallet_balance > 0
       and waqf_id = v_req.waqf_id;

    v_result := jsonb_build_object('settled_payouts', v_count);
  else
    raise exception 'نوع طلب غير معروف: %', v_req.type;
  end if;

  update public.approval_requests
     set status = 'executed',
         executed_by = auth.uid(),
         executed_at = now(),
         result = v_result
   where id = p_id;

  return v_result;
end;
$$ language plpgsql security definer;
