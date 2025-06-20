-- Add a test race to the matches table
insert into public.matches (
  sport,
  ext_id,
  title,
  starts_at,
  meta,
  poster_url
) values (
  'f1',
  'test-race-2024',
  'Test Race 2024',
  '2024-03-01 14:00:00+00',
  '{
    "circuit": "Test Circuit",
    "winner": null,
    "location": "Test City",
    "country": "Test Country"
  }'::jsonb,
  'https://example.com/test-race-poster.jpg'
);

-- Verify the race was added through the f1_races view
select
  race_id,
  race_name,
  year,
  race_date,
  circuit,
  winner,
  location,
  country
from public.f1_races
where race_name = 'Test Race 2024'; 