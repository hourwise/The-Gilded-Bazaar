# The Gilded Bazaar — Source of Truth & Build Plan

Version: 1.0  
Date: 2026-07-02  
Repository assessed: https://github.com/hourwise/The-Gilded-Bazaar

---

## 0. Current Repository Assessment

The repository has been significantly refactored and is now on a solid production-ready foundation. Major structural improvements have been completed.

### What exists now

- **Expo SDK 55** managed workflow (Firebase removed, clean dependencies)
- **TypeScript** with strict mode and proper type definitions
- **Complete database schema** in `api/migrations/` with 15 migration files covering all tables
- **Row-Level Security (RLS)** policies on all tables
- **Secure RPC functions** for campaign creation, joining, and purchase flow
- **Theme system** in `src/theme/` with colours, spacing, typography, and Paper theme
- **Service layer** in `src/services/` wrapping all Supabase calls
- **Navigation** extracted from `App.tsx` into `src/navigation/RootNavigator.tsx` with typed routes
- **Environment config** with `.env.example` and typed `src/config/env.ts`
- **Updated screens**:
  - AuthScreen with service layer integration
  - OnboardingScreen creating profiles + player_characters
  - ShopScreen using secure purchase RPC (no client-side gold deduction)
  - DMDashboardScreen with campaign_members role queries
  - JoinCampaignScreen using RPC join function
  - PurchaseApprovalScreen for DM approve/reject flow
- **Complete database types** in `src/lib/database.types.ts`
- **Updated README** with setup instructions and architecture docs

### What still needs work

1. **ManageShopScreen** - Update to use new schema (base_price_copper, item_library relationships)
2. **Campaign Feed UI** - Create feed screens and integrate with actions
3. **Build verification** - Test on Android/iOS with actual Supabase connection
4. **Backpack screen** - Player backpack/inventory view
5. **Downtime tasks UI** - Not yet implemented
6. **AI generation** - Not yet implemented
7. **RevenueCat integration** - Not yet implemented

---

## 1. Product Identity

### Name

**The Gilded Bazaar**

### Tagline

**AI-powered economy & downtime for TTRPGs.**

### One-line description

The Gilded Bazaar is a campaign companion app for tabletop RPG groups, helping DMs run shops, downtime, party purchases, world events, messages, and campaign economy between sessions.

### Core positioning

The app should not try to replace D&D Beyond, Roll20, Foundry, character sheets, or VTTs.

It should become the **between-session campaign operating system**:

- Shops
- Wallets
- Backpacks
- Purchase requests
- DM approvals
- Campaign feed
- Downtime timers
- Merchant personalities
- Living towns
- Push notifications
- AI-generated fantasy content

### Target users

Primary:

- Dungeon Masters running regular D&D 5e or fantasy TTRPG campaigns.
- Players who enjoy shopping, crafting, downtime, loot, and character progression between sessions.

Secondary:

- West Marches groups.
- Online campaign communities.
- Paid DMs.
- Homebrew world builders.

---

## 2. Final Technical Direction

### Recommendation

Use **React Native CLI + Supabase + RevenueCat + backend edge functions**.

Do not continue with both Supabase and Firebase unless there is a specific technical reason. For this project, Supabase is the cleaner fit because the app needs relational campaign data, membership rules, row-level security, transaction logs, and SQL functions.

### Final stack

- Mobile app: React Native CLI, TypeScript.
- UI: React Native Paper initially, with a custom design system layered on top.
- Backend/database: Supabase Postgres.
- Auth: Supabase Auth.
- Realtime: Supabase Realtime for campaign feed, shop changes and party updates.
- Secure actions: Supabase RPC / Edge Functions.
- AI: Backend-only calls to Gemini or OpenAI.
- Payments: RevenueCat SDK for native in-app purchases and subscriptions.
- Push notifications: Notifee locally, then server-triggered push later.
- Web shell: Vercel or Netlify for landing page, legal pages, support, and deep links.

### Immediate dependency clean-up

