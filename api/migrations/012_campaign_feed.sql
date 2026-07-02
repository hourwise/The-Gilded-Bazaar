-- Migration 012: Campaign Feed
-- The "Chronicle" - a real-time feed of campaign activity.

CREATE TABLE IF NOT EXISTS campaign_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  visibility TEXT NOT NULL CHECK (visibility IN ('party', 'dm_only', 'private')) DEFAULT 'party',
  recipient_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  entry_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE campaign_feed ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Players can see party and their own private entries"
  ON campaign_feed FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_members cm
      WHERE cm.campaign_id = campaign_feed.campaign_id
      AND cm.profile_id = auth.uid()
    )
    AND (
      visibility = 'party'
      OR (visibility = 'private' AND recipient_profile_id = auth.uid())
      OR EXISTS (
        SELECT 1 FROM campaign_members cm
        WHERE cm.campaign_id = campaign_feed.campaign_id
        AND cm.profile_id = auth.uid()
        AND cm.role IN ('owner_dm', 'co_dm')
      )
    )
  );

CREATE POLICY "DMs can create feed entries"
  ON campaign_feed FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaign_members cm
      WHERE cm.campaign_id = campaign_feed.campaign_id
      AND cm.profile_id = auth.uid()
      AND cm.role IN ('owner_dm', 'co_dm')
    )
  );