import { supabase } from '../lib/supabaseClient';

export interface PurchaseRequest {
  id: string;
  campaign_id: string;
  character_id: string;
  shop_inventory_id: string;
  quantity: number;
  price_copper: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requested_by: string;
  resolved_by?: string | null;
  rejection_reason?: string | null;
  created_at?: string;
  resolved_at?: string;
}

export const purchaseService = {
  async requestPurchase(shopInventoryId: string, quantity: number = 1) {
    const { data, error } = await supabase.rpc('request_purchase', {
      p_shop_inventory_id: shopInventoryId,
      p_quantity: quantity,
    });
    return { data, error };
  },

  async approvePurchase(purchaseRequestId: string) {
    const { data, error } = await supabase.rpc('approve_purchase', {
      p_purchase_request_id: purchaseRequestId,
    });
    return { data, error };
  },

  async rejectPurchase(purchaseRequestId: string, reason?: string) {
    const { data, error } = await supabase.rpc('reject_purchase', {
      p_purchase_request_id: purchaseRequestId,
      p_reason: reason || null,
    });
    return { data, error };
  },

  async getPendingPurchases(campaignId: string) {
    const { data, error } = await supabase
      .from('purchase_requests')
      .select('*, player_characters(*), profiles(*)')
      .eq('campaign_id', campaignId)
      .eq('status', 'pending')
      .order('created_at');
    return { data, error };
  },

  async getMyPurchaseRequests() {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return { data: null, error: new Error('No user') };

    const { data, error } = await supabase
      .from('purchase_requests')
      .select('*, shop_inventory(*, shops(*), items_library(*))')
      .eq('requested_by', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },
};