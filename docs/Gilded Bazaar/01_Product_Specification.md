# 01 — Product Specification

## Purpose

This document defines what The Gilded Bazaar is expected to do from a product perspective. It describes the main user roles, feature areas, MVP requirements and future expansion boundaries.

---

## User Roles

## 1. Dungeon Master

The Dungeon Master owns or administers a campaign.

A DM can:

- create campaigns
- invite players
- generate campaign join codes
- create shops
- generate shops using AI
- manage shop inventory
- approve or reject purchase requests
- edit campaign economy settings
- view player wallets
- send announcements
- create private whispers
- manage downtime activities in later phases
- trigger living-world events in later phases

## 2. Player

A player joins one or more campaigns.

A player can:

- create a profile
- join a campaign using a code or deep link
- view available shops
- browse items
- view wallet balance
- request purchases
- view approval/rejection status
- view backpack items
- receive campaign feed updates
- receive DM messages
- manage downtime activities in later phases

## 3. Future Role: Co-DM / Admin

A co-DM may have elevated rights within a campaign but may not be the original owner.

This role is not required for MVP but should be considered in the data model.

---

## MVP Product Flow

## Step 1 — Account Creation

User creates an account using email/social login.

Required:

- Supabase auth
- profile row creation
- display name
- avatar placeholder
- account settings

## Step 2 — Campaign Creation or Join

User chooses one of two paths:

### DM Path

- create campaign
- set campaign name
- choose currency defaults
- receive campaign code
- open DM dashboard

### Player Path

- enter campaign code
- request or instantly receive membership
- create/select character profile
- enter starting wallet balance if allowed
- open player dashboard

## Step 3 — Shop Setup

DM creates a shop manually or via AI.

Shop creation requires:

- shop name
- merchant name
- shop type
- location
- description
- inventory items
- pricing logic

## Step 4 — Player Browsing

Player opens campaign shop list and chooses a shop.

Player can:

- browse items
- view item details
- filter by category
- see price and stock
- request purchase

## Step 5 — Purchase Request

Player submits purchase request.

System records:

- campaign id
- player id
- character id
- shop id
- item id
- requested quantity
- price at time of request
- status: pending

## Step 6 — DM Approval

DM sees pending purchase request.

DM can:

- approve
- reject
- adjust price if supported later
- add note

On approval, the backend should:

- validate membership
- validate item availability
- validate wallet balance
- deduct currency
- reduce stock if limited
- add item to backpack/change log
- create campaign feed event

## Step 7 — Player Checklist

Player sees approved purchase and receives a manual sync checklist:

- subtract X gold from character sheet
- add item to inventory
- note DM approval

This is core to the Companion Change Log strategy.

---

## MVP Screens

## Auth Screens

- Welcome
- Sign In
- Sign Up
- Forgot Password

## Shared Screens

- Campaign Selector
- Join Campaign
- Profile Setup
- Settings

## Player Screens

- Player Dashboard
- Shop List
- Shop Detail
- Item Detail
- Backpack
- Wallet
- Campaign Feed
- Purchase Status

## DM Screens

- DM Dashboard
- Campaign Management
- Shop Management
- Create/Edit Shop
- Purchase Approval Queue
- Player Wallet Overview
- Campaign Feed Management

---

## MVP Feature Requirements

## Authentication

- email/password login
- social login later
- profile auto-creation
- Apple Sign-In before iOS public launch if other social login exists

## Campaigns

- create campaign
- join campaign using code
- role-based membership
- campaign selector for users in multiple campaigns

## Shops

- list shops by campaign
- view shop details
- view items
- create/edit shop as DM
- basic inventory management

## Items

Items should support:

- name
- description
- category
- rarity
- base price
- current price
- stock quantity
- magical flag
- attunement flag later
- visible/hidden flag

## Wallets

Wallet should support:

- copper
- silver
- electrum optional
- gold
- platinum

Initial MVP can store a normalised copper value for calculation while displaying fantasy denominations.

## Purchase Requests

- player creates request
- DM approves/rejects
- player views result
- event feed records result

## Campaign Feed

Feed should record:

- shop created
- purchase requested
- purchase approved
- purchase rejected
- wallet updated
- DM announcement

---

## Phase 2 Features

## Downtime Engine

- create downtime task
- assign to player/character
- set duration
- progress over time
- resolve outcome
- notify completion

## Town Crier

- announcements
- campaign notifications
- in-world messaging style

## Secret Whispers

- DM sends private messages to individual players
- sealed envelope style UI

## Living World Toggles

- festival
- siege
- plague
- trade disruption
- monster threat
- royal visit
- war economy

These should alter shop pricing and availability only after DM confirmation.

## AI Enhancements

- generate merchant
- generate inventory
- generate item descriptions
- generate rumours
- generate downtime results
- generate settlement events

---

## Out of Scope

The following should not be part of the early product:

- full character sheet replacement
- direct D&D Beyond sync
- VTT replacement
- battle map system
- initiative tracker
- rules-lawyer chatbot
- multiplayer combat manager
- real-money player trading
- NFT/blockchain assets

---

## Product Risks

## Scope Creep

The fantasy/TTRPG space invites endless features. The product must stay focused on economy and downtime.

## Legal/IP Risk

Avoid using protected D&D text, monsters, spell descriptions or official item text unless legally permitted.

Prefer system-neutral wording and user-generated/custom content.

## Payment Risk

Consumable credits need careful store-compliant language.

Credits must not be described as investment, currency, cash-equivalent or transferable outside the app.

## Security Risk

Client-side wallet mutation must be avoided.

All sensitive changes must be verified server-side.

---

## Product Success Metrics

Early useful metrics:

- campaigns created
- players invited per campaign
- shops created
- purchase requests submitted
- purchase approvals completed
- AI shops generated
- weekly active campaigns
- repeat DM usage
- credit purchases after AI feature launch

---

## MVP Completion Definition

The MVP is complete when one real campaign group can:

1. create a campaign
2. join players
3. create a shop
4. browse items
5. submit purchase requests
6. approve/reject purchases
7. update wallets securely
8. view an audit feed
9. continue the flow without developer intervention

