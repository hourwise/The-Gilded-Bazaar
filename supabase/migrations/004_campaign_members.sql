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

-- Compatibility with the previous membership model.
ALTER TABLE campaign_members
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS character_id UUID REFERENCES player_characters(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'player';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'campaign_members'
    AND column_name = 'player_id'
  ) THEN
    EXECUTE 'UPDATE campaign_members SET profile_id = player_id WHERE profile_id IS NULL';
  END IF;
END $$;

UPDATE campaign_members cm
SET role = CASE
  WHEN c.created_by = cm.profile_id THEN 'owner_dm'
  ELSE COALESCE(cm.role, 'player')
END
FROM campaigns c
WHERE c.id = cm.campaign_id;

UPDATE campaign_members cm
SET character_id = pc.id
FROM player_characters pc
WHERE pc.profile_id = cm.profile_id
AND (
  pc.campaign_id = cm.campaign_id
  OR pc.campaign_id IS NULL
)
AND cm.character_id IS NULL;

INSERT INTO campaign_members (campaign_id, profile_id, role)
SELECT c.id, c.created_by, 'owner_dm'
FROM campaigns c
WHERE c.created_by IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM campaign_members cm
  WHERE cm.campaign_id = c.id
  AND cm.profile_id = c.created_by
);

CREATE UNIQUE INDEX IF NOT EXISTS campaign_members_campaign_id_profile_id_idx
  ON campaign_members (campaign_id, profile_id)
  WHERE profile_id IS NOT NULL;

-- Enable RLS
ALTER TABLE campaign_members ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Members can view their own memberships" ON campaign_members;
CREATE POLICY "Members can view their own memberships"
  ON campaign_members FOR SELECT
  USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "DMs can view all members in their campaign" ON campaign_members;
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

DROP POLICY IF EXISTS "Members can insert themselves when joining" ON campaign_members;
CREATE POLICY "Members can insert themselves when joining"
  ON campaign_members FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "DMs can update members in their campaign" ON campaign_members;
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

DROP POLICY IF EXISTS "Members can view their campaigns" ON campaigns;
CREATE POLICY "Members can view their campaigns"
  ON campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_members cm
      WHERE cm.campaign_id = campaigns.id
      AND cm.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "DMs can view characters in their campaigns" ON player_characters;
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
