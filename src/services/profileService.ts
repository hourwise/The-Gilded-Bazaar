import { supabase } from '../lib/supabaseClient';

export interface Profile {
  id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  credit_balance?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface PlayerCharacter {
  id: string;
  profile_id: string;
  campaign_id?: string | null;
  character_name: string;
  ancestry?: string | null;
  class_name?: string | null;
  level?: number;
  charisma_modifier?: number;
  persuasion_proficiency?: number;
  gold?: number;
  silver?: number;
  copper?: number;
  created_at?: string;
  updated_at?: string;
}

export const profileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  async createCharacter(character: Omit<PlayerCharacter, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('player_characters')
      .insert(character)
      .select()
      .single();
    return { data, error };
  },

  async getMyCharacters() {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return { data: null, error: new Error('No user') };

    const { data, error } = await supabase
      .from('player_characters')
      .select('*')
      .eq('profile_id', userId);
    return { data, error };
  },

  async getCharacterById(id: string) {
    const { data, error } = await supabase
      .from('player_characters')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },
};