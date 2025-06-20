-- Insert a test F1 race
insert into public.matches (
  title,
  starts_at,
  poster_url,
  meta,
  sport,
  ext_id
) values (
  'Bahrain Grand Prix 2024',
  '2024-02-29T15:00:00Z',
  'https://example.com/bahrain-2024.jpg',
  jsonb_build_object(
    'circuit', 'Bahrain International Circuit',
    'location', 'Sakhir',
    'country', 'Bahrain',
    'winner', null -- null since it hasn't happened yet
  ),
  'f1',
  'f1-2024-bahrain' -- unique external identifier
) returning id; 