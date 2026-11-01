-- ============================================================
-- 16: consultation requests go to the Masheed admin, who assigns the consultant
-- The client picks the consultation type, a 30-minute slot and describes the request;
-- the booking is created without a consultant and the platform admin assigns one.
-- A slot is open while fewer active bookings overlap it than consultants are available then.
-- Run on the Masheed project only.
-- ============================================================

alter table public.bookings alter column expert_id drop not null;
alter table public.bookings add column if not exists consult_type text
  check (consult_type is null or consult_type in ('financial', 'sharia', 'legal'));
alter table public.bookings add column if not exists assigned_at timestamptz;
alter table public.bookings add column if not exists assigned_by uuid references auth.users on delete set null;

-- Existing bookings keep their consultant; record the type they were booked under
update public.bookings b set consult_type = e.type, assigned_at = coalesce(b.assigned_at, b.created_at)
from public.experts e
where e.id = b.expert_id and b.consult_type is null and e.type in ('financial', 'sharia', 'legal');

create index if not exists bookings_open_requests on public.bookings(starts_at) where expert_id is null;

-- Open 30-minute slots between two instants, with no details of who booked
create or replace function public.consult_open_slots(p_from timestamptz, p_to timestamptz)
returns setof timestamptz language sql stable security definer set search_path = public as $$
  with grid as (
    select g as t
    from generate_series(
      date_trunc('hour', greatest(p_from, now() + interval '1 hour')) ,
      least(p_to, now() + interval '60 days'),
      interval '30 minutes') g
    where g >= now() + interval '1 hour'
  )
  select t from grid
  where (
    select count(*) from public.experts e
    where e.available and exists (
      select 1 from public.expert_availability a
      where a.expert_id = e.id and a.weekday = extract(dow from t at time zone 'Asia/Riyadh')::int
        and (t at time zone 'Asia/Riyadh')::time >= a.start_time
        and ((t + interval '30 minutes') at time zone 'Asia/Riyadh')::time <= a.end_time
        and ((t + interval '30 minutes') at time zone 'Asia/Riyadh')::time > a.start_time)
  ) > (
    select count(*) from public.bookings b
    where b.starts_at < t + interval '30 minutes' and b.ends_at > t
      and (b.status = 'confirmed' or (b.status = 'pending_payment' and b.hold_until > now()))
  )
  order by t
$$;
revoke all on function public.consult_open_slots(timestamptz, timestamptz) from public, anon;
grant execute on function public.consult_open_slots(timestamptz, timestamptz) to authenticated;

-- Send a consultation request. Uses a free package session when one is left; otherwise holds it for payment.
create or replace function public.request_consultation(p_type text, p_starts timestamptz, p_topic text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  acc uuid := public.get_user_account_id();
  topic text := nullif(trim(left(p_topic, 1000)), '');
  free_left int;
  bid uuid;
begin
  if acc is null then raise exception 'no_account'; end if;
  if p_type is null or p_type not in ('financial', 'sharia', 'legal') then raise exception 'type_invalid'; end if;
  if topic is null or char_length(topic) < 10 then raise exception 'topic_required'; end if;
  if p_starts < now() + interval '1 hour' or p_starts > now() + interval '60 days' then
    raise exception 'slot_out_of_range';
  end if;
  if extract(epoch from p_starts)::bigint % 1800 <> 0 then raise exception 'slot_invalid'; end if;

  -- One request at a time per slot, so two clients can't both take the last consultant
  perform pg_advisory_xact_lock(hashtext('consult_slot'), (extract(epoch from p_starts) / 1800)::int);

  -- Release holds on this slot that expired unpaid
  update public.bookings set status = 'cancelled'
  where starts_at = p_starts and status = 'pending_payment' and hold_until <= now();

  if not exists (select 1 from public.consult_open_slots(p_starts, p_starts + interval '1 minute') t where t = p_starts) then
    raise exception 'slot_taken';
  end if;

  -- Free sessions from the best active package, minus those already used in its period
  select coalesce(max(p.free_sessions - (
           select count(*) from public.bookings b
           where b.account_id = acc and b.paid_via = 'package' and b.status <> 'cancelled'
             and b.created_at >= s.starts_at)), 0)
    into free_left
  from public.subscriptions s join public.packages p on p.id = s.package_id
  where s.account_id = acc and now() between s.starts_at and s.ends_at;

  if free_left > 0 then
    insert into public.bookings (account_id, consult_type, starts_at, ends_at, topic, status, paid_via, room_code, created_by)
    values (acc, p_type, p_starts, p_starts + interval '30 minutes', topic,
            'confirmed', 'package', replace(gen_random_uuid()::text, '-', ''), auth.uid())
    returning id into bid;
  else
    insert into public.bookings (account_id, consult_type, starts_at, ends_at, topic, status, hold_until, created_by)
    values (acc, p_type, p_starts, p_starts + interval '30 minutes', topic,
            'pending_payment', now() + interval '15 minutes', auth.uid())
    returning id into bid;
  end if;
  return bid;
end;
$$;
revoke all on function public.request_consultation(text, timestamptz, text) from public, anon;
grant execute on function public.request_consultation(text, timestamptz, text) to authenticated;

-- Clients no longer choose a consultant themselves
revoke execute on function public.book_consultation(uuid, timestamptz, text) from authenticated;

-- Admin assigns (or reassigns) the consultant; refuses one who is unavailable or busy at that time
create or replace function public.assign_consultant(p_booking uuid, p_expert uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  bk record;
  loc timestamp;
begin
  if not public.is_platform_admin() then raise exception 'not_allowed'; end if;
  select id, starts_at, ends_at, status into bk from public.bookings where id = p_booking for update;
  if bk.id is null or bk.status not in ('pending_payment', 'confirmed') then raise exception 'booking_closed'; end if;
  if not exists (select 1 from public.experts where id = p_expert and available) then raise exception 'expert_unavailable'; end if;
  loc := bk.starts_at at time zone 'Asia/Riyadh';
  if not exists (
    select 1 from public.expert_availability a
    where a.expert_id = p_expert and a.weekday = extract(dow from loc)::int
      and loc::time >= a.start_time and (bk.ends_at at time zone 'Asia/Riyadh')::time <= a.end_time
  ) then
    raise exception 'expert_off_hours';
  end if;
  if exists (
    select 1 from public.bookings b
    where b.expert_id = p_expert and b.id <> bk.id
      and b.starts_at < bk.ends_at and b.ends_at > bk.starts_at
      and (b.status = 'confirmed' or (b.status = 'pending_payment' and b.hold_until > now()))
  ) then
    raise exception 'expert_busy';
  end if;
  update public.bookings set expert_id = p_expert, assigned_at = now(), assigned_by = auth.uid() where id = bk.id;
end;
$$;
revoke all on function public.assign_consultant(uuid, uuid) from public, anon;
grant execute on function public.assign_consultant(uuid, uuid) to authenticated;
