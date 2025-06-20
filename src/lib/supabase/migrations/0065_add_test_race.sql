-- Add a test race
insert into public.f1_races (
  race_name,
  year,
  race_date,
  poster_url,
  circuit,
  winner,
  location,
  country
) values (
  'Test Race',
  2024,
  '2024-03-15',
  'https://example.com/test-race-poster.jpg',
  'Test Circuit',
  null,
  'Test City',
  'Test Country'
);

-- Verify the race was added
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
where race_name = 'Test Race'; 