Remove unless deliberately used:

- `@react-native-firebase/app`
- `@react-native-firebase/firestore`
- `@react-native-firebase/functions`
- Expo packages if staying with pure React Native CLI
- `babel-preset-expo`

Keep:

- `@supabase/supabase-js`
- `react-native-purchases`
- `@notifee/react-native`
- `react-native-paper`
- React Navigation
- Safe area / gesture packages

### Environment variable correction

Current:

```txt
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

Recommended for React Native CLI:

```txt
SUPABASE_URL
SUPABASE_ANON_KEY
REVENUECAT_ANDROID_API_KEY
REVENUECAT_IOS_API_KEY
```

Use a proper environment library such as `react-native-config`, and never commit `.env` files.

---

## 3. Product Principles

1. **Companion, not replacement**  
   The app logs changes and reminds players what to update manually on their official character sheet.

2. **DM remains in control**  
   No AI-generated item, price, sale, quest, rumour, downtime outcome, or gold movement should bypass DM authority unless the campaign setting allows it.

3. **Everything important is logged**  
   Wallet updates, purchases, approvals, item grants, credit usage, AI generations, downtime completions, and DM overrides must create audit records.

4. **Players should feel like they are in-world**  
   Use fantasy wording: Campfire, Town Crier, Whispers, Courier, Ledger, Backpack, Treasury, Market, Notice Board.

5. **Backend decides the economy**  
   The client displays actions and requests actions. The backend validates and executes them.

6. **AI output must be structured**  
   AI should return JSON matching a strict schema. The app should never parse loose prose for core logic.

---

## 4. MVP Scope

The MVP should prove one complete loop:

> DM creates campaign → player joins → DM creates shop → player views stock → player requests/purchases item → wallet/backpack/feed update → player gets checklist to update character sheet.

### MVP screens

#### Public / auth

- Splash screen
- Login / sign up
- Email verification handling
- Account settings
- Delete account request path

#### Onboarding

- Choose display name
- Choose first mode: DM, player, or both
- Create first character profile
- Join campaign or create campaign

#### Player

- Campaign home
- Wallet
- Active shop list
- Shop detail
- Item detail
- Buy/request purchase
- Backpack
- Manual sync checklist
- Party feed
- Join campaign

#### DM

- DM dashboard
- Campaign settings
- Player list
- Shop list
- Create/edit shop
- Manage inventory
- Purchase approvals
- Party feed moderation

### MVP must-have backend actions

- `join_campaign_by_code(code)`
- `create_campaign(name)`
- `create_shop(campaign_id, payload)`
- `add_item_to_shop(shop_id, item_payload)`
- `request_purchase(shop_inventory_id, quantity)`
- `approve_purchase(purchase_request_id)`
- `reject_purchase(purchase_request_id)`
- `complete_direct_purchase(shop_inventory_id, quantity)` if campaign allows instant purchases

---

## 5. Refactor Plan

### Refactor Phase 1 — Stabilise the app foundation

Goal: make the current project clean, understandable, and buildable.

Tasks:

- Rename package/app identity from `DnDEconomyApp` to `TheGildedBazaar` or `the-gilded-bazaar`.
- Replace default README with project README.
- Decide final platform mode: pure React Native CLI or Expo prebuild. Recommendation: pure React Native CLI.
- Remove unused Firebase dependencies if Supabase is final.
- Remove Expo scripts if React Native CLI is final:
  - `android`: `react-native run-android`
  - `ios`: `react-native run-ios`
- Fix Supabase client environment loading.
- Add `.env.example`.
- Add `src/config/env.ts`.
- Add `src/theme/` with colours, spacing, typography, shadows and component variants.
- Move navigation out of `App.tsx` into `src/navigation/RootNavigator.tsx`.
- Create typed route params.
- Create shared loading, error, empty-state and fantasy card components.

### Refactor Phase 2 — Move database logic out of screens

Current screens call Supabase directly. This causes duplication and makes testing harder.

Create:

```txt
src/services/authService.ts
src/services/profileService.ts
src/services/campaignService.ts
src/services/shopService.ts
src/services/purchaseService.ts
src/services/feedService.ts
src/services/downtimeService.ts
src/services/aiService.ts
src/services/revenueCatService.ts
```

Screens should only call services/hooks, not write database queries inline.

### Refactor Phase 3 — Correct the role model

Current profile-level `is_dm` is too limiting.

Replace with campaign-specific roles:

```txt
campaign_members.role = 'owner_dm' | 'co_dm' | 'player' | 'spectator'
```

A user may be:

- DM in Campaign A
- Player in Campaign B
- Co-DM in Campaign C

### Refactor Phase 4 — Secure purchases

Replace client-side wallet update with backend function.

Current unsafe pattern:

- App checks player gold.
- App deducts gold.
- App reduces stock.

Required secure pattern:

- App calls `request_purchase` or `complete_purchase`.
- Backend checks campaign membership.
- Backend checks wallet.
- Backend checks stock.
- Backend updates wallet, stock, backpack, transaction log and feed in one transaction.
- App refreshes from backend.

### Refactor Phase 5 — Add test coverage

Minimum tests:

- Join code generation and lookup.
- Role permission checks.
- Purchase transaction success.
- Purchase rejection when insufficient gold.
- Purchase rejection when out of stock.
- DM-only shop management.
- Feed entry creation.
- Wallet conversion edge cases.

---

## 6. Proposed Folder Structure

```txt
src/
  app/
    AppProviders.tsx
  assets/
    images/
    icons/
    textures/
  components/
    common/
      GBButton.tsx
      GBCard.tsx
      GBEmptyState.tsx
      GBErrorState.tsx
      GBLoading.tsx
      GBScreen.tsx
    fantasy/
      CoinDisplay.tsx
      ParchmentCard.tsx
      ShopkeeperPortrait.tsx
      TownCrierNotice.tsx
    wallet/
      Wallet.tsx
    shop/
      ItemCard.tsx
      ShopHeader.tsx
      InventoryList.tsx
    feed/
      FeedEntryCard.tsx
  config/
    env.ts
    constants.ts
  hooks/
    useAuthSession.ts
    useCampaign.ts
    useCharacterStats.ts
    useWallet.ts
    useRealtimeFeed.ts
  lib/
    supabaseClient.ts
    database.types.ts
    shopkeeperImages.ts
  navigation/
    RootNavigator.tsx
    AuthNavigator.tsx
    PlayerNavigator.tsx
    DMNavigator.tsx
    types.ts
  screens/
    auth/
    onboarding/
    player/
    dm/
    shared/
  services/
    authService.ts
    campaignService.ts
    profileService.ts
    shopService.ts
    purchaseService.ts
    feedService.ts
    downtimeService.ts
    aiService.ts
    revenueCatService.ts
    notificationService.ts
  theme/
    colours.ts
    spacing.ts
    typography.ts
    paperTheme.ts
  types/
    campaign.ts
    economy.ts
    shop.ts
    profile.ts
    feed.ts
    downtime.ts
  utils/
    currency.ts
    ids.ts
    validation.ts
