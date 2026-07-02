export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          credit_balance: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          credit_balance?: number | null;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          credit_balance?: number | null;
        };
      };
      player_characters: {
        Row: {
          id: string;
          profile_id: string;
          campaign_id: string | null;
          character_name: string;
          ancestry: string | null;
          class_name: string | null;
          level: number;
          charisma_modifier: number;
          persuasion_proficiency: number;
          gold: number;
          silver: number;
          copper: number;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          profile_id: string;
          character_name: string;
          campaign_id?: string | null;
          ancestry?: string | null;
          class_name?: string | null;
          level?: number;
          charisma_modifier?: number;
          persuasion_proficiency?: number;
          gold?: number;
          silver?: number;
          copper?: number;
        };
        Update: {
          campaign_id?: string | null;
          character_name?: string;
          ancestry?: string | null;
          class_name?: string | null;
          level?: number;
          charisma_modifier?: number;
          persuasion_proficiency?: number;
          gold?: number;
          silver?: number;
          copper?: number;
        };
      };
      campaigns: {
        Row: {
          id: string;
          name: string;
          join_code: string;
          created_by: string;
          instant_purchases_enabled: boolean;
          dm_approval_required: boolean;
          ai_enabled: boolean;
          created_at: string | null;
        };
        Insert: {
          name: string;
          join_code: string;
          created_by: string;
          instant_purchases_enabled?: boolean;
          dm_approval_required?: boolean;
          ai_enabled?: boolean;
        };
        Update: {
          name?: string;
          join_code?: string;
          created_by?: string;
          instant_purchases_enabled?: boolean;
          dm_approval_required?: boolean;
          ai_enabled?: boolean;
        };
      };
      campaign_members: {
        Row: {
          id: string;
          campaign_id: string;
          profile_id: string;
          character_id: string | null;
          role: 'owner_dm' | 'co_dm' | 'player' | 'spectator';
          joined_at: string | null;
        };
        Insert: {
          campaign_id: string;
          profile_id: string;
          character_id?: string | null;
          role?: 'owner_dm' | 'co_dm' | 'player' | 'spectator';
        };
        Update: {
          character_id?: string | null;
          role?: 'owner_dm' | 'co_dm' | 'player' | 'spectator';
        };
      };
      settlements: {
        Row: {
          id: string;
          campaign_id: string;
          name: string;
          description: string | null;
          prosperity: number;
          danger: number;
          magic_density: number;
          current_event: string | null;
          status: string;
          created_at: string | null;
        };
        Insert: {
          campaign_id: string;
          name: string;
          description?: string | null;
          prosperity?: number;
          danger?: number;
          magic_density?: number;
          current_event?: string | null;
          status?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          prosperity?: number;
          danger?: number;
          magic_density?: number;
          current_event?: string | null;
          status?: string;
        };
      };
      shops: {
        Row: {
          id: string;
          campaign_id: string;
          settlement_id: string | null;
          name: string;
          description: string | null;
          shop_type: string | null;
          shopkeeper_name: string | null;
          shopkeeper_race: string | null;
          shopkeeper_personality: string | null;
          is_active: boolean;
          created_at: string | null;
        };
        Insert: {
          campaign_id: string;
          name: string;
          settlement_id?: string | null;
          description?: string | null;
          shop_type?: string | null;
          shopkeeper_name?: string | null;
          shopkeeper_race?: string | null;
          shopkeeper_personality?: string | null;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          description?: string | null;
          settlement_id?: string | null;
          shop_type?: string | null;
          shopkeeper_name?: string | null;
          shopkeeper_race?: string | null;
          shopkeeper_personality?: string | null;
          is_active?: boolean;
        };
      };
      items_library: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          base_price_copper: number;
          rarity: string | null;
          category: string | null;
          rules_source: string;
          is_homebrew: boolean;
          created_by: string | null;
          created_at: string | null;
        };
        Insert: {
          name: string;
          description?: string | null;
          base_price_copper?: number;
          rarity?: string | null;
          category?: string | null;
          rules_source?: string;
          is_homebrew?: boolean;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          base_price_copper?: number;
          rarity?: string | null;
          category?: string | null;
        };
      };
      shop_inventory: {
        Row: {
          id: string;
          shop_id: string;
          item_id: string;
          current_price_copper: number;
          quantity: number;
          is_visible: boolean;
          updated_at: string | null;
        };
        Insert: {
          shop_id: string;
          item_id: string;
          current_price_copper: number;
          quantity?: number;
          is_visible?: boolean;
        };
        Update: {
          current_price_copper?: number;
          quantity?: number;
          is_visible?: boolean;
        };
      };
      backpacks: {
        Row: {
          id: string;
          character_id: string;
          item_id: string;
          quantity: number;
          source: string | null;
          created_at: string | null;
        };
        Insert: {
          character_id: string;
          item_id: string;
          quantity?: number;
          source?: string | null;
        };
        Update: {
          quantity?: number;
          source?: string | null;
        };
      };
      purchase_requests: {
        Row: {
          id: string;
          campaign_id: string;
          character_id: string;
          shop_inventory_id: string;
          quantity: number;
          price_copper: number;
          status: 'pending' | 'approved' | 'rejected' | 'cancelled';
          requested_by: string;
          resolved_by: string | null;
          rejection_reason: string | null;
          created_at: string | null;
          resolved_at: string | null;
        };
        Insert: {
          campaign_id: string;
          character_id: string;
          shop_inventory_id: string;
          quantity?: number;
          price_copper: number;
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
          requested_by: string;
        };
        Update: {
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
          resolved_by?: string | null;
          rejection_reason?: string | null;
          resolved_at?: string | null;
        };
      };
      economy_transactions: {
        Row: {
          id: string;
          campaign_id: string;
          character_id: string | null;
          transaction_type: string;
          amount_copper: number;
          description: string | null;
          source_table: string | null;
          source_id: string | null;
          created_by: string;
          created_at: string | null;
        };
        Insert: {
          campaign_id: string;
          character_id?: string | null;
          transaction_type: string;
          amount_copper: number;
          description?: string | null;
          source_table?: string | null;
          source_id?: string | null;
          created_by: string;
        };
        Update: {};
      };
      campaign_feed: {
        Row: {
          id: string;
          campaign_id: string;
          visibility: 'party' | 'dm_only' | 'private';
          recipient_profile_id: string | null;
          entry_type: string;
          title: string;
          body: string | null;
          metadata: Json;
          created_by: string;
          created_at: string | null;
        };
        Insert: {
          campaign_id: string;
          visibility: 'party' | 'dm_only' | 'private';
          recipient_profile_id?: string | null;
          entry_type: string;
          title: string;
          body?: string | null;
          metadata?: Json;
          created_by: string;
        };
        Update: {};
      };
      downtime_tasks: {
        Row: {
          id: string;
          campaign_id: string;
          character_id: string;
          task_name: string;
          task_type: string | null;
          description: string | null;
          start_time: string | null;
          end_time: string | null;
          progress_percent: number;
          status: 'planned' | 'active' | 'completed' | 'failed' | 'cancelled';
          result_summary: string | null;
          created_at: string | null;
        };
        Insert: {
          campaign_id: string;
          character_id: string;
          task_name: string;
          task_type?: string | null;
          description?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          progress_percent?: number;
          status?: 'planned' | 'active' | 'completed' | 'failed' | 'cancelled';
        };
        Update: {
          task_name?: string;
          description?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          progress_percent?: number;
          status?: 'planned' | 'active' | 'completed' | 'failed' | 'cancelled';
          result_summary?: string | null;
        };
      };
      ai_generation_jobs: {
        Row: {
          id: string;
          campaign_id: string;
          requested_by: string;
          job_type: string;
          prompt_payload: Json | null;
          result_payload: Json | null;
          status: 'queued' | 'running' | 'complete' | 'failed';
          credits_charged: number;
          created_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          campaign_id: string;
          requested_by: string;
          job_type: string;
          prompt_payload?: Json | null;
        };
        Update: {
          status?: 'queued' | 'running' | 'complete' | 'failed';
          result_payload?: Json | null;
          credits_charged?: number;
          completed_at?: string | null;
        };
      };
    };
  };
}