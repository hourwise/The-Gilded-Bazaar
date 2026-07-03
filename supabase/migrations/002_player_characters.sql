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

-- Compatibility with the previous profile-centric character model.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

DO $$
BEGIN
  IF to_regclass('public.campaign_members') IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'campaign_members'
      AND column_name = 'player_id'
    )
    AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'race'
    )
  THEN
    EXECUTE $backfill$
      INSERT INTO player_characters (
        profile_id,
        campaign_id,
        character_name,
        ancestry,
        charisma_modifier,
        persuasion_proficiency,
        gold,
        silver,
        copper
      )
      SELECT
        cm.player_id,
        cm.campaign_id,
        COALESCE(NULLIF(p.display_name, ''), 'Adventurer'),
        p.race,
        COALESCE(p.charisma_modifier, 0),
        COALESCE(p.persuasion_proficiency, 0),
        COALESCE(p.gold, 0),
        COALESCE(p.silver, 0),
        COALESCE(p.copper, 0)
      FROM campaign_members cm
      JOIN profiles p ON p.id = cm.player_id
      WHERE cm.player_id IS NOT NULL
      ON CONFLICT (profile_id, campaign_id) DO NOTHING
    $backfill$;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE player_characters ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own characters" ON player_characters;
CREATE POLICY "Users can view their own characters"
  ON player_characters FOR SELECT
  USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can insert their own characters" ON player_characters;
CREATE POLICY "Users can insert their own characters"
  ON player_characters FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can update their own characters" ON player_characters;
CREATE POLICY "Users can update their own characters"
  ON player_characters FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);
