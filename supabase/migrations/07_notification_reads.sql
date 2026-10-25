-- ==========================================
-- MASHEED ERP – MIGRATION V7
-- Notification read-state per user
-- كل مستخدم له حالة قراءة مستقلة لكل إشعار
-- ==========================================

create table if not exists public.notification_reads (
  user_id uuid references public.profiles(id) on delete cascade not null,
  ref_key text not null,               -- مثال: task:<uuid> | log:<uuid> | approval:<uuid>
  read_at timestamptz default now(),
  primary key (user_id, ref_key)
);

alter table public.notification_reads enable row level security;

-- كل مستخدم يدير حالة القراءة الخاصة به فقط
create policy "reads select" on public.notification_reads for select
  using (auth.uid() = user_id);
create policy "reads insert" on public.notification_reads for insert
  with check (auth.uid() = user_id);
create policy "reads delete" on public.notification_reads for delete
  using (auth.uid() = user_id);
