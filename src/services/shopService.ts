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

  async getPlayerCampaignAndShop(profileId: string) {
    // Get the player's character
    const { data: charData, error: charError } = await supabase
      .from('player_characters')
      .select('id, campaign_id')
      .eq('profile_id', profileId)
      .order('created_at')
      .limit(1);

    if (charError) return { data: null, error: charError };
    if (!charData || charData.length === 0) {
      return { data: { inCampaign: false, shop: null, characterId: null, campaignId: null }, error: null };
    }

    const character = charData[0];

    // Get the active shop for this campaign
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('id, name, description, shopkeeper_name, shopkeeper_race')
      .eq('campaign_id', character.campaign_id)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (shopError) return { data: null, error: shopError };

    return {
      data: {
        inCampaign: true,
        characterId: character.id,
        campaignId: character.campaign_id,
        shop: shop || null,
      },
      error: null,
    };
  },

  async getShopWithItems(shopId: string) {
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('id, name, description, shopkeeper_name, shopkeeper_race')
      .eq('id', shopId)
      .maybeSingle();

    if (shopError) return { data: null, error: shopError };
    if (!shop) return { data: null, error: new Error('Shop not found') };

    const { data: inventory, error: invError } = await supabase
      .from('shop_inventory')
      .select(`
        id,
        current_price_copper,
        quantity,
        item_id,
        items_library (
          name,
          description
        )
      `)
      .eq('shop_id', shopId)
      .eq('is_visible', true);

    if (invError) return { data: null, error: invError };

    const items = (inventory || []).map((row: any) => ({
      id: row.id,
      item_id: row.item_id,
      name: row.items_library.name,
      description: row.items_library.description,
      current_price_copper: row.current_price_copper,
      quantity: row.quantity,
    }));

    return {
      data: {
        id: shop.id,
        name: shop.name,
        description: shop.description || '',
        shopkeeper_name: shop.shopkeeper_name ?? null,
        shopkeeper_race: shop.shopkeeper_race ?? null,
        items,
      },
      error: null,
    };
  },
};