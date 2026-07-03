# 04 Campaign System

## Purpose

Campaigns are the core container of The Gilded Bazaar. Shops, merchants, players, gold wallets, downtime projects, notifications, NPCs, locations, purchases and AI generations all belong to a campaign.

A campaign represents one tabletop group, table, world or adventure.

## Core Campaign Concept

A campaign is not just a chat room or shop list. It is the persistent economic and downtime layer of a tabletop RPG group.

The campaign should answer:

- Who is playing?
- Who controls the world?
- What shops exist?
- What can players buy?
- What have players purchased?
- What downtime projects are active?
- What events have happened?
- What is the current state of the world?

## Campaign Creation Flow

1. User chooses Create Campaign.
2. User enters campaign name.
3. User selects system type:
   - D&D 5e compatible fantasy
   - Generic fantasy TTRPG
   - Homebrew
4. User selects default economy style:
   - Low magic
   - Standard fantasy
   - High magic
   - Gritty survival
   - Wealthy city campaign
5. System creates campaign.
6. Creator becomes campaign Owner.
7. System generates join code and deep link.

## Recommended Campaign Model

```text
campaigns
- id uuid primary key
- owner_id uuid references profiles(id)
- name text not null
- description text nullable
- system_type text default 'generic_fantasy'
- economy_style text default 'standard_fantasy'
- default_currency text default 'gp'
- magic_density text default 'standard'
- wealth_level text default 'standard'
- danger_level text default 'normal'
- world_state jsonb default '{}'
- join_code text unique not null
- join_code_enabled boolean default true
- archived boolean default false
- created_at timestamptz default now()
- updated_at timestamptz default now()
```

## Campaign Membership

Campaign membership links users to campaigns and defines their role.

```text
campaign_members
- id uuid primary key
- campaign_id uuid references campaigns(id)
- profile_id uuid references profiles(id)
- role text not null
- character_name text nullable
- character_id uuid nullable
- status text default 'active'
- joined_at timestamptz default now()
- updated_at timestamptz default now()
```

## Campaign Roles

Initial roles:

- Owner
- Dungeon Master
- Co-DM
- Player
- Observer

Future roles:

- Merchant Controller
- Guest Player
- Convention Seat
- Viewer
- Scribe

## Join Codes

Each campaign should have a short join code.

Example:

```text
AB7XQ2
```

Join codes must be:

- unique
- easy to type
- revocable
- regeneratable
- case-insensitive if possible

## Deep Links

Deep links should follow a stable pattern:

```text
https://gildedbazaar.app/join/AB7XQ2
```

The link should:

- open the app if installed
- route to app store if not installed
- preserve the campaign code
- allow the user to sign in before joining

## Campaign Archive

Campaigns should not be hard-deleted by default.

Archiving should:

- hide campaign from active lists
- preserve history
- preserve purchases
- preserve downtime projects
- disable new joins
- keep data available for export

## Campaign Switching

A user may belong to multiple campaigns.

The app should provide:

- current campaign selector
- last active campaign memory
- clear role display
- separate wallets per character/campaign
- separate permissions per campaign

## Future Expansion

Campaigns should later support:

- campaign templates
- public demo campaigns
- paid premium campaign storage
- world maps
- locations
- living economy modifiers
- seasonal events
- campaign analytics
- campaign export
