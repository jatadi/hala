/* Create a view for F1 races with specific columns */
create view public.f1_races as
select
  id as race_id,
  title as race_name,
  extract(year from starts_at) as year,
  starts_at as race_date,
  poster_url,
  meta->>'circuit' as circuit,
  meta->>'winner' as winner,
  meta->>'location' as location,
  meta->>'country' as country,
  created_at,
  updated_at
from public.matches
where sport = 'f1';

comment on view public.f1_races is 'Specialized view for F1 races with extracted metadata fields';

/* Insert some test data */
insert into public.matches (
  sport,
  ext_id,
  title,
  starts_at,
  meta,
  poster_url
) values
(
  'f1',
  '2024-bahrain-gp',
  '2024 Gulf Air Bahrain Grand Prix',
  '2024-03-02 15:00:00+00',
  '{
    "circuit": "Bahrain International Circuit",
    "winner": "Max Verstappen",
    "location": "Sakhir",
    "country": "Bahrain"
  }'::jsonb,
  'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2023-races/Bahrain.png'
),
(
  'f1',
  '2024-saudi-gp',
  '2024 STC Saudi Arabian Grand Prix',
  '2024-03-09 17:00:00+00',
  '{
    "circuit": "Jeddah Corniche Circuit",
    "winner": "Max Verstappen",
    "location": "Jeddah",
    "country": "Saudi Arabia"
  }'::jsonb,
  'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245030/content/dam/fom-website/2023-races/Saudi-Arabia.png'
); 