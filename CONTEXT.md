# Project Brief — **Hala** (Letterboxd-for-Sports)

---

## 1. Problem & Vision
Fans track what they *watch* (films ➜ Letterboxd, books ➜ Goodreads, restaurants ➜ Beli) but **no cross-sport network** lets them:
1. Log every match/race/game they watch.
2. Rate + micro-review it.
3. Build shareable lists.
4. Follow friends' diaries in a spoiler-safe feed.

**Hala** fills that gap with a web companion (+ mobile after) product.

---

## 2. Core Loop (MUST exist in MVP)

Search match ➜ "Zap it" (log) ➜ ★ + 10000 limit-char note ➜ shows in diary ➜ appears in friends feed

## 3. Functional Requirements

| # | Title | Brief Acceptance Criteria |
|---|-------|---------------------------|
| F-1 | Match Search | User can search upcoming & past matches (F1 races first) in <300 ms. |
| F-2 | Log Match  | Single tap records match + timestamp; cannot log same match twice. |
| F-3 | Rate & Review | 0–5 stars (0.5 steps) + 140-char free text; stored in `logs`. |
| F-4 | Personal Diary | Reverse-chron list of user's logs, paginated, spoiler-free for others. |
| F-5 | Follow Graph | User can follow/unfollow; feed shows union of followees. |
| F-6 | Lists | Create / reorder list of logged matches; public URL. |
| F-7 | Auth | Email + Google/Apple OAuth; row-level security restricts data. |

## 5. Tech Stack Decisions (so far)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend Web | **Next.js 14** (app router, RSC) | SEO, RSC bundle split |
| Mobile (down the line)| **Expo SDK 51** + React Native Web | Code-share |
| Backend API | **tRPC** + Fastify (TS) | End-to-end types | Ruby? |
| DB | **PostgreSQL (Supabase)** | Managed, realtime, RLS |
| Realtime | Supabase Realtime on `logs` | Push feed inserts |
| Auth | Supabase Auth | Email + OAuth |
| CI/CD | GitHub Actions ➜ Vercel (web/api) & EAS (mobile) | Auto preview |

## Additional Recommendations
Cache: Redis (for sports data, user feeds)
CDN: Vercel Edge (global performance)
Image: Cloudinary (team logos, user avatars)
Analytics: PostHog (user behavior tracking)
Monitoring: Sentry (error tracking)

## 6. Data Model v0
users(id uuid PK, username text, avatar_url text, created_at timestamptz)

matches(id bigint PK, sport int, ext_id text UNIQUE, title text,
starts_at timestamptz, meta jsonb)

logs(id bigint PK, user_id uuid FK, match_id bigint FK,
rating int, blurb text, created_at timestamptz,
UNIQUE(user_id, match_id) ON DELETE CASCADE)

follows(follower_id uuid, followee_id uuid, created_at timestamptz,
PK(follower_id, followee_id))

lists(id bigint PK, owner_id uuid FK, title text, description text)

list_items(list_id bigint FK, match_id bigint FK, position int,
PK(list_id, match_id))


## Social Goals

1) To build community
2) Gamification

Focus only on Formula 1 races first to test functionality and then scale up to other sports (soccer, tennis, basketball, golf...), keep that in mind for the database.




