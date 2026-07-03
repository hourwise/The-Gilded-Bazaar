# 03 Authentication and User Management

## Purpose

Authentication is the foundation of The Gilded Bazaar. Every player, Dungeon Master, campaign, purchase, AI generation, credit transaction and notification must be attached to a trustworthy user identity.

The system must support casual tabletop groups while being structured enough to support subscriptions, shared campaign treasuries, web access, future organisations, and campaign templates.

## Core Decision

The Gilded Bazaar uses a single account model.

A user should not need separate DM and player accounts. The same user can:

- create campaigns
- join campaigns
- act as a player in one campaign
- act as a DM in another campaign
- own a campaign
- co-manage a campaign
- hold premium entitlements
- contribute credits to a campaign treasury

## Supported Authentication Methods

### MVP

- Email and password
- Google sign-in
- Apple sign-in for iOS compliance

### Future

- Magic link sign-in
- Discord sign-in
- Passkeys
- Web-only admin login

## User Profile Model

Every authenticated account has one profile record.

Recommended fields:

```text
profiles
- id uuid primary key references auth.users(id)
- display_name text not null
- username text unique nullable
- avatar_url text nullable
- bio text nullable
- timezone text nullable
- country text nullable
- preferred_currency text default 'GBP'
- language text default 'en'
- theme text default 'clean_fantasy_dark'
- onboarding_completed boolean default false
- created_at timestamptz default now()
- updated_at timestamptz default now()
```

## Account Creation Flow

1. User installs the app.
2. User creates account or signs in.
3. App creates or retrieves profile.
4. User chooses initial path:
   - Create Campaign
   - Join Campaign
   - Explore Demo Campaign
5. User completes minimal onboarding.

## User Roles Are Campaign-Specific

Roles are not global.

A user can be:

- Owner in Campaign A
- Player in Campaign B
- Co-DM in Campaign C

This is handled through campaign membership records.

## Session Management

The app must support:

- persistent login
- secure token storage
- refresh token handling
- sign out
- account recovery
- password reset
- email verification
- forced logout if auth session becomes invalid

## Security Requirements

- Never store service role keys in the app.
- Never call privileged database operations directly from the client.
- Use Row Level Security on all user-owned data.
- Use backend functions for sensitive mutations.
- Never trust client-side wallet, credit, role or entitlement state.
- All campaign and purchase permissions must be verified server-side.

## Offline Behaviour

The app may cache non-sensitive display data, such as:

- shop item names
- local UI state
- last viewed campaign
- selected theme

The app must not allow offline mutation of:

- gold balances
- shop stock
- campaign credits
- purchases
- approvals
- entitlements

Offline actions can be queued later, but only after backend validation.

## Audit Logging

The following events should be logged:

- account created
- login
- logout
- profile updated
- campaign created
- campaign joined
- campaign left
- role changed
- purchase requested
- purchase approved
- purchase rejected
- wallet adjusted
- credits purchased
- credits spent
- AI generation requested
- premium entitlement changed

## Future Expansion

Authentication should be designed to support:

- web dashboard access
- shared household accounts
- organisation accounts
- convention campaigns
- public campaign templates
- community marketplace creators
- creator revenue share
