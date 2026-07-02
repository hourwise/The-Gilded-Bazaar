-- Migration 003: Campaigns
-- A campaign is a single game run by a DM with a unique join code.

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  join_code VARCHAR(6) UNIQUE NOT NULL,
  created_by UUID REFERENCES profiles(id),
  instant_purchases_enabled BOOLEAN DEFAULT false,
  dm_approval_required BOOLEAN DEFAULT true,
  ai_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can attempt to look up a campaign by join code (for joining)
CREATE POLICY "Anyone can look up campaign by join code"
  ON campaigns FOR SELECT
  USING (true);

-- Only the creator/DM can update their campaign
CREATE POLICY "DM can update their campaign"
  ON campaigns FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Members can view campaign details
CREATE POLICY "Members can view their campaigns"
  ON campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_members cm
      WHERE cm.campaign_id = campaigns.id
      AND cm.profile_id = auth.uid()
    )
  );