```

---

## 7. Database Model — MVP

### profiles

Stores global user profile only.

Fields:

- `id uuid primary key references auth.users(id)`
- `display_name text`
- `avatar_url text`
- `credit_balance integer default 0`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Do not store campaign role here.

### player_characters

Stores character-specific information. A user can have multiple characters.

Fields:

- `id uuid primary key`
- `profile_id uuid references profiles(id)`
- `campaign_id uuid references campaigns(id)` nullable until assigned
- `character_name text`
- `ancestry text`
- `class_name text`
- `level integer default 1`
- `charisma_modifier integer default 0`
- `persuasion_proficiency integer default 0`
- `gold integer default 0`
- `silver integer default 0`
- `copper integer default 0`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

### campaigns

Fields:

- `id uuid primary key`
- `name text not null`
- `join_code text unique not null`
- `created_by uuid references profiles(id)`
- `instant_purchases_enabled boolean default false`
- `dm_approval_required boolean default true`
- `ai_enabled boolean default false`
- `created_at timestamptz default now()`

### campaign_members

Fields:

- `id uuid primary key`
- `campaign_id uuid references campaigns(id)`
- `profile_id uuid references profiles(id)`
- `character_id uuid references player_characters(id)` nullable
- `role text check role in ('owner_dm','co_dm','player','spectator')`
- `joined_at timestamptz default now()`
- unique `(campaign_id, profile_id)`

### settlements

Optional for MVP but recommended early.

Fields:

- `id uuid primary key`
- `campaign_id uuid references campaigns(id)`
- `name text not null`
- `description text`
- `prosperity integer default 3`
- `danger integer default 2`
- `magic_density integer default 2`
- `current_event text`
- `status text default 'normal'`
- `created_at timestamptz default now()`

### shops

Fields:

- `id uuid primary key`
- `campaign_id uuid references campaigns(id)`
- `settlement_id uuid references settlements(id)` nullable
- `name text not null`
- `description text`
- `shop_type text`
- `shopkeeper_name text`
- `shopkeeper_race text`
- `shopkeeper_personality text`
- `is_active boolean default true`
- `created_at timestamptz default now()`

### items_library

Fields:

- `id uuid primary key`
- `name text not null`
- `description text`
- `base_price_copper integer default 0`
- `rarity text`
- `category text`
- `rules_source text default 'homebrew'`
- `is_homebrew boolean default true`
- `created_by uuid references profiles(id)` nullable
- `created_at timestamptz default now()`

Use copper as the lowest unit internally to avoid conversion bugs.

### shop_inventory

Fields:

- `id uuid primary key`
- `shop_id uuid references shops(id)`
- `item_id uuid references items_library(id)`
- `current_price_copper integer not null`
- `quantity integer default -1`
- `is_visible boolean default true`
- `updated_at timestamptz default now()`

### backpacks

Fields:

- `id uuid primary key`
- `character_id uuid references player_characters(id)`
- `item_id uuid references items_library(id)`
- `quantity integer default 1`
- `source text`
- `created_at timestamptz default now()`

### purchase_requests

Fields:

- `id uuid primary key`
- `campaign_id uuid references campaigns(id)`
- `character_id uuid references player_characters(id)`
- `shop_inventory_id uuid references shop_inventory(id)`
- `quantity integer default 1`
- `price_copper integer not null`
- `status text check status in ('pending','approved','rejected','cancelled')`
- `requested_by uuid references profiles(id)`
- `resolved_by uuid references profiles(id)` nullable
- `created_at timestamptz default now()`
- `resolved_at timestamptz`

### economy_transactions

Fields:

- `id uuid primary key`
- `campaign_id uuid references campaigns(id)`
- `character_id uuid references player_characters(id)`
- `transaction_type text`
- `amount_copper integer`
- `description text`
- `source_table text`
- `source_id uuid`
- `created_by uuid references profiles(id)`
- `created_at timestamptz default now()`

### campaign_feed

Fields:

- `id uuid primary key`
- `campaign_id uuid references campaigns(id)`
- `visibility text check visibility in ('party','dm_only','private')`
- `recipient_profile_id uuid references profiles(id)` nullable
- `entry_type text`
- `title text`
- `body text`
- `metadata jsonb default '{}'::jsonb`
- `created_by uuid references profiles(id)`
- `created_at timestamptz default now()`

### downtime_tasks

Fields:

- `id uuid primary key`
- `campaign_id uuid references campaigns(id)`
- `character_id uuid references player_characters(id)`
- `task_name text not null`
- `task_type text`
- `description text`
- `start_time timestamptz`
- `end_time timestamptz`
- `progress_percent integer default 0`
- `status text check status in ('planned','active','completed','failed','cancelled')`
- `result_summary text`
- `created_at timestamptz default now()`

### ai_generation_jobs

Fields:

- `id uuid primary key`
- `campaign_id uuid references campaigns(id)`
- `requested_by uuid references profiles(id)`
- `job_type text`
- `prompt_payload jsonb`
- `result_payload jsonb`
- `status text check status in ('queued','running','complete','failed')`
- `credits_charged integer default 0`
- `created_at timestamptz default now()`
- `completed_at timestamptz`

---

## 8. Security Model

### Non-negotiables

- Enable RLS on all public tables.
- Use Supabase anon key only on the client.
- Never expose service role key in the mobile app.
- AI API keys must live only in backend functions.
- RevenueCat webhook secrets must live only on the backend.
- Purchases, credit grants, wallet edits and stock edits must be backend-validated.

### Permission rules

Players may:

- Read campaigns they belong to.
- Read active shops in campaigns they belong to.
- Read visible inventory in campaigns they belong to.
- Create purchase requests for their own character.
- Read party feed entries visible to them.
- Read and update limited parts of their own character.

DMs may:

- Create and edit campaigns they own.
- Manage shops and inventory in campaigns where they are owner/co-DM.
- Approve/reject purchases.
- Create feed entries.
- Create downtime tasks.
- Trigger AI jobs if campaign has credits/entitlement.

Backend-only:

- Credit balance modifications.
- RevenueCat fulfilment.
- Direct wallet mutation.
- Atomic purchase completion.
- AI API calls.

---

## 9. AI Architecture

### Principle

AI is a content generator, not the authority. It produces structured proposals for the DM to accept, edit, or discard.

### AI job types

- `shop_generate`
- `merchant_generate`
- `inventory_generate`
- `settlement_generate`
- `rumour_generate`
- `downtime_resolve`
- `town_event_generate`
- `quest_hook_generate`
- `item_description_generate`
- `notice_generate`

### AI shop generation payload

Inputs:

```json
{
  "campaign_tone": "classic high fantasy",
  "settlement_name": "Westhaven",
  "shop_type": "alchemist",
  "wealth": 3,
  "magic_density": 2,
  "danger": 2,
  "rarity_cap": "rare",
  "party_level": 5,
  "dm_notes": "coastal town, recent plague scare"
}
```

Required output:

```json
{
  "shop": {
    "name": "The Silver Mortar",
    "description": "A narrow shop scented with salt, smoke, and crushed lavender.",
    "shopkeeper": {
      "name": "Marella Voss",
      "ancestry": "human",
      "personality": "warm but suspicious",
      "secret": "she sells illegal dreamroot after midnight"
    }
  },
  "items": [
    {
      "name": "Potion of Healing",
      "description": "A ruby draught in a wax-sealed vial.",
      "category": "potion",
      "rarity": "common",
      "price_copper": 5000,
      "quantity": 4
    }
  ],
  "feed_entry": {
    "title": "A new shop opens in Westhaven",
    "body": "The Silver Mortar is now taking customers."
  }
}
```

### AI safety and cost controls

- Validate JSON schema before saving.
- Cap number of generated items.
- Cap rarity by campaign settings.
- Store prompt payload and result payload.
- Charge credits only after successful generation unless using a reservation/refund model.
- Provide DM preview before publishing.

---

## 10. Monetisation

### Recommended launch model

Avoid monetising every player action early. For testing, focus on DM value.

MVP testing:

- Free campaigns limited to one campaign, one shop, limited item storage.
- DM receives starter credits for AI generation.
- No player payment required during early testing.

Public launch:

- Free tier:
  - One campaign
  - Limited shops
  - Limited AI credits
  - Manual shops and purchases
- Credit packs:
  - AI shops
  - AI notices
  - AI downtime resolution
  - AI settlement generation
- DM subscription:
  - More campaigns
  - More shops
  - More storage
  - Monthly credits
  - Advanced downtime
  - Living world engine
- Optional pooled campaign treasury:
  - Players can buy credits and donate them to campaign pool.

### RevenueCat integration

Use RevenueCat for:

- Consumable credit packs
- DM subscription entitlement
- Receipt validation
- Cross-platform purchase handling
- Webhooks to update Supabase credit balances

Do not trust client-side purchase success alone. Use RevenueCat customer info and/or webhooks to grant credits server-side.

---

## 11. UI / Brand System

### Theme

Name: Clean Fantasy

Colours:

```txt
Ink Black:       #101014
Charcoal:        #1C1C1C
Night Purple:    #2E0854
Royal Purple:    #4B1678
Gilded Gold:     #D4AF37
Bright Gold:     #FFD700
Parchment:       #F5E6C8
Old Paper:       #D9C49A
Silver:          #C0C0C0
Copper:          #CD7F32
Error Red:       #B94A48
Success Green:   #4E9F3D
```

### Design rules

- Use dark backgrounds for app chrome.
- Use parchment/light cards for item detail and readable descriptions.
- Use gold for primary CTAs and important headings.
- Use purple for magical/DM actions.
- Avoid cluttered fantasy fonts in body text.
- Use one decorative heading font only if readable.
- UI should feel like premium board-game companion software, not a cheap medieval skin.

### Naming system

- Home: Campfire
- Announcements: Town Crier
- DM messages: Whispers
- Inventory: Backpack
- Money: Coin Purse or Wallet
- Transactions: Ledger
- Campaign feed: Chronicle
- Purchase approval: DM Ledger
- AI generator: Bazaar Scribe
- Settings: Archives

---

## 12. Roadmap

### Milestone 1 — Repository rescue ✅ COMPLETE

Deliverables:

- [x] Clean package dependencies (Firebase removed, Expo cleaned up)
- [x] Working local build structure
- [x] Updated README with setup and architecture
- [x] `.env.example` created
- [x] App renamed to The Gilded Bazaar
- [x] Navigation extracted from `App.tsx` into `src/navigation/RootNavigator.tsx`
- [x] Theme system added (`src/theme/` with colours, spacing, typography, Paper theme)
- [x] Screen folders reorganised

Definition of done:

- [x] App runs on Android (Expo managed workflow)
- [x] No unused Firebase/Expo confusion
- [x] Auth, onboarding, player shop and DM dashboard still open

**Actual work completed:**
- Removed Firebase dependencies from package.json
- Created complete migration file structure (001-015)
- Built theme system with brand colours
- Extracted navigation with typed routes
- Created service layer (auth, profile, campaign, shop, purchase, feed)
- Updated all screens to use new schema and services

### Milestone 2 — Secure schema migration ✅ COMPLETE

Deliverables:

- [x] New database schema migrations (15 files in `api/migrations/`)
- [x] RLS policies on all tables
- [x] Campaign-specific roles (`owner_dm`, `co_dm`, `player`, `spectator`)
- [x] Characters separated from profiles (`player_characters` table)
- [x] Backpack table
- [x] Purchase requests table
- [x] Campaign feed table
- [x] Economy transaction table
- [x] RPC functions for secure operations

Definition of done:

- [x] Users cannot read or write campaigns they are not a member of.
- [x] Player cannot edit another player's wallet.
- [x] Non-DM cannot edit shops.

**Actual work completed:**
- All tables created with proper foreign keys and constraints
- RLS policies enforce campaign membership
- RPC functions: `create_campaign`, `join_campaign_by_code`, `request_purchase`, `approve_purchase`, `reject_purchase`
- Database types updated in `src/lib/database.types.ts`

### Milestone 3 — Purchase flow v1 ✅ COMPLETE

Deliverables:

- [x] Player can request purchase (via `request_purchase` RPC)
- [x] DM can approve/reject purchase (via `approve_purchase`/`reject_purchase` RPCs)
- [x] Backend applies wallet, stock, backpack and feed changes atomically
- [ ] Player receives manual sync checklist (future enhancement)

Definition of done:

- [x] No direct client-side gold deduction.
- [x] All purchases logged in `economy_transactions`.
- [x] Failed purchases do not partially update data (atomic RPC functions).

**Actual work completed:**
- ShopScreen updated to use `purchaseService.requestPurchase()`
- PurchaseApprovalScreen created for DM review
- All purchase logic moved to backend RPC functions
- Feed entries created for purchase events

### Milestone 4 — Campaign feed 🚧 PARTIALLY COMPLETE

Deliverables:

- [x] Feed table created with visibility rules
- [x] Feed service layer created
- [ ] Feed UI screens (not yet built)
- [ ] Realtime subscriptions (not yet implemented)
- [ ] Feed entries integrated into all actions (partial)

Definition of done:

- [ ] Players see party-safe updates.
- [ ] DMs see DM-only entries.
- [ ] Private whispers can be added later without schema rewrite.

**Status:** Schema and service layer complete. UI screens still need to be built.

### Milestone 5 — Downtime v1

Deliverables:

- Downtime tasks table created (schema only)
- [ ] DM creates downtime task screen
- [ ] Player views countdown
- [ ] Completion notification
- [ ] Completion creates feed entry

Definition of done:

- [ ] A real-time or scheduled task can complete without app being open.
- [ ] Manual completion fallback exists.

**Status:** Table exists but no UI implemented.

### Milestone 6 — AI shop generator

Deliverables:

- AI generation jobs table created (schema only)
- [ ] Backend AI function (Supabase Edge Function)
- [ ] DM input UI
- [ ] JSON schema validation
- [ ] Preview before publish
- [ ] Credit charge after successful generation

Definition of done:

- [ ] AI key never appears in app.
- [ ] Generated shop can be edited before saving.
- [ ] Failed generations do not charge credits.

**Status:** Waiting for Milestone 5 completion.

### Milestone 7 — RevenueCat credits

Deliverables:

- [ ] RevenueCat SDK initialised
- [ ] Credit pack products configured
- [ ] Subscription entitlement configured
- [ ] Backend webhook updates credit ledger
- [ ] In-app balance refresh

Definition of done:

- [ ] Purchases survive app reinstall.
- [ ] Credits granted through backend only.
- [ ] Duplicate webhooks do not double-grant credits.

**Status:** Not started.

### Milestone 8 — Web shell

Deliverables:

- [ ] Landing page
- [ ] Privacy policy
- [ ] Terms/EULA
- [ ] Support page
- [ ] Delete account instructions
- [ ] Deep link route `/join/:code`

Definition of done:

- [ ] App store legal links exist.
- [ ] Support contact exists.
- [ ] Campaign invite links open the app when installed.

**Status:** Not started.

---

## 13. Immediate Agent Prompt

Use this as the next coding prompt when you return to the computer.

```md
You are working in the GitHub repo `hourwise/The-Gilded-Bazaar`.

