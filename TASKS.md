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


