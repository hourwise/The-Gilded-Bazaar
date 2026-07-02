-- Migration 010: Purchase Requests
-- Players request purchases, DMs approve or reject them.
-- No direct client-side wallet mutation is allowed.

CREATE TABLE IF NOT EXISTS purchase_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES player_characters(id) ON DELETE CASCADE,
  shop_inventory_id UUID NOT NULL REFERENCES shop_inventory(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  price_copper INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
  requested_by UUID NOT NULL REFERENCES profiles(id),
  resolved_by UUID REFERENCES profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Players can view their own purchase requests"
  ON purchase_requests FOR SELECT
  USING (auth.uid() = requested_by);

CREATE POLICY "DMs can view purchase requests in their campaign"
  ON purchase_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_members cm
      WHERE cm.campaign_id = purchase_requests.campaign_id
      AND cm.profile_id = auth.uid()
      AND cm.role IN ('owner_dm', 'co_dm')
    )
  );

CREATE POLICY "Players can create purchase requests"
  ON purchase_requests FOR INSERT
  WITH CHECK (auth.uid() = requested_by);