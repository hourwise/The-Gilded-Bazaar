# 08 Architecture Decision Records

## Purpose

Architecture Decision Records explain why major technical and product choices were made.

This prevents future confusion and reduces repeated debates when returning to the project after weeks or months.

## ADR Format

Each ADR should use this structure:

```text
# ADR-000: Decision Title

Status: Proposed | Accepted | Superseded | Deprecated
Date: YYYY-MM-DD

## Context

What problem or decision exists?

## Decision

What was chosen?

## Alternatives Considered

What else was considered?

## Consequences

What does this make easier?
What does this make harder?
What must be watched later?
```

## Initial ADR List

### ADR-001: Use Expo Prebuild Rather Than Pure React Native CLI

Status: Accepted

The repository currently behaves as an Expo/prebuild React Native project. Earlier planning considered React Native CLI for native in-app purchase control, but the current direction should standardise on Expo prebuild unless native constraints force a change.

Reasons:

- faster development
- easier Android/iOS setup
- compatible with native modules through prebuild
- simpler developer experience
- adequate for RevenueCat integration

Risk:

- native folders can become stale if not managed carefully
- prebuild changes must be documented

### ADR-002: Use Supabase as Backend of Record

Status: Accepted

Supabase is the preferred backend for MVP.

Reasons:

- PostgreSQL database
- Row Level Security
- real-time subscriptions
- auth integration
- SQL functions/RPCs for secure mutations
- easier relational modelling for campaigns, members, wallets and purchases

Rejected alternative:

- Firebase, because the app is relational and permission-heavy.

### ADR-003: Use RevenueCat for Native Purchases

Status: Accepted

RevenueCat should manage App Store and Play Store purchase integration.

Reasons:

- simplifies subscriptions and consumables
- handles cross-platform entitlement state
- reduces direct store integration complexity
- supports future subscription tier and credit packs

Important:

- RevenueCat state must be verified server-side before unlocking sensitive entitlements.

### ADR-004: Treat External Character Sheets as Manual Sync Targets

Status: Accepted

The app should not attempt to directly sync with D&D Beyond or other locked character sheet systems in MVP.

Instead, it operates as a companion change log.

Players receive clear manual checklist items after purchases or downtime results.

Reasons:

- avoids fragile unsupported integrations
- avoids legal/API risk
- keeps the app system-agnostic
- still solves the real workflow problem

### ADR-005: AI Calls Must Run Through Backend Functions

Status: Accepted

No AI API keys may exist in the mobile app.

All AI calls must go through backend functions.

Reasons:

- protects API keys
- allows credit checks before generation
- allows rate limits
- enables prompt versioning
- allows audit logging
- allows model switching later

### ADR-006: Credits Have No Real-World Value

Status: Accepted

Premium credits are internal app consumables only.

They must not be described as currency, withdrawable balance, investment, tradeable token, or anything with real-world value.

Reasons:

- app store compliance
- consumer clarity
- legal safety
- avoids gambling/financial product confusion

### ADR-007: Use Service Layer Between Screens and Supabase

Status: Accepted

Screens should not directly contain Supabase query logic except during temporary prototypes.

Reasons:

- cleaner code
- easier testing
- reusable operations
- centralised error handling
- safer refactoring

Implementation target:

- authService
- campaignService
- shopService
- purchaseService
- walletService
- aiService
- entitlementService
- notificationService

### ADR-008: Use Clean Fantasy UI Rather Than Heavy Medieval Skeuomorphism

Status: Accepted

The app should feel premium and fantasy-themed without becoming cluttered.

Direction:

- deep charcoal/ink backgrounds
- metallic gold accents
- parchment cards
- readable typography
- subtle glow and texture
- modern mobile UX

Avoid:

- unreadable gothic fonts
- excessive brown leather textures
- noisy fantasy backgrounds
- novelty UI that slows interaction
