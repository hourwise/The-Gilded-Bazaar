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

-- Compatibility with the previous campaign ownership model.
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS instant_purchases_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS dm_approval_required BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT false;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'campaigns'
    AND column_name = 'dm_id'
  ) THEN
    EXECUTE 'UPDATE campaigns SET created_by = dm_id WHERE created_by IS NULL';
  END IF;
END $$;

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can attempt to look up a campaign by join code (for joining)
DROP POLICY IF EXISTS "Anyone can look up campaign by join code" ON campaigns;
CREATE POLICY "Anyone can look up campaign by join code"
  ON campaigns FOR SELECT
  USING (true);

-- Only the creator/DM can update their campaign
DROP POLICY IF EXISTS "DM can update their campaign" ON campaigns;
CREATE POLICY "DM can update their campaign"
  ON campaigns FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);
