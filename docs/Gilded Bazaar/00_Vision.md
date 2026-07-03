# 00 — The Gilded Bazaar Vision

## Product Name

**The Gilded Bazaar**

## Tagline

**AI-powered economy and downtime for TTRPG campaigns.**

## One-Sentence Summary

The Gilded Bazaar is a companion app for tabletop roleplaying campaigns that helps Dungeon Masters and players manage shops, gold, purchases, downtime, campaign events, merchants, rumours and living-world economy changes between sessions.

---

## Core Product Philosophy

The Gilded Bazaar should not try to replace D&D Beyond, Roll20, Foundry, paper character sheets or existing virtual tabletop tools.

Instead, it should solve the problem those systems usually leave behind:

> Everything that happens between sessions.

Most tabletop campaigns generate friction outside the main game session:

- players want to buy equipment
- DMs need to approve purchases
- gold totals drift out of sync
- downtime activities are forgotten
- crafting timers are handled manually
- shops are improvised repeatedly
- NPC merchants lose continuity
- rumours and private clues get buried in WhatsApp or Discord
- campaign economy changes are hard to track

The Gilded Bazaar exists to make that layer feel polished, magical and easy.

---

## Product Positioning

The app should be positioned as a **campaign companion**, not a character-sheet replacement.

It acts as:

- a fantasy marketplace
- a shared party economy tracker
- a DM-controlled shop system
- a campaign event feed
- a downtime and crafting tracker
- a private whisper and notification system
- a living-world economy engine
- an AI content assistant for merchants, shops, rumours and world events

---

## Target Users

### Primary User: Dungeon Master

The DM is the main power user and likely buyer.

They need to:

- create a campaign
- invite players
- create or generate shops
- approve or reject purchases
- manage campaign economy settings
- send private messages or rumours
- trigger world events
- run downtime outcomes
- reduce admin between sessions

### Secondary User: Player

The player should find the app fun, visual and lightweight.

They need to:

- join a campaign using a code or link
- view available shops
- browse items in an e-commerce-style interface
- see their wallet
- request purchases
- view approval status
- track carried items
- receive campaign notifications
- manage downtime tasks
- manually mirror approved changes onto their main character sheet

---

## Design Goal

The product should feel like a premium fantasy tool rather than a generic admin app.

The tone should be:

- elegant
- magical
- practical
- warm
- readable
- slightly theatrical, but never childish

The UI should combine:

- clean fantasy styling
- dark charcoal / ink backgrounds
- metallic gold highlights
- parchment surfaces
- subtle magical effects
- clear mobile-first layouts

The experience should feel closer to:

> a luxury fantasy ledger, merchant catalogue and campaign noticeboard

rather than:

> a spreadsheet, generic notes app or ordinary chat tool.

---

## Core Product Pillars

## 1. Campaign Economy

Every campaign has its own economy layer.

This includes:

- party currency
- individual player wallets
- shop inventory
- merchant pricing modifiers
- purchase history
- approval logs
- settlement-level economic conditions
- event-driven price changes

The economy should be flexible enough to support D&D 5e first, but not be hardcoded so tightly that future TTRPG systems become impossible.

---

## 2. Merchant & Shop System

The shop system is the MVP anchor.

The DM can create merchants manually or generate them using AI.

A shop should include:

- merchant name
- shop name
- shop type
- location
- personality
- stock list
- item rarity
- item pricing
- availability
- discount / markup rules
- restock behaviour
- notes visible to DM only

Players browse shops in a familiar storefront format and submit purchase requests rather than directly changing campaign truth.

---

## 3. Approval-Based Change Log

The app must avoid pretending to directly sync with external character sheets.

Instead, it uses a **Companion Change Log** model.

This means:

- the app records intended changes
- the DM approves or rejects actions
- players receive a clear checklist of what to copy to their main character sheet
- the campaign feed preserves the audit trail

This avoids dependency on locked third-party APIs and keeps the product legally and technically safer.

---

## 4. Downtime Engine

Downtime should become one of the strongest differentiators.

Examples:

- crafting armour
- brewing potions
- scribing scrolls
- training mounts
- researching spells
- running a business
- gambling
- pit fighting
- carousing
- gathering rumours

Some downtime tasks are simple countdowns. Others can use AI or structured rules to resolve outcomes.

The downtime system should eventually feel like a fantasy Tamagotchi for campaign progress between sessions.

