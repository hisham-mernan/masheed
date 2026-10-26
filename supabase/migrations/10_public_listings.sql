-- ==========================================
-- MASHEED ERP – MIGRATION V10
-- Public marketplace feed for وقف مَشيد (waqf-by-masheed /explore)
-- ==========================================

-- Only listings the System has approved for the market, and only the fields the
-- investment platform shows. The view runs with its owner's rights on purpose:
-- visitors are not members of any waqf, so the listing_requests RLS would hide
-- everything from them.
create or replace view public.public_listings as
select
  l.id,
  l.target_funding,
  l.price_per_share,
  l.shares_count,
  l.status,
  a.name            as asset_name,
  a.category::text  as asset_category,
  w.name            as waqf_name,
  l.created_at
from public.listing_requests l
join public.waqfs w on w.id = l.waqf_id
left join public.assets a on a.id = l.asset_id
where l.status in ('approved', 'trading');

revoke all on public.public_listings from public;
grant select on public.public_listings to anon, authenticated;