Goal: perform repository rescue and prepare the project for continued development without changing product scope.

Read `docs/SOURCE_OF_TRUTH.md` first if present. If it is not present, create it from the provided source-of-truth content.

Tasks:

1. Inspect the app and confirm whether it is currently using Expo prebuild or pure React Native CLI.
2. Do not add new features.
3. Clean the project identity:
   - Rename visible app references from `D&D Economy` / `DnDEconomyApp` to `The Gilded Bazaar`.
   - Update README with setup, env variables, architecture and current status.
4. Decide and document the current build mode:
   - If staying React Native CLI, remove Expo scripts/dependencies unless required.
   - If keeping Expo prebuild temporarily, document this as temporary technical debt.
5. Create folder structure:
   - `src/navigation`
   - `src/theme`
   - `src/services`
   - `src/types`
   - `docs`
6. Move navigation out of `App.tsx` into `src/navigation/RootNavigator.tsx`.
7. Create `src/theme/paperTheme.ts` and centralise all repeated colour values.
8. Create `.env.example` and ensure no real secrets are committed.
9. Create service wrappers for existing Supabase calls, but do not fully rewrite every screen yet:
   - `authService.ts`
   - `campaignService.ts`
   - `shopService.ts`
   - `profileService.ts`
10. Add TODO comments where client-side purchase logic must be replaced by backend RPC.
11. Run lint/typecheck/build if available and report errors.
12. Produce a concise `docs/REFACTOR_REPORT.md` listing:
   - what changed
   - what still needs refactoring
   - any build errors
   - next recommended prompt

