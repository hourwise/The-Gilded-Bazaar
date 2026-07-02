-- Migration 005: Settlements
-- Towns, cities, and locations within a campaign world.

CREATE TABLE IF NOT EXISTS settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  prosperity INTEGER DEFAULT 3,
  danger INTEGER DEFAULT 2,
  magic_density INTEGER DEFAULT 2,
  current_event TEXT,
  status TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Members can view settlements in their campaigns"
  ON settlements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_members cm
      WHERE cm.campaign_id = settlements.campaign_id
      AND cm.profile_id = auth.uid()
    )
  );

CREATE POLICY "DMs can manage settlements"
  ON settlements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaign_members cm
      WHERE cm.campaign_id = settlements.campaign_id
      AND cm.profile_id = auth.uid()
      AND cm.role IN ('owner_dm', 'co_dm')
    )
  );

CREATE POLICY "DMs can update settlements"
  ON settlements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaign_members cm
      WHERE cm.campaign_id = settlements.campaign_id
      AND cm.profile_id = auth.uid()
      AND cm.role IN ('owner_dm', 'co_dm')
    )
  );