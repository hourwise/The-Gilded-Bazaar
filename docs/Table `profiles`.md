## Table `profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `display_name` | `text` |  Nullable |
| `avatar_url` | `text` |  Nullable |
| `credit_balance` | `int4` |  Nullable |
| `is_dm` | `bool` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `race` | `text` |  Nullable |
| `charisma_modifier` | `int4` |  Nullable |
| `persuasion_proficiency` | `int4` |  Nullable |
| `gold` | `int4` |  |
| `silver` | `int4` |  |
| `copper` | `int4` |  |

## Table `campaigns`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `join_code` | `varchar` |  Unique |
| `dm_id` | `uuid` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `campaign_members`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `campaign_id` | `uuid` |  Nullable |
| `player_id` | `uuid` |  Nullable |
| `joined_at` | `timestamptz` |  Nullable |

## Table `items_library`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `description` | `text` |  Nullable |
| `base_price` | `int4` |  Nullable |
| `rarity` | `text` |  Nullable |
| `category` | `text` |  Nullable |
| `is_homebrew` | `bool` |  Nullable |
| `created_by` | `uuid` |  Nullable |

## Table `shops`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `campaign_id` | `uuid` |  Nullable |
| `name` | `text` |  |
| `description` | `text` |  Nullable |
| `location_name` | `text` |  Nullable |
| `is_active` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `shopkeeper_name` | `text` |  Nullable |
| `shopkeeper_race` | `text` |  Nullable |

## Table `shop_inventory`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `shop_id` | `uuid` |  Nullable |
| `item_id` | `uuid` |  Nullable |
| `current_price` | `int4` |  |
| `quantity` | `int4` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `credit_transactions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `profile_id` | `uuid` |  Nullable |
| `amount` | `int4` |  |
| `transaction_type` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `active_downtime`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `player_id` | `uuid` |  Nullable |
| `campaign_id` | `uuid` |  Nullable |
| `task_name` | `text` |  |
| `start_time` | `timestamptz` |  Nullable |
| `end_time` | `timestamptz` |  |
| `is_completed` | `bool` |  Nullable |

## Table `player_inventory`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `player_id` | `uuid` |  |
| `item_id` | `uuid` |  |
| `quantity` | `int4` |  |
| `acquired_at` | `timestamptz` |  Nullable |

