-- Migration 007: Items Library
-- Master catalogue of all items. Items can be created by DMs or seeded during setup.
-- Uses copper as the lowest unit internally.

CREATE TABLE IF NOT EXISTS items_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  base_price_copper INTEGER DEFAULT 0,
  rarity TEXT,
  category TEXT,
  rules_source TEXT DEFAULT 'homebrew',
  is_homebrew BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Compatibility with previous item price naming.
ALTER TABLE items_library
  ADD COLUMN IF NOT EXISTS base_price_copper INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rules_source TEXT DEFAULT 'homebrew',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'items_library'
    AND column_name = 'base_price'
  ) THEN
    EXECUTE 'UPDATE items_library SET base_price_copper = base_price WHERE base_price_copper = 0 AND base_price IS NOT NULL';
  END IF;
END $$;

-- Enable RLS
ALTER TABLE items_library ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can read items library" ON items_library;
CREATE POLICY "Anyone can read items library"
  ON items_library FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "DMs can create items" ON items_library;
CREATE POLICY "DMs can create items"
  ON items_library FOR INSERT
  WITH CHECK (auth.uid() = created_by);
