import { supabase } from '../lib/supabaseClient';

export interface BackpackItem {
  id: string; // backpack row id
  character_id: string;
  item_id: string;
  quantity: number;
  source: string | null;
  created_at: string | null;
  // Joined from items_library
  item_name: string;
  item_description: string | null;
  base_price_copper: number;
  rarity: string | null;
  category: string | null;
  is_homebrew: boolean;
}

export const backpackService = {
  /**
   * Fetch all items in a character's backpack with full item details.
   */
  async getBackpackForCharacter(characterId: string) {
    const { data, error } = await supabase
      .from('backpacks')
      .select(`
        id,
        character_id,
        item_id,
        quantity,
        source,
        created_at,
        items_library!inner(
          name,
          description,
          base_price_copper,
          rarity,
          category,
          is_homebrew
        )
      `)
      .eq('character_id', characterId)
      .order('created_at', { ascending: false });

    if (error) return { data: null, error };

    // Flatten the joined data
    const items: BackpackItem[] = (data || []).map((row: any) => ({
      id: row.id,
      character_id: row.character_id,
      item_id: row.item_id,
      quantity: row.quantity,
      source: row.source,
      created_at: row.created_at,
      item_name: row.items_library?.name ?? 'Unknown Item',
      item_description: row.items_library?.description ?? null,
      base_price_copper: row.items_library?.base_price_copper ?? 0,
      rarity: row.items_library?.rarity ?? null,
      category: row.items_library?.category ?? 'misc',
      is_homebrew: row.items_library?.is_homebrew ?? true,
    }));

    return { data: items, error: null };
  },

  /**
   * Get the current user's active character and their backpack.
   */
  async getMyBackpack() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('No user session') };

    // Get the user's first character (active in a campaign)
    const { data: character, error: charError } = await supabase
      .from('player_characters')
      .select('id, character_name, campaign_id')
      .eq('profile_id', user.id)
      .not('campaign_id', 'is', null)
      .limit(1)
      .maybeSingle();

    if (charError || !character) {
      return { data: null, error: charError || new Error('No character found in a campaign') };
    }

    const { data, error } = await this.getBackpackForCharacter(character.id);
    return { data, character, error };
  },
};
