-- Drop the existing view
drop view if exists public.f1_races;

-- Recreate the view without the location field
create view public.f1_races as
select
  id as race_id,
  title as race_name,
  extract(year from starts_at) as year,
  starts_at as race_date,
  poster_url,
  meta->>'circuit' as circuit,
  meta->>'winner' as winner,
  meta->>'country' as country,
  (meta->>'round')::integer as round,
  created_at,
  updated_at
from public.matches
where sport = 'f1';

comment on view public.f1_races is 'Specialized view for F1 races with extracted metadata fields, using circuit instead of location';

-- Verify the view update
select race_id, race_name, circuit, round
from public.f1_races
order by race_date; 