-- Migration 004: Campaign Members
-- Memberships link profiles to campaigns with campaign-specific roles.
-- A user may be a DM in one campaign and a player in another.

CREATE TABLE IF NOT EXISTS campaign_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  character_id UUID REFERENCES player_characters(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('owner_dm', 'co_dm', 'player', 'spectator')) DEFAULT 'player',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id, profile_id)
);

-- Enable RLS
ALTER TABLE campaign_members ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Members can view their own memberships"
  ON campaign_members FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "DMs can view all members in their campaign"
  ON campaign_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_members cm
      WHERE cm.campaign_id = campaign_members.campaign_id
      AND cm.profile_id = auth.uid()
      AND cm.role IN ('owner_dm', 'co_dm')
    )
  );

CREATE POLICY "Members can insert themselves when joining"
  ON campaign_members FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "DMs can update members in their campaign"
  ON campaign_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaign_members cm
      WHERE cm.campaign_id = campaign_members.campaign_id
      AND cm.profile_id = auth.uid()
      AND cm.role IN ('owner_dm', 'co_dm')
    )
  );