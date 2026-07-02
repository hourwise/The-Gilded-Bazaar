-- Migration 002: Player Characters
-- Characters are separate from profiles. A user can have multiple characters,
-- but only one character per campaign.

CREATE TABLE IF NOT EXISTS player_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  campaign_id UUID, -- nullable until assigned to a campaign
  character_name TEXT NOT NULL,
  ancestry TEXT,
  class_name TEXT,
  level INTEGER DEFAULT 1,
  charisma_modifier INTEGER DEFAULT 0,
  persuasion_proficiency INTEGER DEFAULT 0,
  gold INTEGER DEFAULT 0,
  silver INTEGER DEFAULT 0,
  copper INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  -- A user can only have one character per campaign
  UNIQUE(profile_id, campaign_id)
);

-- Enable RLS
ALTER TABLE player_characters ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own characters"
  ON player_characters FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own characters"
  ON player_characters FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own characters"
  ON player_characters FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- DMs can view characters in their campaigns
CREATE POLICY "DMs can view characters in their campaigns"
  ON player_characters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_members cm
      WHERE cm.campaign_id = player_characters.campaign_id
      AND cm.profile_id = auth.uid()
      AND cm.role IN ('owner_dm', 'co_dm')
    )
  );