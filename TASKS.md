# HALA - Task Master

## 🎯 Current Sprint: Foundation Setup

### ✅ Completed Tasks
- [x] Project initialization & package.json setup  
- [x] Tailwind CSS configuration
- [x] Landing page design & implementation
- [x] Basic project structure setup
- [x] Brand identity (colors, typography)

 Epic: Race Logging from Profile

Goal: Enable a logged-in user to log a race they've watched, rate it, and write a review — all visible on their profile.
🔧 Level 1 Tasks: Core Entities & Flow
ID	Task	Points	Dependencies	Description
1.0	Set up database schema	5	—	Initialize schema in Supabase/PostgreSQL and define migrations or initial structure.
1.1	Create Race object in DB	3	1.0	Define columns for race ID, name, year, winner, circuit, poster URL, etc.
1.2	Create UserRaceLog object	3	1.0	Define user-submitted logs: userId, raceId, watchedDate, rating, review, rewatch.
1.3	Create Profile object	2	1.0	Define user profile data: username, bio, avatar, stats. Optionally prefill from auth.
🧩 Level 2 Tasks: Scraping & Data Ingestion
🟢 Race Data Scraping
ID	Task	Points	Dependencies	Description
2.0	Integrate f1-api-json scraper	5	1.1	Set up local Node service that fetches races from Formula1.com.
2.1	Transform scraper output to Race schema	4	2.0	Map scraped JSON to internal DB schema with hala IDs.
2.2	Write ingestion script to store races	3	2.1	One-time script to seed races in DB; reusable for updates.
🟠 Poster Scraping (Separate Pipeline)
ID	Task	Points	Dependencies	Description
2.3	Identify poster source URLs (f1stats.com)	2	—	Manually or programmatically find patterns for race posters.
2.4	Build poster scraper	5	2.3	Write script (Puppeteer, Cheerio, etc.) to download and link posters.
2.5	Store poster URLs or images in DB	2	2.4, 1.1	Connect scraped posters to Race entries. Store URL or CDN link.
👤 Level 3 Tasks: Logging from Profile
ID	Task	Points	Dependencies	Description
3.0	Build profile page UI	4	1.3	Static version of user profile (React component).
3.1	Display logged races on profile	4	3.0, 1.2	Pull user logs and show basic info (race name, date, rating).
3.2	Create race log form	4	1.1, 1.2	Form to select a race, add rating/review/date, and submit.
3.3	Submit form to create UserRaceLog	3	3.2	Store user entry to DB and link to user ID.
3.4	Optimistically update profile UI	2	3.3	Show the new log immediately after submission.
🌟 Stretch Goals / Later
ID	Task	Points	Dependencies	Description
4.0	Add edit/delete log entry	3	3.3	Allow users to update or remove their 



Goal: User can log a race from profile
├── 1.0 Set up DB
│   ├── 1.1 Race
│   ├── 1.2 UserRaceLog
│   └── 1.3 Profile
├── 2.0 Race data scraping
│   └── 2.1 → 2.2 seed Race entries
├── 2.3 Poster scraping
│   └── 2.4 → 2.5 attach to Race
├── 3.0 Profile page
│   ├── 3.1 display logs
│   └── 3.2 log form
│       └── 3.3 submit → 3.4 update UI



🏗 Epic: Integrate F1-API-JSON → Supabase (matches)

