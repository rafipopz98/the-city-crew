# TCC Manager - Progress Tracker

## ✅ Completed Features

### Database Models
- [x] `game_players` - Player collection with all attributes from CSV
- [x] `game_users` - Game user data (XP, coins, match stats, onboarding status)
- [x] `game_owned_players` - User's owned players with squad assignments
- [x] `game_squads` - 5v5 squad configurations
- [x] `game_matches` - Match history with events and stats

### Player Import
- [x] CSV import script (`scripts/import-game-players.ts`)
- [x] Idempotent import (safe to run multiple times)
- [x] All player attributes mapped from CSV (ratings, positions, rarity, price, etc.)

### Game API Routes
- [x] `GET /api/game/user` - Get/auto-create game user
- [x] `PUT /api/game/user` - Update username
- [x] `POST /api/game/user/onboarding` - Complete onboarding, grant starter players
- [x] `GET /api/game/players` - List players with pagination and filters
- [x] `GET /api/game/collection` - Collection with ownership status
- [x] `GET /api/game/shop` - Shop items with lock/afford status
- [x] `POST /api/game/shop` - Buy a player
- [x] `GET /api/game/squad` - Get active squad and owned players
- [x] `PUT /api/game/squad` - Save squad configuration
- [x] `POST /api/game/match/start` - Simulate match and calculate rewards

### Match Engine
- [x] Attribute-based 5v5 simulation
- [x] Position effectiveness (natural vs out-of-position penalty)
- [x] Squad rating calculation
- [x] Dynamic opponent generation
- [x] Match events (attacks, chances, goals, saves, half/full time)
- [x] Player of the Match
- [x] Rewards calculation (XP + coins) based on result

### Game UI Pages
- [x] `Game Layout` - Navigation, landscape orientation warning, auth guard
- [x] `Onboarding` - Welcome screen → Username input → Starter player reveal
- [x] `Home` - Stats overview, quick actions, match history preview
- [x] `Collection` - Full player grid with filters (search, rarity, position, ownership)
- [x] `Player Detail` - Attributes, rarity info, buy option
- [x] `Shop` - All players with lock/afford status, buy button
- [x] `Squad Builder` - 5v5 position-based squad assignment
- [x] `Play` - Matchmaking flow (idle → searching → found → start)
- [x] `Match Simulation` - Live event feed, final score, stats, rewards
- [x] `Profile` - User stats, XP, coins, career stats
- [x] `How to Play` - Game rules, tips, game loop explanation

### WebSocket PvP Multiplayer
- [x] `socket-server.ts` - Standalone Socket.io server entry point
- [x] `lib/game/socket/server.ts` - Matchmaking queue, rooms, event streaming
- [x] `lib/game/socket/client.ts` - React `useSocket()` hook for frontend
- [x] `lib/game/socket/matchEngine.ts` - PvP-specific match simulation engine
- [x] `lib/game/socket/types.ts` - Shared event types
- [x] `app/game/play/page.tsx` - Bot/PvP mode toggle in play UI
- [x] `app/game/play/pvp/page.tsx` - Full PvP flow (connect → queue → countdown → live events → result → save rewards)
- [x] `POST /api/game/match/pvp` - Persists PvP match results and rewards

### Performance Optimizations
- [x] `lib/game/utils/auth.ts` - Shared auth utility (eliminates duplicate cookie/token code)
- [x] `lib/game/hooks/useGameQuery.ts` - React Query hooks with 30s/15s/10s stale times, cache invalidation
- [x] Shop API - Aggregation pipeline instead of in-memory filter on all 50+ players
- [x] Collection API - Pagination + `$lookup` instead of two separate queries
- [x] Onboarding API - `bulkWrite` instead of individual `create()` calls
- [x] Squad API - `bulkWrite` for clear+reassign pattern
- [x] Skeleton components - `SkeletonGrid`, `SkeletonStats`, `SkeletonSquadSlots`, `LoadingState`, `ErrorState`
- [x] Shimmer animation added to `globals.css`
- [x] All 6 game pages updated with skeleton loading + error states + React Query caching

