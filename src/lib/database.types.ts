export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      active_downtime: {
        Row: {
          id: string
          player_id: string | null
          campaign_id: string | null
          task_name: string
          start_time: string | null
          end_time: string
          is_completed: boolean | null
        }
        Insert: {
          id?: string
          player_id?: string | null
          campaign_id?: string | null
          task_name: string
          start_time?: string | null
          end_time: string
          is_completed?: boolean | null
        }
        Update: {
          id?: string
          player_id?: string | null
          campaign_id?: string | null
          task_name?: string
          start_time?: string | null
          end_time?: string
          is_completed?: boolean | null
        }
      }
      campaign_members: {
        Row: {
          id: string
          campaign_id: string | null
          player_id: string | null
          joined_at: string | null
        }
        Insert: {
          id?: string
          campaign_id?: string | null
          player_id?: string | null
          joined_at?: string | null
        }
        Update: {
          id?: string
          campaign_id?: string | null
          player_id?: string | null
          joined_at?: string | null
        }
      }
      campaigns: {
        Row: {
          id: string
          name: string
          join_code: string
          dm_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          join_code: string
          dm_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          join_code?: string
          dm_id?: string
          created_at?: string | null
        }
      }
      credit_transactions: {
        Row: {
          id: string
          profile_id: string | null
          amount: number
          transaction_type: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          profile_id?: string | null
          amount: number
          transaction_type?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string | null
          amount?: number
          transaction_type?: string | null
          created_at?: string | null
        }
      }
      items_library: {
        Row: {
          id: string
          name: string
          description: string | null
          base_price: number | null
          rarity: string | null
          category: string | null
          is_homebrew: boolean | null
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          base_price?: number | null
          rarity?: string | null
          category?: string | null
          is_homebrew?: boolean | null
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          base_price?: number | null
          rarity?: string | null
          category?: string | null
          is_homebrew?: boolean | null
          created_by?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          credit_balance: number | null
          is_dm: boolean | null
          updated_at: string | null
          race: string | null
          charisma_modifier: number | null
          persuasion_proficiency: number | null
          gold: number | null
          silver: number | null
          copper: number | null
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          credit_balance?: number | null
          is_dm?: boolean | null
          updated_at?: string | null
          race?: string | null
          charisma_modifier?: number | null
          persuasion_proficiency?: number | null
          gold?: number | null
          silver?: number | null
          copper?: number | null
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          credit_balance?: number | null
          is_dm?: boolean | null
          updated_at?: string | null
          race?: string | null
          charisma_modifier?: number | null
          persuasion_proficiency?: number | null
          gold?: number | null
          silver?: number | null
          copper?: number | null
        }
      }
      shop_inventory: {
        Row: {
          id: string
          shop_id: string | null
          item_id: string | null
          current_price: number
          quantity: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          shop_id?: string | null
          item_id?: string | null
          current_price: number
          quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          shop_id?: string | null
          item_id?: string | null
          current_price?: number
          quantity?: number | null
          updated_at?: string | null
        }
      }
      shops: {
        Row: {
          id: string
          campaign_id: string | null
          name: string
          description: string | null
          location_name: string | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          campaign_id?: string | null
          name: string
          description?: string | null
          location_name?: string | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          campaign_id?: string | null
          name?: string
          description?: string | null
          location_name?: string | null
          is_active?: boolean | null
          created_at?: string | null
        }
      }
    }
  }
}