Goal: Ingest the full 2024 F1 season (≈ 24 races) into public.matches — no posters yet — so they immediately appear in the f1_races view and the UI.
📋 Task Backlog (Cursor-ready)
ID	Task	Pts	Depends on	Description
0.1	Spike – Explore F1-API-JSON	2	—	- Install the package (npm i f1-api-json)
- Read docs ⇒ identify getRaceSchedule(year) & getRaceResults(year).
- Console-log a sample 2024 schedule JSON.
0.2	Create data-types file	1	0.1	Define TS interfaces (ApiRaceSchedule, ApiRaceResult) that mirror the JSON returned by the library.
1.0	Transform utility	3	0.2	Write mapApiRaceToMatch(apiRace): NewMatch that converts
{ date, eventTitle, raceCountry, round, … } ➜ { sport:'f1', ext_id, title, starts_at, meta }.
1.1	Seed script seed2024Races.ts	4	1.0	- Call getRaceSchedule(2024).
- Loop & transform with mapApiRaceToMatch.
- Batch‐insert into public.matches (insert … on conflict (ext_id) do nothing).
- Log inserted IDs.
1.2	Match meta enrichment	2	1.1	For each race: call getRaceResults(2024) → find winner, laps, car.
Add these fields to meta (winner, laps, car).
2.0	Supabase Service Role key env	1	1.1	Add SUPABASE_SERVICE_ROLE to .env.local so the seed script bypasses RLS.
2.1	NPM script wrapper	0.5	1.1	Add "seed:2024": "ts-node scripts/seed2024Races.ts" to package.json.
2.2	CI check (optional)	2	2.1	GitHub Action that runs the seed script in a dry-run mode on PRs.
3.0	Manual QA	1	1.1	- Run the script.
- Verify 24 rows now appear in /f1_races view.
- Spot-check dates & titles.
4.0	Update RaceCard query (auto)	0	3.0	Once data is in matches, UI lists will auto-populate (no code).

    Total ~ 16.5 points.

🛠 Key Implementation Details

    API Endpoints to use

        getRaceSchedule(2024) → provides dates, round, country, eventTitle.

        getRaceResults(2024) → iterate, extract winner, car, time, etc.

    ext_id Strategy

ext_id = `${year}-${slugifiedCountry}-gp`  // e.g., 2024-bahrain-gp

meta JSONB example

{
  "circuit": "Jeddah Corniche Circuit",
  "country": "Saudi Arabia",
  "location": "Jeddah",
  "round": 2,
  "winner": "Max Verstappen"
}

Insert statement

    insert into public.matches (sport, ext_id, title, starts_at, meta)
    values (...)
    on conflict (ext_id) do update
      set meta = excluded.meta, updated_at = now();

    Security

        Use service-role key for the seed script (ignores RLS).

        Keep public API key for client calls only.

🧑‍💻 Acceptance Criteria

Running npm run seed:2024 populates all 2024 races into matches.

select * from public.f1_races where year = 2024; returns ≥ 24 rows.

Visiting /races/[id] for any inserted race renders without 404.