### Bug Fixes
- [x] **Match start 500 error** - Added `"possession"` to MatchEventSchema enum; changed `player_of_match.playerId` from ObjectId to String
- [x] **PvP match 500 error** - Added `delete mongoose.models.GameMatch` to force schema recompile on hot reload
- [x] **Shop `||` bug** - Changed `player.price || 999999` to `player.price ?? 999999` (0 was treated as unaffordable)
- [x] **Squad loading bug** - Fixed `indexOf` position mapping (was overwriting duplicate MID slots)
- [x] **Game layout redirect** - `?redirect=` query param added so login sends users back to game page

### Balance Changes
- [x] **Bot XP halved** - `baseXP` 10→5, rating divisors doubled, random ranges halved
  - Win: 17-26 → 8-13 XP (70-rated squad)
  - Draw: 13-17 → 6-9 XP
  - Loss: 5-9 → 2-5 XP
- [x] **Bot coins reduced 25%** - Win: 10-30 → 7-22, Draw: 5-15 → 3-11, Loss: 2-7 → 2-6
- [x] **PvP XP halved** - `baseXp` 15→8, bonuses reduced, ranges halved
  - Win: 25-30 → 10-12 XP
  - Draw: 20-25 → 9-11 XP
  - Loss: 18-23 → 8-10 XP
- [x] **PvP coins reduced 25%** - Win: 25-35 → 20-25, Draw: 18-28 → 15-20, Loss: 14-24 → 12-17

### UX Improvements
- [x] **Username in sign-up form** - Optional username field during registration
- [x] **Register API** - Accepts username, checks duplicates, saves to User model
- [x] **Onboarding API** - GET endpoint checks for existing username; POST auto-fills from User model
- [x] **Onboarding page** - Skips username step if already set during sign-up
- [x] **Auto-redirect after match** - Both bot and PvP result pages auto-redirect to home after 4 seconds
- [x] **Squad auto-assign** - First-time squad auto-fills best-fit players by position
- [x] **Formation display** - Shows formation name and slot breakdown on squad page
- [x] **Primary position in picker** - Player list shows natural position with green/amber color coding

### Match History
- [x] `GET /api/game/match/history` - Paginated endpoint, newest first, select only needed fields
- [x] `useMatchHistory(page, limit)` hook with `keepPreviousData` for smooth pagination
- [x] `app/game/history/page.tsx` - Full page with:
  - Result badges (green Win / red Loss / gray Draw)
  - Score, opponent name, XP earned, coins earned, shot counts
  - Human-readable time ago ("2m ago", "3d ago")
  - Pagination with Previous/Next
  - Loading skeleton, error state, empty state with "Play Now" CTA
  - Each match row links to full match detail page
- [x] Home page - "View All" link added to match history section

### Leaderboard
- [x] `GET /api/game/leaderboard?sort=xp` - Multiple sort modes with ranked results
- [x] 5 leaderboard tabs: XP, Win Rate (min 10 matches), Wins, Streak, Goals
- [x] `useLeaderboard(sort)` hook with 15s stale time
- [x] `app/game/leaderboard/page.tsx` - Tabbed interface with:
  - Color-coded rank badges (gold crown #1, silver/bronze medals #2-3)
  - Column layout showing primary stat + wins + matches
  - Loading skeleton, error state, empty state
- [x] Added to game navigation bar (between Collection and Profile)

### Bug Fix
- [x] **MissingSchemaError fix** - Changed `GamePlayerModel` import to side-effect import to prevent Next.js tree-shaking (populate was failing because schema wasn't registered)

- [x] Run `scripts/import-game-players.ts` to import CSV data into MongoDB

- [x] Add player images to `public/game/` folder
- [x] Add match replay feature
## 📋 Pending Tasks

- [] Add sound effects