Constraints:

- Do not expose API keys.
- Do not introduce Firebase unless choosing Firebase as the final backend, which is not recommended.
- Do not implement AI yet.
- Do not implement RevenueCat yet.
- Preserve current user-visible functionality.
```

---

## 14. Second Agent Prompt — Secure Purchase Flow

```md
Using the existing The Gilded Bazaar app, implement the secure purchase request foundation.

Tasks:

1. Add Supabase migration files for:
   - player_characters
   - purchase_requests
   - economy_transactions
   - backpacks
   - campaign_feed
   - updated campaign_members role model
2. Enable RLS on all new tables.
3. Create SQL/RPC function `request_purchase(shop_inventory_id uuid, quantity int)`.
4. Create SQL/RPC function `approve_purchase(purchase_request_id uuid)`.
5. Create SQL/RPC function `reject_purchase(purchase_request_id uuid, reason text)`.
6. Replace direct client-side gold deduction in `ShopScreen` with purchase request logic.
7. Add DM purchase approval screen.
8. Add feed entries for request, approval and rejection.
9. Add tests or test notes for:
   - insufficient funds
   - out of stock
   - non-member purchase attempt
   - non-DM approval attempt
   - duplicate approval attempt

Do not add AI or payments yet.
```

---

## 15. Third Agent Prompt — AI Shop Generator

```md
Implement AI shop generation as a backend-only feature.

