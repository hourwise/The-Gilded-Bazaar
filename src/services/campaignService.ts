import { supabase } from '../lib/supabaseClient';

export interface Campaign {
  id: string;
  name: string;
  join_code: string;
  created_by: string;
  instant_purchases_enabled?: boolean;
  dm_approval_required?: boolean;
  ai_enabled?: boolean;
  created_at?: string;
}

export interface CampaignMember {
  id: string;
  campaign_id: string;
  profile_id: string;
  character_id?: string;
  role: 'owner_dm' | 'co_dm' | 'player' | 'spectator';
  joined_at?: string;
}

export const campaignService = {
  async createCampaign(name: string) {
    const { data, error } = await supabase.rpc('create_campaign', {
      campaign_name: name,
    });
    return { data, error };
  },

  async joinCampaign(code: string, characterId?: string) {
    const { data, error } = await supabase.rpc('join_campaign_by_code', {
      code,
      character_id: characterId,
    });
    return { data, error };
  },

  async getMyCampaigns() {
    const { data, error } = await supabase
      .from('campaign_members')
      .select('campaign_id, campaigns(*), role')
      .eq('profile_id', (await supabase.auth.getUser()).data.user?.id);
    return { data, error };
  },

  async getCampaignMembers(campaignId: string) {
    const { data, error } = await supabase
      .from('campaign_members')
      .select('*, profiles(*)')
      .eq('campaign_id', campaignId);
    return { data, error };
  },

  async getCampaignById(id: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },
};