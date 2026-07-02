-- The Gilded Bazaar - Complete Database Schema
-- Run this file to create all tables at once.
-- Then run 015_rpc_functions.sql for RPC functions.
-- Then run seed.sql for sample data.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (see 001_profiles.sql)
-- 2. Player Characters (see 002_player_characters.sql)
-- 3. Campaigns (see 003_campaigns.sql)
-- 4. Campaign Members (see 004_campaign_members.sql)
-- 5. Settlements (see 005_settlements.sql)
-- 6. Shops (see 006_shops.sql)
-- 7. Items Library (see 007_items_library.sql)
-- 8. Shop Inventory (see 008_shop_inventory.sql)
-- 9. Backpacks (see 009_backpacks.sql)
-- 10. Purchase Requests (see 010_purchase_requests.sql)
-- 11. Economy Transactions (see 011_economy_transactions.sql)
-- 12. Campaign Feed (see 012_campaign_feed.sql)
-- 13. Downtime Tasks (see 013_downtime_tasks.sql)
-- 14. AI Generation Jobs (see 014_ai_generation_jobs.sql)