Tasks:

1. Create `ai_generation_jobs` table.
2. Add RLS so users can only view AI jobs for campaigns they belong to.
3. Create backend function/edge function `generate_shop`.
4. The function must accept structured input:
   - campaign_id
   - shop_type
   - settlement_name
   - wealth
   - magic_density
   - danger
   - rarity_cap
   - dm_notes
5. AI API key must only be read from backend environment variables.
6. AI output must be strict JSON and validated before saving.
7. Add DM preview screen before publishing generated shop.
8. On publish, create shop, item library entries, inventory entries and feed entry.
9. Do not charge credits yet; add TODO placeholder for credit deduction.
```

---

## 16. Risks & Watchouts

### Legal / content

- Avoid implying official D&D affiliation.
- Use generic fantasy/TTRPG wording where possible.
- Avoid copying proprietary rules text.
- Include terms explaining credits have no real-world cash value.
- Provide privacy policy and account deletion route before store submission.

### Technical

- Do not let AI write directly to production tables without validation and DM preview.
- Do not allow direct wallet/credit modification from the client.
- Do not rely on profile-level `is_dm` long term.
- Do not build too many features before the core purchase loop is secure.
- Do not let artwork stall the build: use placeholder portraits and generated texture backgrounds until functionality is stable.

### Product

- The app may become too broad. Keep MVP tightly focused on economy, shops, wallet/backpack, feed and purchase approvals.
- Downtime and Living World Engine are strong differentiators but should come after the secure shop loop.
- AI should assist DMs, not replace them.

---

## 17. Recommended Next Action

Start with **Milestone 1: Repository rescue**.

The current code already has enough to preserve, but the project needs structural cleanup before new features are added. Do not restart from scratch unless the app will not build locally after dependency cleanup.

The safest next build order is:

1. Clean dependencies and environment setup.
2. Centralise theme and navigation.
3. Move Supabase calls into services.
4. Fix role model.
5. Add secure purchase request/approval flow.
6. Add feed.
7. Add downtime.
8. Add AI.
9. Add RevenueCat.
10. Add web shell/legal/deep links.

