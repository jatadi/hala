# HALA - Project Skeleton & Implementation Plan

## Project Structure

```
hala/
├── apps/
│   ├── web/                    # Next.js 14 web app
│   │   ├── app/
│   │   │   ├── (auth)/         # Auth pages
│   │   │   ├── (app)/          # Main app pages
│   │   │   │   ├── dashboard/
│   │   │   │   ├── diary/
│   │   │   │   ├── discover/
│   │   │   │   ├── match/[id]/
│   │   │   │   ├── profile/[username]/
│   │   │   │   └── lists/
│   │   │   ├── api/            # API routes (if needed)
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/             # Shadcn components
│   │   │   ├── match/          # Match-specific components
│   │   │   ├── diary/          # Diary components
│   │   │   └── social/         # Social features
│   │   └── lib/
│   │       ├── trpc/
│   │       ├── auth/
│   │       └── utils/
│   └── mobile/                 # Expo app (Phase 2)
├── packages/
│   ├── api/                    # tRPC API server
│   │   ├── src/
│   │   │   ├── routers/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── matches.ts
│   │   │   │   ├── logs.ts
│   │   │   │   ├── social.ts
│   │   │   │   └── lists.ts
│   │   │   ├── services/
│   │   │   │   ├── f1-api.ts
│   │   │   │   ├── cache.ts
│   │   │   │   └── notifications.ts
│   │   │   └── db/
│   │   └── package.json
│   ├── database/               # Supabase schema & migrations
│   │   ├── migrations/
│   │   ├── seed/
│   │   └── types/
│   ├── shared/                 # Shared types & utils
│   │   ├── types/
│   │   └── constants/
│   └── ui/                     # Shared UI components
└── docs/
    ├── api.md
    ├── database.md
    └── deployment.md
```

## Implementation Phases

### Phase 1: MVP Core (Weeks 1-4)
**Goal**: Basic F1 race logging & personal diary

#### Week 1: Foundation
- [ ] Setup monorepo with Turborepo
- [ ] Initialize Next.js app with Tailwind + Shadcn
- [ ] Setup Supabase project with RLS
- [ ] Create database schema & migrations
- [ ] Setup tRPC with basic auth

#### Week 2: Match System
- [ ] F1 API integration (Ergast or official)
- [ ] Match search & display
- [ ] Basic match detail pages
- [ ] Cache layer for F1 data (Redis)

#### Week 3: Logging System
- [ ] "Zap it" functionality
- [ ] Rating system (0-5 stars, 0.5 increments)
- [ ] Review text input (140 chars)
- [ ] Personal diary view

#### Week 4: Polish & Testing
- [ ] Responsive design
- [ ] Error handling
- [ ] Basic SEO
- [ ] User testing

### Phase 2: Social Features (Weeks 5-8)
**Goal**: Following system & social feeds

#### Week 5: User Profiles
- [ ] Public profile pages
- [ ] Username system
- [ ] Avatar uploads
- [ ] Profile customization

#### Week 6: Social Graph
- [ ] Follow/unfollow system
- [ ] Friend suggestions
- [ ] Privacy settings
- [ ] Notification system

#### Week 7: Social Feed
- [ ] Activity feed algorithm
- [ ] Spoiler-safe timeline
- [ ] Real-time updates (Supabase Realtime)
- [ ] Feed customization

#### Week 8: Lists Feature
- [ ] Create/edit lists
- [ ] List sharing
- [ ] Collaborative lists
- [ ] List discovery

### Phase 3: Enhancement (Weeks 9-12)
**Goal**: Advanced features & performance

#### Week 9: Advanced Features
- [ ] Advanced search & filters
- [ ] Statistics & insights
- [ ] Achievements/badges
- [ ] Export data

#### Week 10: Performance & Scale
- [ ] CDN optimization
- [ ] Image optimization
- [ ] Caching strategy
- [ ] Database optimization

#### Week 11: Multi-Sport Prep
- [ ] Generic sport abstraction
- [ ] Soccer/football integration
- [ ] Tennis integration
- [ ] Sport-specific UI adaptations

