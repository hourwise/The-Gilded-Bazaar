# 05 Roles and Permissions

## Purpose

The app must clearly control what each user can see and do inside a campaign. Because The Gilded Bazaar handles wallets, purchases, campaign credits, AI generation and DM-only secrets, permissions must be explicit and enforced by the backend.

## Core Principle

Permissions are campaign-scoped.

A user may have different permissions in different campaigns.

Never rely only on frontend hiding. The backend must validate permissions before every sensitive operation.

## MVP Roles

### Owner

The user who created the campaign or has been transferred ownership.

Can:

- delete or archive campaign
- manage all roles
- manage billing/credits
- manage shops
- approve purchases
- edit wallets
- send campaign notifications
- run AI generation
- export campaign data

### Dungeon Master

Primary campaign controller.

Can:

- manage shops
- create merchants
- approve purchases
- reject purchases
- edit campaign world state
- send Town Crier notifications
- create downtime tasks
- run AI generation
- view DM notes

### Co-DM

Assistant DM.

Can:

- manage selected shops
- approve purchases if permitted
- run selected AI tools
- view selected DM data

### Player

Standard participant.

Can:

- browse visible shops
- request purchases
- view own backpack
- view own wallet
- view public campaign feed
- join downtime tasks
- receive whispers
- contribute credits to campaign treasury

### Observer

Read-only participant.

Can:

- view public feed
- view public shops if permitted
- receive announcements

Cannot:

- buy items
- edit data
- approve purchases
- spend credits

## Permission Matrix

| Action | Player | Observer | Co-DM | DM | Owner |
|---|---:|---:|---:|---:|---:|
| View campaign | Yes | Yes | Yes | Yes | Yes |
| Browse visible shops | Yes | Optional | Yes | Yes | Yes |
| Request purchase | Yes | No | Optional | Yes | Yes |
| Approve purchase | No | No | Optional | Yes | Yes |
| Edit own character wallet | Optional | No | Optional | Yes | Yes |
| Edit any wallet | No | No | Optional | Yes | Yes |
| Create shop | No | No | Optional | Yes | Yes |
| Edit shop | No | No | Optional | Yes | Yes |
| Delete shop | No | No | Optional | Yes | Yes |
| Run AI shop generation | No | No | Optional | Yes | Yes |
| Spend campaign credits | No | No | Optional | Yes | Yes |
| Add credits to treasury | Yes | No | Yes | Yes | Yes |
| Send Town Crier notice | No | No | Optional | Yes | Yes |
| Send Secret Whisper | No | No | Optional | Yes | Yes |
| Manage roles | No | No | No | Optional | Yes |
| Archive campaign | No | No | No | No | Yes |

## Backend Enforcement

Sensitive operations should be implemented through service functions or backend RPCs.

Examples:

- approve_purchase
- reject_purchase
- create_shop
- generate_ai_shop
- spend_campaign_credits
- update_member_role
- adjust_wallet

Each backend function must check:

- authenticated user exists
- user is campaign member
- user role permits action
- campaign is active
- requested operation is valid

## Frontend Permission Hooks

The app may expose hooks such as:

```text
useCampaignRole()
useCanManageShop()
useCanApprovePurchase()
useCanSpendCredits()
useCanSendTownCrier()
```

These improve UI clarity but are not security controls.

## Permission Errors

Permission errors should be styled in-world where possible.

Example:

```text
The guild seal on this ledger does not bear your name.
```

But technical detail should be available in debug mode.

## Future Expansion

Later versions may support custom permissions:

- allow a player to manage one shop
- allow a scribe to edit campaign journal
- allow a guest to view only one location
- allow a merchant controller role
- allow child-safe or junior player restrictions
