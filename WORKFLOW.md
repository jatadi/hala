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

### Storage Buckets

#### `avatars`
- Purpose: Store user profile avatars
- Access: Public read, authenticated write
- File types: Images only (jpg, png, gif)
- Size limit: 5MB per file
- Path format: `{user_id}/{timestamp}.{ext}`

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
- Components:
  - `ProfileHeader`: User info, stats, and edit button
  - `RecentActivity`: Grid of recently watched races

#### `/profile/[username]/edit`
- Protected route (only accessible by profile owner)
- Features:
  - Username editing with validation
  - Bio editing with character limit
  - Avatar upload with preview
  - File type and size validation
  - Upload progress indicator

### Components

#### `RaceHeader`
- Displays race details and stats
- Shows average rating and watcher count

#### `ProfileHeader`
- Shows user info and aggregated stats
- Displays:
  - Username
  - Avatar (with fallback to initials)
  - Bio (if exists)
  - Stats (races watched, following, followers, avg rating)
  - Edit button (only shown to profile owner)
- Stats display 0 for empty values

#### `RecentActivity`
- Lists user's recently watched races
- Grid layout with race cards
- Shows race posters and basic info

#### `Navbar`
- Persistent auth state with loading indicators
- Shows:
  - Username with profile link
  - Sign out button
  - Loading skeleton while fetching
  - Error state with retry option
- Handles auth state changes gracefully

### Race Navigation

#### `/races/[id]`
- Added race-to-race navigation
- Features:
  - Left arrow for newer race
  - Right arrow for older race
  - Tooltips showing race names
  - Keyboard navigation support
  - Proper accessibility markup

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

## Auth Flow Improvements

### Session Handling
- Proper session persistence
- Loading states during auth checks
- Error handling for failed auth
- Clean unmount handling

### Profile Access Control
- Username-based routing
- Protected edit routes
- Proper RLS policies
- Edit button only shown to owner

## Common Components

### Loading States
- Skeleton UI during data fetch
- Animated loading indicators
- Proper error states
- Retry mechanisms

### Error Handling
- User-friendly error messages
- Retry options where appropriate
- Graceful fallbacks
- Console logging for debugging

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

## Current State

✅ Profile System
- User profiles with stats
- Avatar upload with storage
- Profile editing
- Auth state management
- Race navigation
- Loading states and error handling

🚧 Next Steps
- Implement following/followers
- Add race logging
- Enhance race details page
- Add user notifications
- Implement user lists

1) combine-f1-data@combine-f1-data.ts - fetch data for a year (needs to be genericized)
2) seed-f1-races @seed-f1-races.ts - create the races for that year in the db
3) scrape-f1-posters @scrape-f1-posters.ts  - get the posters
4) seed-f1-posters @seed-f1-posters.ts - put the posters in the db to according races
accompanying created files:
combined-race-data-[year]
f1-posters-[year]

# Project Workflow Overview

## ✅ Current State

- 🏁 Data Ingestion
  - Successfully scraped and seeded 2023 & 2024 F1 race data
  - Posters pulled (temporary source)
  - Seeded into Supabase via seed scripts

- 🖼 Pages
  - Public landing page (home)
  - Past races page rendering race data

## 🚧 Next Focus: User Profile & Authentication

### Goal
Allow users to:
- Create an account
- Log in securely
- Once logged in:
  - View profile
  - Track/log races
  - Leave reviews/comments
  - Add races to personal diary

### Pages Overview

| Page                  | Auth | Description                          |
|-----------------------|------|--------------------------------------|
| `/` (Home)            | ❌   | Landing page (pre-login)             |
| `/sign-in`            | ❌   | Supabase Auth UI                     |
| `/profile`            | ✅   | Shows user's diary & interactions    |
| `/races/[id]/log`     | ✅   | User can log/review a specific race  |

### Flow

1. User lands on `/`
2. Clicks `Start Your Diary` or `Sign In` → redirected to `/sign-in`
3. Upon successful login:
    - Redirect to `/profile`
    - User can view races they logged, and start logging others
