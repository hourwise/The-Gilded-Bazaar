# The Gilded Bazaar

AI-powered economy & downtime for TTRPGs.

## Description

The Gilded Bazaar is a campaign companion app for tabletop RPG groups. It helps DMs run shops, manage party purchases, handle approvals, and track campaign economy between sessions. It is not a character sheet replacement — it operates alongside your existing tools.

## Tech Stack

- **Mobile**: React Native (Expo SDK 55) + TypeScript
- **UI**: React Native Paper + custom fantasy design system
- **Backend**: Supabase (Postgres, Auth, RLS, Realtime, Edge Functions)
- **Payments**: RevenueCat (future)
- **Push**: Notifee

## Project Structure

```txt
src/
  app/            # App providers and root
  assets/         # Images, icons, textures
  components/     # Reusable UI components
  config/         # Environment configuration
  hooks/          # Custom React hooks
  lib/            # Supabase client, types, utilities
  navigation/     # Navigators and route types
  screens/        # Screen components by feature
  services/       # Data access layer (Supabase calls)
  theme/          # Colours, spacing, typography, Paper theme
  types/          # TypeScript type definitions
  utils/          # Helper functions

api/
  migrations/     # Supabase SQL migration files
  seed.sql        # Development seed data
  schema.sql      # Combined schema reference
```

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your Supabase credentials
3. Install dependencies: `npm install`
4. Run the database migrations in your Supabase project
5. Start the app: `npm start`

### Database Migrations

Run migrations in order in the Supabase SQL Editor:

```txt
api/migrations/001_profiles.sql
api/migrations/002_player_characters.sql
api/migrations/003_campaigns.sql
api/migrations/004_campaign_members.sql
api/migrations/005_settlements.sql
api/migrations/006_shops.sql
api/migrations/007_items_library.sql
api/migrations/008_shop_inventory.sql
api/migrations/009_backpacks.sql
api/migrations/010_purchase_requests.sql
api/migrations/011_economy_transactions.sql
api/migrations/012_campaign_feed.sql
api/migrations/013_downtime_tasks.sql
api/migrations/014_ai_generation_jobs.sql
api/migrations/015_rpc_functions.sql
api/seed.sql
```

## Architecture

### Service Layer

All Supabase calls are wrapped in services:

- `authService.ts` — sign up, sign in, sign out, session
- `profileService.ts` — profiles and player characters
- `campaignService.ts` — campaigns, members, join codes
- `shopService.ts` — shops, inventory, item library
- `purchaseService.ts` — purchase requests, approvals, rejections (RPC)
- `feedService.ts` — campaign feed entries

### Secure Purchase Flow

Client-side gold deduction is removed. Purchases flow through:

1. Player requests purchase (`request_purchase` RPC)
2. Backend validates balance, stock, membership
3. DM approves (`approve_purchase` RPC) or rejects (`reject_purchase` RPC)
4. Backend atomically updates wallet, stock, backpack, and feed

### Role Model

Roles are per-campaign, not global:

- `owner_dm` — Campaign creator
- `co_dm` — Assistant DM
- `player` — Regular participant
- `spectator` — Read-only access

A user can be a DM in one campaign and a player in another.

## Brand

**Name**: The Gilded Bazaar  
**Tagline**: AI-powered economy & downtime for TTRPGs  
**Theme**: Clean Fantasy (dark chrome, parchment cards, gold accents)

## Current Status

- [x] Database schema designed with RLS
- [x] Migration files written
- [x] RPC functions for secure purchases
- [x] Expo project cleaned up (Firebase removed)
- [x] Theme system and navigation extracted
- [x] Service layer created
- [ ] Screens updated to use new schema
- [ ] Onboarding creates player_characters
- [ ] DM dashboard uses campaign_members roles
- [ ] Player shop uses secure purchase flow
- [ ] Purchase approval screen
- [ ] Campaign feed UI

## License

MIT