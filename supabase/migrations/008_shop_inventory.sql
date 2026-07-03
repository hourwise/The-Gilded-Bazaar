-- Migration 008: Shop Inventory
-- Links items from the library to a specific shop with a price and quantity.
-- quantity = -1 means infinite stock.

CREATE TABLE IF NOT EXISTS shop_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items_library(id) ON DELETE CASCADE,
  current_price_copper INTEGER NOT NULL,
  quantity INTEGER DEFAULT -1,
  is_visible BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Compatibility with previous inventory price naming.
ALTER TABLE shop_inventory
  ADD COLUMN IF NOT EXISTS current_price_copper INTEGER,
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'shop_inventory'
    AND column_name = 'current_price'
  ) THEN
    EXECUTE 'UPDATE shop_inventory SET current_price_copper = current_price WHERE current_price_copper IS NULL';
  END IF;
END $$;

-- Enable RLS
ALTER TABLE shop_inventory ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Members can view visible inventory in their campaigns" ON shop_inventory;
CREATE POLICY "Members can view visible inventory in their campaigns"
  ON shop_inventory FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shops s
      JOIN campaign_members cm ON cm.campaign_id = s.campaign_id
      WHERE s.id = shop_inventory.shop_id
      AND cm.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "DMs can manage inventory" ON shop_inventory;
CREATE POLICY "DMs can manage inventory"
  ON shop_inventory FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops s
      JOIN campaign_members cm ON cm.campaign_id = s.campaign_id
      WHERE s.id = shop_inventory.shop_id
      AND cm.profile_id = auth.uid()
      AND cm.role IN ('owner_dm', 'co_dm')
    )
  );

DROP POLICY IF EXISTS "DMs can update inventory" ON shop_inventory;
CREATE POLICY "DMs can update inventory"
  ON shop_inventory FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM shops s
      JOIN campaign_members cm ON cm.campaign_id = s.campaign_id
      WHERE s.id = shop_inventory.shop_id
      AND cm.profile_id = auth.uid()
      AND cm.role IN ('owner_dm', 'co_dm')
    )
  );

DROP POLICY IF EXISTS "DMs can delete inventory" ON shop_inventory;
CREATE POLICY "DMs can delete inventory"
  ON shop_inventory FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM shops s
      JOIN campaign_members cm ON cm.campaign_id = s.campaign_id
      WHERE s.id = shop_inventory.shop_id
      AND cm.profile_id = auth.uid()
      AND cm.role IN ('owner_dm', 'co_dm')
    )
  );
