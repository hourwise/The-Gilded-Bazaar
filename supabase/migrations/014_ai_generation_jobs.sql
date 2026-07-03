-- Migration 014: AI Generation Jobs
-- Tracks AI content generation requests and results.
-- AI key never appears in the client app.

CREATE TABLE IF NOT EXISTS ai_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES profiles(id),
  job_type TEXT NOT NULL,
  prompt_payload JSONB,
  result_payload JSONB,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'complete', 'failed')) DEFAULT 'queued',
  credits_charged INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE ai_generation_jobs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "DMs can view AI jobs in their campaign"
  ON ai_generation_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaign_members cm
      WHERE cm.campaign_id = ai_generation_jobs.campaign_id
      AND cm.profile_id = auth.uid()
      AND cm.role IN ('owner_dm', 'co_dm')
    )
  );

CREATE POLICY "DMs can create AI jobs"
  ON ai_generation_jobs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaign_members cm
      WHERE cm.campaign_id = ai_generation_jobs.campaign_id
      AND cm.profile_id = auth.uid()
      AND cm.role IN ('owner_dm', 'co_dm')
    )
  );