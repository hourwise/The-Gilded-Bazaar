import { supabase } from '../lib/supabaseClient';

export interface Shop {
  id: string;
  campaign_id: string;
  settlement_id?: string | null;
  name: string;
  description?: string | null;
  shop_type?: string | null;
  shopkeeper_name?: string | null;
  shopkeeper_race?: string | null;
  shopkeeper_personality?: string | null;
  is_active?: boolean;
  created_at?: string;
}

export interface ShopInventory {
  id: string;
  shop_id: string;
  item_id: string;
  current_price_copper: number;
  quantity: number;
  is_visible?: boolean;
  updated_at?: string;
}

export interface ItemLibrary {
  id: string;
  name: string;
  description?: string | null;
  base_price_copper?: number;
  rarity?: string | null;
  category?: string | null;
  rules_source?: string;
  is_homebrew?: boolean;
  created_by?: string | null;
  created_at?: string;
}

export const shopService = {
  async createShop(shop: Omit<Shop, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('shops')
      .insert(shop)
      .select()
      .single();
    return { data, error };
  },

  async getShopsByCampaign(campaignId: string) {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at');
    return { data, error };
  },

  async updateShop(id: string, updates: Partial<Shop>) {
    const { data, error } = await supabase
      .from('shops')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async deleteShop(id: string) {
    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', id);
    return { error };
  },

  async getShopInventory(shopId: string) {
    const { data, error } = await supabase
      .from('shop_inventory')
      .select('*, items_library(*)')
      .eq('shop_id', shopId)
      .order('is_visible', { ascending: false });
    return { data, error };
  },

  async addInventoryItem(item: Omit<ShopInventory, 'id' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('shop_inventory')
      .insert(item)
      .select()
      .single();
    return { data, error };
  },

  async updateInventoryItem(id: string, updates: Partial<ShopInventory>) {
    const { data, error } = await supabase
      .from('shop_inventory')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async deleteInventoryItem(id: string) {
    const { error } = await supabase
      .from('shop_inventory')
      .delete()
      .eq('id', id);
    return { error };
  },

  async searchItems(query: string) {
    const { data, error } = await supabase
      .from('items_library')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(50);
    return { data, error };
  },

  async getAllItems() {
    const { data, error } = await supabase
      .from('items_library')
      .select('*')
      .order('name');
    return { data, error };
  },
};