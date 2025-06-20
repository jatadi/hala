# F1 Race Tracking App Workflow

## Database Schema

### Base Tables

#### `matches` (Base table for all races)
- `id` BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
- `sport` TEXT NOT NULL (filtered to 'f1' in our view)
- `ext_id` TEXT UNIQUE (e.g., '2024-bahrain-gp')
- `title` TEXT NOT NULL
- `starts_at` TIMESTAMPTZ NOT NULL
- `meta` JSONB NOT NULL (stores circuit, winner, location, country)
- `poster_url` TEXT
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()

#### `users` (Base user table)
- `id` UUID PRIMARY KEY
- `username` TEXT UNIQUE NOT NULL
- `bio` TEXT
- `avatar_url` TEXT
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()

#### `logs` (Race watching activity)
- `id` BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
- `user_id` UUID REFERENCES users(id)
- `match_id` BIGINT REFERENCES matches(id)
- `rating` NUMERIC CHECK (rating >= 0 AND rating <= 5)
- `review` TEXT
- `watched_at` TIMESTAMPTZ NOT NULL
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()

### Views

#### `f1_races` (Main view for F1 races)
```sql
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
```

#### `user_profiles` (User profiles with stats)
```sql
create view public.user_profiles as
select
  u.id,
  u.username,
  u.bio,
  u.created_at,
  u.updated_at,
  count(distinct l.match_id) as races_watched,
  count(distinct case when l.rating is not null then l.match_id end) as races_rated,
  round(avg(l.rating)::numeric, 2) as average_rating,
  max(l.watched_at) as last_watched_at,
  0 as number_of_lists,
  0 as following_count,
  0 as followers_count
from public.users u
left join public.logs l on u.id = l.user_id
group by u.id, u.username, u.bio, u.created_at, u.updated_at;
```

## Database Functions

### `get_race_details(race_id_param bigint)`
- Purpose: Get detailed information about a specific race including watchers and ratings
- Returns: Race details with average rating and watcher count
- Key points:
  - Checks if race exists first
  - Uses inner join with logs to count only valid races
  - Calculates average rating and watcher count

### `get_profile_stats(username_param text)`
- Purpose: Calculate user profile statistics
- Returns: Aggregated stats about races watched, rated, reviewed
- Key points:
  - Uses inner join to only count existing races
  - Calculates average rating across all races
  - Returns latest watch timestamp

### `get_race_watchers(race_id_param bigint)`
- Purpose: Get list of users who watched a specific race
- Returns: Array of watchers with their ratings and reviews
- Key points:
  - Joins users and logs tables
  - Orders by watch timestamp

## Frontend Structure

### Pages

#### `/races/[id]`
- Shows individual race details
- Displays watchers and average rating
- Caching disabled with:
  ```typescript
  export const dynamic = 'force-dynamic';
  export const revalidate = 0;
  ```

#### `/profile/[username]`
- Shows user profile and stats
- Displays recent activity
- Caching disabled to ensure fresh stats

### Components

#### `RaceHeader`
- Displays race details and stats
- Shows average rating and watcher count

#### `ProfileHeader`
- Shows user info and aggregated stats
- Displays total races watched/rated

#### `RecentActivity`
- Lists user's recently watched races
- Joins with f1_races view for details

## API Layer

### Supabase Queries

#### `races.ts`
- `getRaceDetails`: Fetches race info and stats
- `getRaceWatchers`: Gets list of watchers
- `getUpcomingF1Races`: Lists future races
- `getPastF1Races`: Lists completed races

#### `profile.ts`
- `getProfileStats`: Fetches user stats
- Uses database function for calculations

## Lessons Learned

1. Database Design
   - Use views to abstract complex data structures
   - Keep base tables simple, use JSONB for flexible metadata
   - Always use proper foreign key constraints

2. Data Consistency
   - Always verify race existence before counting stats
   - Use inner joins when you need to ensure referenced data exists
   - Reset profile stats when clearing data

3. Caching
   - Disable Next.js caching for dynamic data pages
   - Use `force-dynamic` for real-time stats
   - Clear browser cache when testing

4. Error Handling
   - Check for null/undefined at every step
   - Log database errors with context
   - Return empty arrays/null for missing data

5. Testing Process
   - Start with clean slate (delete all data)
   - Add test data one piece at time
   - Verify each step before proceeding
   - Check both database and UI after each change

6. Common Pitfalls
   - Views aren't directly insertable
   - UUID text casting in functions
   - Missing join conditions leading to incorrect counts
   - Cached pages showing stale data

## Supabase RLS Policies

### matches
```sql
-- Enable read access for all authenticated users
create policy "Enable read access for all users"
  on public.matches for select
  to authenticated
  using (true);
```

### logs
```sql
-- Users can insert their own logs
create policy "Users can insert own logs"
  on public.logs for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can read all logs
create policy "Users can read all logs"
  on public.logs for select
  to authenticated
  using (true);
```

## Development Workflow

1. Schema Changes
   - Create migration file with timestamp prefix
   - Include verification queries
   - Test with small dataset first

2. Adding Features
   - Start with database function/view
   - Add API query method
   - Create/update React component
   - Disable caching if needed
   - Test with real data

3. Testing Process
   - Clear all data first
   - Add one test race
   - Add one user's activity
   - Verify all stats and UI
   - Add second user's activity
   - Test deletion and updates 