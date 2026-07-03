# 06 Onboarding and First Run

## Purpose

The first-run experience must make the app understandable within minutes. The Gilded Bazaar could become a large campaign hub, but the MVP must guide users into one of two clear paths:

- I am a DM creating a campaign.
- I am a player joining a campaign.

## First Launch Goals

- Explain the app in one screen.
- Let the user create or join a campaign quickly.
- Avoid overwhelming users with future features.
- Avoid asking for unnecessary permissions too early.
- Make the app feel magical and premium immediately.

## First Launch Screen

Suggested copy:

```text
Welcome to The Gilded Bazaar

Run living shops, track party purchases, manage downtime and bring your campaign economy to life between sessions.
```

Primary actions:

- Create Campaign
- Join Campaign
- Explore Demo

## Account Creation Timing

The app should allow users to understand the concept before forcing full account creation where possible.

MVP recommendation:

- Require sign-in before campaign creation.
- Require sign-in before joining a real campaign.
- Allow demo campaign without sign-in.

## DM Onboarding Flow

1. Create account.
2. Create campaign.
3. Choose campaign name.
4. Choose economy style.
5. Create first shop manually or with AI.
6. Invite players using campaign code.
7. Land on DM dashboard.

## Player Onboarding Flow

1. Create account.
2. Enter campaign code.
3. Confirm campaign name.
4. Create character profile.
5. Set starting wallet if allowed.
6. Land on player backpack/shop view.

## Demo Campaign

The demo campaign should show the value of the app without requiring setup.

Demo content:

- one fantasy town
- one blacksmith
- one alchemist
- one magic trinket merchant
- sample campaign feed
- sample purchase request
- sample downtime timer

Demo data must be clearly labelled and should not sync to real backend tables unless intentionally created as read-only seed data.

## Permissions During Onboarding

Do not request push notifications immediately.

Ask for notification permission only when the user enables:

- Town Crier notifications
- Secret Whispers
- downtime reminders
- shop sale alerts

Camera/media permissions should not be required in MVP unless avatar upload is implemented.

## Empty States

Every empty screen needs useful guidance.

Examples:

No campaigns:

```text
No campaign banners hang here yet.
Create a new table or join one with a campaign code.
```

No shops:

```text
The market square is empty.
Create your first merchant stall to begin trading.
```

No purchases:

```text
No coin has changed hands yet.
Purchases requested by players will appear here.
```

## MVP Success Criteria

A new DM should be able to:

- create account
- create campaign
- create first shop
- invite player
- approve first purchase

A new player should be able to:

- create account
- join campaign
- browse shop
- request purchase
- see checklist for manual character sheet update

## Future Expansion

Future onboarding may include:

- campaign import wizard
- AI campaign setup assistant
- visual town builder
- tutorial quests
- example merchant packs
- guided RevenueCat entitlement setup
