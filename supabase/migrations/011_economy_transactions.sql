-- Migration 011: Economy Transactions
-- Audit log for all wallet changes, purchases, credit grants, etc.

CREATE TABLE IF NOT EXISTS economy_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  character_id UUID REFERENCES player_characters(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL,
  amount_copper INTEGER NOT NULL,
  description TEXT,
  source_table TEXT,
  source_id UUID,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE economy_transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Members can view transactions in their campaign"
  ON economy_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_members cm
      WHERE cm.campaign_id = economy_transactions.campaign_id
      AND cm.profile_id = auth.uid()
    )
  );