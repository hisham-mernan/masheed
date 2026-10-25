-- ==========================================
-- MASHEED ERP – MIGRATION V9
-- Experts directory (platform-level) + seed
-- ==========================================

create table if not exists public.experts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text,
  type text default 'sharia',      -- sharia | legal | financial | technical
  rating numeric default 5.0,
  available boolean default true,
  bio text,
  created_at timestamptz default now()
);

alter table public.experts enable row level security;

-- كل مستخدم مسجل يقرأ الدليل؛ الإدارة لمدير المنصة فقط
create policy "experts read" on public.experts for select
  using (auth.uid() is not null);
create policy "experts write" on public.experts for insert
  with check (public.is_platform_admin());
create policy "experts update" on public.experts for update
  using (public.is_platform_admin());
create policy "experts delete" on public.experts for delete
  using (public.is_platform_admin());

insert into public.experts (name, specialty, type, rating, available, bio) values
  ('الشيخ د. عبدالرحمن المطلق', 'صياغة وتوثيق صكوك الأوقاف والوصايا', 'sharia', 4.9, true, 'خبرة 20 عاماً في الفقه المالي والأوقاف.'),
  ('المستشار القانوني أحمد السديري', 'حوكمة مجالس النظارة واللوائح التشغيلية', 'legal', 4.8, true, 'مستشار قانوني معتمد لدى الهيئة العامة للأوقاف.'),
  ('د. سارة العتيبي', 'الاستثمار الوقفي وإدارة المحافظ المتوافقة مع الشريعة', 'financial', 4.9, true, 'دكتوراه في التمويل الإسلامي.'),
  ('المهندس خالد الغامدي', 'التقييم الفني العقاري وإدارة المشاريع الإنشائية', 'technical', 4.7, false, 'مقيّم عقاري معتمد (تقييم).')
on conflict do nothing;
