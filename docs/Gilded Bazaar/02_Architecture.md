# 02 — Architecture Specification

## Purpose

This document defines the technical architecture for The Gilded Bazaar.

The goal is to keep the project maintainable, secure and easy to resume after long breaks.

---

## Recommended Stack

## Mobile App

- Expo prebuild / Expo dev client
- React Native
- TypeScript
- React Navigation
- Supabase client
- RevenueCat SDK later

## Backend

- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security
- Supabase Edge Functions
- Supabase Storage later if needed

## AI Layer

- OpenAI API or Gemini API
- Called only from Supabase Edge Functions
- Structured JSON responses
- Server-side validation before database writes

## Web Shell

- Vercel or Netlify
- Static support/legal pages
- deep-link routing
- privacy policy
- terms/EULA
- account deletion instructions
- support form

---

## High-Level Architecture

```text
Mobile App
  |
  |-- Auth/session
  |-- Reads safe campaign data
  |-- Calls service layer
  v
Supabase
  |
  |-- Auth
  |-- Postgres
  |-- RLS policies
  |-- RPC functions
  |-- Edge functions
  v
External Services
  |
  |-- AI provider
  |-- RevenueCat
  |-- Push notification provider
```

---

## Architectural Rules

## 1. Screens Should Not Own Data Logic

Screens should render UI and call services.

Avoid this pattern:

```ts
const { data } = await supabase.from('shops').select('*')
```

Prefer:

```ts
const shops = await shopService.getCampaignShops(campaignId)
```

## 2. Sensitive Writes Must Be Server-Side

The client must not directly:

- approve purchases
- deduct wallet currency
- add premium credits
- spend premium credits
- apply economy modifiers
- update another user's backpack

These operations should use secure RPC functions or Edge Functions.

## 3. Database Policies Must Enforce Access

The app UI is not security.

RLS must prevent:

- players reading campaigns they do not belong to
- players approving their own purchases
- players changing wallet balances directly
- players reading private whispers sent to others
- users accessing another campaign's shop data

## 4. AI Must Be Isolated

AI prompts, keys and provider logic should live in backend functions.

The app should send structured input and receive validated structured output.

## 5. Expo Direction Should Be Standardised

The project should use Expo prebuild/dev client consistently.

Do not mix documentation that says pure React Native CLI unless an ADR explicitly changes this.

---

## Suggested Folder Structure

```text
src/
  components/
    common/
    fantasy/
    shops/
    campaign/
    wallet/

  config/
    env.ts

  hooks/
    useAuth.ts
    useCampaign.ts
    useWallet.ts

  lib/
    supabase.ts

  navigation/
    RootNavigator.tsx
    types.ts

  screens/
    auth/
    dm/
    player/
    shared/

  services/
    authService.ts
    campaignService.ts
    shopService.ts
    walletService.ts
    purchaseService.ts
    feedService.ts
    aiService.ts

  theme/
    colors.ts
    typography.ts
    spacing.ts
    shadows.ts
    index.ts

  types/
    database.ts
    campaign.ts
    shop.ts
    wallet.ts
    purchase.ts

supabase/
  migrations/
  functions/
    generate-shop/
    approve-purchase/
    spend-credit/
```

---

## Service Responsibilities

## authService

- get current user
- sign in
- sign up
- sign out
- profile lookup
- profile creation

## campaignService

- create campaign
- join campaign
- get user campaigns
- get campaign membership
- update campaign settings

## shopService

- list shops
- get shop with items
- create shop
- update shop
- generate shop via AI
- manage shop inventory

## walletService

- get wallet
- format currency
- request wallet adjustment
- DM wallet overview

## purchaseService

- create purchase request
- get pending requests
- approve purchase via RPC
- reject purchase via RPC
- get purchase history

## feedService

- get campaign feed
- create safe feed entries through backend where needed

## aiService

- call backend AI functions
- never call AI provider directly from app

---

## Data Flow: Purchase Approval

```text
Player taps Buy
  -> purchaseService.createPurchaseRequest()
  -> purchase_requests row created as pending
  -> feed event: purchase_requested

DM opens approval queue
  -> purchaseService.getPendingRequests()
  -> DM approves
  -> purchaseService.approvePurchase(requestId)
  -> Supabase RPC validates:
       membership
       DM permission
       wallet balance
       item stock
  -> RPC deducts wallet
  -> RPC updates stock
  -> RPC creates backpack/change-log entry
  -> RPC creates feed event
```

---

## Data Flow: AI Shop Generation

```text
DM selects shop generation options
  -> app sends structured payload to aiService
  -> Supabase Edge Function receives payload
  -> Edge Function validates auth and DM campaign access
  -> Edge Function calls AI provider
  -> AI returns JSON
  -> Edge Function validates JSON schema
  -> Edge Function writes shop + items or returns preview
  -> app renders result
```

Recommended early behaviour:

- generate preview first
- DM confirms before save

---

## Refactoring Priorities

## Priority 1

Remove direct Supabase calls from screens where practical.

Known screens needing attention:

- `DMDashboardScreen.tsx`
- `PurchaseApprovalScreen.tsx`
- `JoinCampaignScreen.tsx`
- `OnboardingScreen.tsx`
- `ManageShopScreen.tsx`

## Priority 2

Move purchase approval and wallet mutation into RPC functions.

## Priority 3

Add generated or manually maintained database types.

## Priority 4

Strengthen RLS policies.

## Priority 5

Add tests for services and purchase workflow.

---

## Build Strategy

Build in vertical slices.

Recommended order:

1. Auth works
2. Campaign create/join works
3. Player can view campaign
4. DM can create shop
5. Player can view shop
6. Player can request purchase
7. DM can approve purchase
8. Wallet updates safely
9. Feed records events
10. AI generation added after manual flow is stable

---

## Architecture Decision Log

Major decisions should be recorded in ADRs.

Current decisions:

- Use Expo prebuild/dev client rather than pure RN CLI
- Use Supabase as primary backend
- Do not use Firebase unless future ADR reverses this
- Use Companion Change Log instead of direct character sheet sync
- Use backend AI functions only
- Use service layer between screens and Supabase

