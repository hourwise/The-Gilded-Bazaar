-- Migration 009: Backpacks
-- Items owned by characters (player inventory).

CREATE TABLE IF NOT EXISTS backpacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES player_characters(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items_library(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  source TEXT, -- e.g. 'purchase', 'dm_grant', 'loot'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE backpacks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Players can view their own backpack"
  ON backpacks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM player_characters pc
      WHERE pc.id = backpacks.character_id
      AND pc.profile_id = auth.uid()
    )
  );

CREATE POLICY "DMs can view backpacks in their campaign"
  ON backpacks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM player_characters pc
      JOIN campaign_members cm ON cm.campaign_id = pc.campaign_id
      WHERE pc.id = backpacks.character_id
      AND cm.profile_id = auth.uid()
      AND cm.role IN ('owner_dm', 'co_dm')
    )
  );