No poster URLs yet (we'll add image scraping later).


🧩 Epic: Integrate StatsF1 Poster Data
🎯 Objective

Scrape official F1 race poster images from StatsF1 for a given season (e.g., 2024) and seed the corresponding poster URLs into the poster_url field of the existing race records in Supabase (public.matches table).
🔍 Description

StatsF1 provides a centralized poster archive for all F1 races at:

https://www.statsf1.com/en/[year].aspx

Each page contains a grid of all races from the selected year with their official poster image. The goal is to automate the following:

    Scrape poster images (race name + image URL) for a specified year.

    Map scraped data to existing races in the database (matching on title or ext_id).

    Seed poster_url field in the matches table for all 24+ races of that year.

    Ensure no overwrites if poster data already exists.

    Update poster images for races missing this asset only.


    # Tasks for User Auth & Profile Functionality

## 🛠️ Authentication Setup

- [ ] Install Supabase JS client
- [ ] Connect Supabase to frontend (use `.env.local`)
- [ ] Implement `/sign-in` page using Supabase Auth UI
- [ ] Redirect user to `/profile` on success
- [ ] Store basic user info in `users` table (if needed)

## 🧑‍💻 Profile Page

- [ ] Create `/profile` route
- [ ] Show list of races user has interacted with (stub with mock data first)
- [ ] Add sign-out button
- [ ] Create placeholder: "No races logged yet" message

## 🧪 User Flow Tests

- [ ] User can sign up via `/sign-in`
- [ ] On success, redirect to `/profile`
- [ ] Refresh keeps user logged in (check auth state on load)

## ✨ Extra (later)

- [ ] Allow users to log a race (text, rating, etc.)
- [ ] Add avatar, bio fields to profile
- [ ] Allow editing or deleting race logs

## 🔍 Quality of Life

- [ ] Navbar changes after login (e.g., "Sign Out" replaces "Sign In")
- [ ] Protect `/profile` and other auth routes
- [ ] Set up reusable Supabase `useUser()` hook

# Development Tasks

## 1. User-to-User Interactions

### Database Setup
- [x] Create `follows` table:
  ```sql
  create table public.follows (
    follower_id uuid references public.users(id),
    following_id uuid references public.users(id),
    created_at timestamptz default now(),
    primary key (follower_id, following_id)
  );
  ```
- [x] Add RLS policies for follows table
- [x] Create functions:
  - `get_user_followers(user_id)`
  - `get_user_following(user_id)`
  - `check_is_following(follower_id, following_id)`

### API Layer
- [x] Add follow-related queries in `src/lib/supabase/queries/social.ts`:
  - `followUser(userId)`
  - `unfollowUser(userId)`
  - `getFollowers(userId)`
  - `getFollowing(userId)`
  - `checkIsFollowing(userId)`

### UI Components
- [x] Create `FollowButton` component:
  - Toggle follow/unfollow
  - Loading state
  - Error handling
- [x] Create `FollowList` component:
  - Grid/list of users
  - Infinite scroll
  - Loading states
- [x] Add follow counts to `ProfileHeader`
- [x] Add followers/following tabs to profile page
- [x] Link follower counts in header to corresponding tabs
Note: Decided to use tabs instead of modal/dedicated pages for better UX and context


## 2. User-to-Race Interactions

### Database Setup
- [x] Update `logs` table with new fields:
  ```sql
  alter table public.logs
  add constraint valid_rating check (rating >= 1 and rating <= 5);
  ```
- [x] Create functions:
  - `log_race_watch(user_id, race_id)`
  - `get_race_logs(race_id)`
  - `get_user_race_log(user_id, race_id)`

### API Layer
- [x] Add race logging queries in `src/lib/supabase/queries/logs.ts`:
  - `logRaceWatch(raceId, options)`
  - `updateRaceLog(raceId, updates)`
  - `getRaceLogs(raceId)`
  - `getUserRaceLog(raceId)`

### UI Components
- [x] Create `RaceLogForm` component:
  - Watch status toggle
  - Rating input (stars)
  - Review text area
  - Submit button
  - Loading states
- [x] Create `RaceLogList` component:
  - List of user logs for a race
  - Sort by recent/rating
  - Filter options
- [x] Create `UserRaceLog` component:
  - Individual log display
  - Edit/delete options
- [x] Add log status to race cards

### Pages
- [x] Update `/races/[id]` page:
  - Add logging section
  - Show user logs
  - Add sorting/filtering
- [x] Add `/races/[id]/log` route for dedicated logging
- [x] Update profile page to show recent logs

## 3. Activity Feed

### Database Setup
- [x] Create `activities` view:
  ```sql
  create view public.activities as
  select 
    'log' as type,
    l.id as activity_id,
    l.user_id,
    l.match_id,
    l.created_at,
    l.rating,
    l.review
  from public.logs l
  union all
  select 
    'follow' as type,
    f.follower_id || '_' || f.following_id as activity_id,
    f.follower_id as user_id,
    null as match_id,
    f.created_at,
    null as rating,
    null as review
  from public.follows f;
  ```
- [x] Create function `get_feed_for_user(user_id)`

### API Layer
- [x] Add activity queries in `src/lib/supabase/queries/activity.ts`:
  - `getFeedActivities(options)`
  - `getUserActivities(userId)`

### UI Components
- [x] Create `ActivityFeed` component:
  - Different activity types
  - Infinite scroll
  - Loading states
- [x] Create activity item components:
  - `RaceLogActivity`
  - `FollowActivity`

### Pages
- [x] Add `/feed` route for following activity

## 4. Notifications (Optional)

### Database Setup
- [ ] Create `notifications` table
- [ ] Setup notification triggers
- [ ] Add RLS policies

### UI Components
- [ ] Create notification components
- [ ] Add notification badge to navbar

## Testing Checklist

### User-to-User
- [ ] Follow/unfollow works
- [ ] Counts update correctly
- [ ] Lists show correct users
- [ ] RLS prevents unauthorized access

### Race Logging
- [ ] Can log new watch
- [ ] Can update existing log
- [ ] Rating constraints work
- [ ] Lists update correctly

### Activity Feed
- [ ] Shows correct activities
- [ ] Updates in real-time
- [ ] Loads more on scroll
- [ ] Performance is acceptable

## Migration Steps

1. Run database migrations
2. Test with existing data
3. Add new components
4. Update existing pages
5. Add new routes
6. Test all flows
7. Deploy changes
