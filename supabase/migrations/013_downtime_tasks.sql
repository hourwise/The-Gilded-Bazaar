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

-- Preserve rows from the previous active_downtime table when present.
DO $$
BEGIN
  IF to_regclass('public.active_downtime') IS NOT NULL THEN
    EXECUTE $backfill$
      INSERT INTO downtime_tasks (
        campaign_id,
        character_id,
        task_name,
        start_time,
        end_time,
        status,
        progress_percent
      )
      SELECT
        ad.campaign_id,
        pc.id,
        ad.task_name,
        ad.start_time,
        ad.end_time,
        CASE WHEN ad.is_completed THEN 'completed' ELSE 'active' END,
        CASE WHEN ad.is_completed THEN 100 ELSE 0 END
      FROM active_downtime ad
      JOIN player_characters pc
        ON pc.profile_id = ad.player_id
        AND pc.campaign_id = ad.campaign_id
      ON CONFLICT DO NOTHING
    $backfill$;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE downtime_tasks ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Players can view their own downtime tasks" ON downtime_tasks;
CREATE POLICY "Players can view their own downtime tasks"
  ON downtime_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM player_characters pc
      WHERE pc.id = downtime_tasks.character_id
      AND pc.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "DMs can manage downtime tasks in their campaign" ON downtime_tasks;
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

DROP POLICY IF EXISTS "DMs can create downtime tasks" ON downtime_tasks;
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

DROP POLICY IF EXISTS "DMs can update downtime tasks" ON downtime_tasks;
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
