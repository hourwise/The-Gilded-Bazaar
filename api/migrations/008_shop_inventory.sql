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

-- Enable RLS
ALTER TABLE shop_inventory ENABLE ROW LEVEL SECURITY;

-- Policies
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