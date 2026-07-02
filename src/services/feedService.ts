import { supabase } from '../lib/supabaseClient';

export interface CampaignFeed {
  id: string;
  campaign_id: string;
  visibility: 'party' | 'dm_only' | 'private';
  recipient_profile_id?: string | null;
  entry_type: string;
  title: string;
  body?: string;
  metadata?: Record<string, any>;
  created_by: string;
  created_at?: string;
}

export const feedService = {
  async getFeedForCampaign(campaignId: string) {
    const { data, error } = await supabase
      .from('campaign_feed')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getMyFeed() {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return { data: null, error: new Error('No user') };

    const { data, error } = await supabase
      .from('campaign_feed')
      .select('*')
      .or(`visibility.eq.party,visibility.eq.private,and(visibility.eq.private,recipient_profile_id.eq.${userId})`)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createFeedEntry(entry: Omit<CampaignFeed, 'id' | 'created_by' | 'created_at'>) {
    const { data, error } = await supabase
      .from('campaign_feed')
      .insert({ ...entry, created_by: (await supabase.auth.getUser()).data.user?.id })
      .select()
      .single();
    return { data, error };
  },
};