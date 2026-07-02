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

-- Enable RLS
ALTER TABLE items_library ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read items library"
  ON items_library FOR SELECT
  USING (true);

CREATE POLICY "DMs can create items"
  ON items_library FOR INSERT
  WITH CHECK (auth.uid() = created_by);