-- Migration 006: Shops
-- Shops belong to a campaign and optionally to a settlement.

CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  settlement_id UUID REFERENCES settlements(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  shop_type TEXT,
  shopkeeper_name TEXT,
  shopkeeper_race TEXT,
  shopkeeper_personality TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Compatibility with previous shop shape.
ALTER TABLE shops
  ADD COLUMN IF NOT EXISTS settlement_id UUID REFERENCES settlements(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS shop_type TEXT,
  ADD COLUMN IF NOT EXISTS shopkeeper_personality TEXT;

-- Enable RLS
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Members can view active shops in their campaigns" ON shops;
CREATE POLICY "Members can view active shops in their campaigns"
  ON shops FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_members cm
      WHERE cm.campaign_id = shops.campaign_id
      AND cm.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "DMs can manage shops" ON shops;
CREATE POLICY "DMs can manage shops"
  ON shops FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaign_members cm
      WHERE cm.campaign_id = shops.campaign_id
      AND cm.profile_id = auth.uid()
      AND cm.role IN ('owner_dm', 'co_dm')
    )
  );

DROP POLICY IF EXISTS "DMs can update shops" ON shops;
CREATE POLICY "DMs can update shops"
  ON shops FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaign_members cm
      WHERE cm.campaign_id = shops.campaign_id
      AND cm.profile_id = auth.uid()
      AND cm.role IN ('owner_dm', 'co_dm')
    )
  );

DROP POLICY IF EXISTS "DMs can delete shops" ON shops;
CREATE POLICY "DMs can delete shops"
  ON shops FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM campaign_members cm
      WHERE cm.campaign_id = shops.campaign_id
      AND cm.profile_id = auth.uid()
      AND cm.role IN ('owner_dm', 'co_dm')
    )
  );
