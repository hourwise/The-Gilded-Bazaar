-- Migration 013: Downtime Tasks
-- DM-assigned downtime activities for players.

CREATE TABLE IF NOT EXISTS downtime_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES player_characters(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  task_type TEXT,
  description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  progress_percent INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('planned', 'active', 'completed', 'failed', 'cancelled')) DEFAULT 'planned',
  result_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE downtime_tasks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Players can view their own downtime tasks"
  ON downtime_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM player_characters pc
      WHERE pc.id = downtime_tasks.character_id
      AND pc.profile_id = auth.uid()
    )
  );

CREATE POLICY "DMs can manage downtime tasks in their campaign"
  ON downtime_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_members cm
      WHERE cm.campaign_id = downtime_tasks.campaign_id
      AND cm.profile_id = auth.uid()
      AND cm.role IN ('owner_dm', 'co_dm')
    )
  );

CREATE POLICY "DMs can create downtime tasks"
  ON downtime_tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaign_members cm
      WHERE cm.campaign_id = downtime_tasks.campaign_id
      AND cm.profile_id = auth.uid()
      AND cm.role IN ('owner_dm', 'co_dm')
    )
  );

CREATE POLICY "DMs can update downtime tasks"
  ON downtime_tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaign_members cm
      WHERE cm.campaign_id = downtime_tasks.campaign_id
      AND cm.profile_id = auth.uid()
      AND cm.role IN ('owner_dm', 'co_dm')
    )
  );