---

## 5. Living World Engine

The long-term vision is a campaign world that can evolve between sessions.

Examples:

- towns enter festival mode
- cities come under siege
- trade routes become blocked
- shops run low on stock
- weapon prices rise during war
- healing items become scarce during plague
- rumours spread
- black markets appear
- NPC merchants remember player behaviour

The DM remains in control. The app suggests, simulates and applies only what the DM allows.

---

## 6. Campaign Communication

Communication should feel in-world.

Instead of ordinary push notifications and chat labels, the product should use fantasy framing.

Examples:

- **Town Crier** — campaign announcements
- **Whispers** — private DM-to-player messages
- **Campfire** — party discussion
- **Courier** — delivery or completion notification
- **Noticeboard** — quests, rumours and adverts

The fantasy language should enhance clarity, not make the app confusing.

---

## 7. AI Assistance

AI should not appear as a generic chatbot in the main product.

Instead, it should power specific useful actions:

- generate a shop
- generate a merchant
- generate item descriptions
- generate rumours
- generate downtime outcomes
- generate tavern menus
- generate noticeboard quests
- generate regional price modifiers
- generate private clues
- generate event consequences

AI calls should happen through secure backend functions only. API keys must never be exposed in the mobile app.

---

## MVP Scope

The first usable MVP should focus only on the economy loop.

### MVP Must Include

- user authentication
- campaign creation
- campaign joining by code
- DM/player role separation
- player wallet
- shop list
- shop detail screen
- item browsing
- purchase request
- DM purchase approval/rejection
- campaign event feed
- source-of-truth documentation
- secure database policies

### MVP Should Include If Practical

- manual shop creation
- simple AI shop generation
- basic item categories
- simple visual theme
- player backpack
- transaction audit log

### MVP Should Not Include Yet

- full downtime engine
- living world simulation
- advanced AI economy changes
- voice shopkeepers
- third-party character sheet sync
- public marketplace
- community content packs
- multiplayer maps
- complex inventory encumbrance

---

## Non-Negotiable Technical Principles

## 1. Backend Owns Truth

The client must not directly perform sensitive wallet or purchase state changes.

Wallet changes, purchase approvals and credit deductions should be handled through backend functions or secure database RPCs.

## 2. No Exposed AI Keys

All AI calls must run through backend functions.

## 3. Service Layer First

Screens should not contain raw Supabase queries.

Screens should call services such as:

- `authService`
- `campaignService`
- `shopService`
- `walletService`
- `purchaseService`
- `aiService`
- `notificationService`

## 4. RLS Must Be Designed Early

Campaign data must be protected by row-level security.

Players should only access campaigns they belong to.

DMs should only administer campaigns they own or have admin rights for.

## 5. Avoid Scope Creep

The app should not become a full virtual tabletop.

It should specialise in economy, downtime and between-session campaign life.

---

## Recommended Technical Direction

Current project direction should standardise on:

- **Expo prebuild / Expo dev client**
- **React Native**
- **TypeScript**
- **Supabase** for auth, database, storage and edge functions
- **RevenueCat** for subscriptions and consumable credits
- **OpenAI or Gemini API** via backend functions only
- **Vercel or Netlify** for the companion web shell

The previous Firebase direction should remain removed unless a future architectural decision explicitly reintroduces it.

---

## Monetisation Philosophy

The app should avoid charging players for basic campaign participation.

The best monetisation model is:

- free player participation
- DM-led premium actions
- optional pooled campaign credits
- consumable credits for AI-heavy actions
- subscription tier for active DMs

Credits must be clearly presented as app utility credits with no cash-out value and no real-world currency equivalence.

---

## Success Criteria

The MVP is successful when:

- a DM can create a campaign
- players can join with a code
- a DM can create or generate a shop
- players can browse items
- players can request purchases
- the DM can approve/reject purchases
- wallet state updates safely
- the event feed records the outcome
- players receive a clear manual checklist for updating their character sheet
- all data access is protected by RLS
- the app feels visually distinctive and enjoyable

---

## Long-Term Vision

The Gilded Bazaar should become the app a party opens between sessions to answer:

- What can I buy?
- Has my item been crafted yet?
- What rumours have appeared?
- Did the DM approve my purchase?
- What changed in town?
- What does my character need to update?
- What opportunities are available before next session?

The end goal is a living campaign companion that makes the world feel alive even when the table is not currently playing.