#### Week 12: Mobile App
- [ ] Expo setup
- [ ] Core features port
- [ ] Push notifications
- [ ] App store preparation

## Key Technical Goals

### 1. Performance Targets
- **Search Response**: <300ms (as specified)
- **Page Load**: <1s (web vitals)
- **Real-time Updates**: <500ms latency
- **Mobile Performance**: 60fps, <3s load

### 2. Scalability Goals
- **Users**: Support 10k+ concurrent users
- **Data**: Handle millions of matches/logs
- **Global**: Multi-region deployment ready
- **API**: 1000+ req/min per user

### 3. User Experience Goals
- **Onboarding**: <2 minutes to first "zap"
- **Discovery**: Relevant match suggestions
- **Social**: Engaging without spoilers
- **Retention**: Daily active usage

## Database Schema Enhancements

```sql
-- Enhanced schema with additional considerations
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  timezone TEXT DEFAULT 'UTC',
  spoiler_delay_hours INT DEFAULT 0, -- for delayed viewing
  privacy_level TEXT DEFAULT 'public', -- public, friends, private
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sports (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- 'f1', 'soccer', 'tennis'
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE matches (
  id BIGSERIAL PRIMARY KEY,
  sport_id INT REFERENCES sports(id),
  external_id TEXT, -- from source API
  title TEXT NOT NULL,
  description TEXT,
  venue TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  season TEXT, -- '2024', '2023-24'
  round_number INT, -- for F1 rounds, match days, etc.
  status TEXT DEFAULT 'scheduled', -- scheduled, live, finished, cancelled
  metadata JSONB, -- sport-specific data
  poster_url TEXT, -- event poster/image
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(sport_id, external_id)
);

CREATE TABLE logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  match_id BIGINT REFERENCES matches(id) ON DELETE CASCADE,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5), -- allows 0.5 steps
  review TEXT CHECK (length(review) <= 140),
  watched_at TIMESTAMPTZ, -- when they actually watched it
  spoiler_safe BOOLEAN DEFAULT true, -- hide from friends' feeds initially
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, match_id)
);

-- Additional indexes for performance
CREATE INDEX idx_matches_starts_at ON matches(starts_at);
CREATE INDEX idx_matches_sport_status ON matches(sport_id, status);
CREATE INDEX idx_logs_user_created ON logs(user_id, created_at DESC);
CREATE INDEX idx_logs_match_rating ON logs(match_id, rating DESC);
```

## API Structure

### Core Endpoints
```typescript
// tRPC Router Structure
export const appRouter = router({
  auth: authRouter,
  matches: matchesRouter,
  logs: logsRouter,
  social: socialRouter,
  lists: listsRouter,
  users: usersRouter,
});

// Key procedures
matches: {
  search: publicProcedure, // search upcoming/past matches
  getById: publicProcedure, // match details
  getUpcoming: publicProcedure, // next races/matches
  getLive: publicProcedure, // currently live events
}

logs: {
  create: protectedProcedure, // "zap it"
  update: protectedProcedure, // edit rating/review
  delete: protectedProcedure,
  getByUser: publicProcedure, // user's diary
  getByMatch: publicProcedure, // match reviews
}

social: {
  follow: protectedProcedure,
  unfollow: protectedProcedure,
  getFeed: protectedProcedure, // activity feed
  getFollowers: publicProcedure,
  getFollowing: publicProcedure,
}
```

## Deployment Strategy

### Production Stack
- **Web**: Vercel (Next.js optimization)
- **API**: Railway or Fly.io (tRPC server)
- **Database**: Supabase (managed PostgreSQL)
- **Cache**: Upstash Redis
- **CDN**: Vercel Edge Network
- **Monitoring**: Sentry + PostHog

### Environment Setup
```bash
# Development
npm run dev          # Start all apps in development
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed with F1 data

# Production
npm run build        # Build all apps
npm run deploy       # Deploy to production
```

This skeleton gives you a solid foundation to build Hala while keeping the core Letterboxd DNA but adapting it perfectly for sports consumption patterns. 