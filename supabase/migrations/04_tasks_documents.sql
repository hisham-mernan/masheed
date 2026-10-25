-- ==========================================
-- MASHEED ERP – MIGRATION V4
-- Maintenance tasks + Document archive (human-driven workflows)
-- ==========================================

-- 1. Maintenance tasks (per asset, human managed)
create table if not exists public.maintenance_tasks (
  id uuid primary key default gen_random_uuid(),
  waqf_id uuid references public.waqfs(id) not null,
  asset_id uuid references public.assets(id) on delete set null,
  title text not null,
  priority text not null default 'scheduled', -- urgent | in_progress | scheduled
  status text not null default 'open',        -- open | done | cancelled
  due_date date,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  completed_at timestamptz
);

alter table public.maintenance_tasks enable row level security;

create policy "tasks read"   on public.maintenance_tasks for select using (waqf_id = public.get_user_waqf_id());
create policy "tasks insert" on public.maintenance_tasks for insert with check (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor'));
create policy "tasks update" on public.maintenance_tasks for update using (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor'));
create policy "tasks delete" on public.maintenance_tasks for delete using (waqf_id = public.get_user_waqf_id() and public.my_role() = 'admin');

drop trigger if exists audit_tasks on public.maintenance_tasks;
create trigger audit_tasks after insert or update or delete on public.maintenance_tasks
  for each row execute procedure public.log_changes();

-- 2. Document archive (OCR / scanned deeds)
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  waqf_id uuid references public.waqfs(id) not null,
  asset_id uuid references public.assets(id) on delete set null,
  doc_type text not null default 'sukuk',   -- sukuk | contract | receipt | other
  title text not null,
  reference_no text,
  doc_date text,
  conditions_text text,                      -- شروط الواقف
  file_name text,
  file_data text,                            -- base64 payload of the scan (small files)
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.documents enable row level security;

create policy "docs read"   on public.documents for select using (waqf_id = public.get_user_waqf_id());
create policy "docs insert" on public.documents for insert with check (waqf_id = public.get_user_waqf_id() and public.my_role() in ('admin','supervisor'));
create policy "docs delete" on public.documents for delete using (waqf_id = public.get_user_waqf_id() and public.my_role() = 'admin');

drop trigger if exists audit_documents on public.documents;
create trigger audit_documents after insert or update or delete on public.documents
  for each row execute procedure public.log_changes();
