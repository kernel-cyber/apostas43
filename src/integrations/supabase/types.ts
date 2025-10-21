export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bets: {
        Row: {
          amount: number
          created_at: string
          id: string
          match_id: string
          pilot_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          match_id: string
          pilot_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          match_id?: string
          pilot_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bets_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bets_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
        ]
      }
      event_standings: {
        Row: {
          created_at: string
          event_id: string
          final_position: number
          id: string
          initial_position: number | null
          losses: number | null
          pilot_id: string
          total_points: number | null
          updated_at: string
          wins: number | null
        }
        Insert: {
          created_at?: string
          event_id: string
          final_position: number
          id?: string
          initial_position?: number | null
          losses?: number | null
          pilot_id: string
          total_points?: number | null
          updated_at?: string
          wins?: number | null
        }
        Update: {
          created_at?: string
          event_id?: string
          final_position?: number
          id?: string
          initial_position?: number | null
          losses?: number | null
          pilot_id?: string
          total_points?: number | null
          updated_at?: string
          wins?: number | null
        }
        Relationships: []
      }
      events: {
        Row: {
          bracket_type: string | null
          created_at: string
          description: string | null
          event_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          bracket_type?: string | null
          created_at?: string
          description?: string | null
          event_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          bracket_type?: string | null
          created_at?: string
          description?: string | null
          event_date?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          betting_locked: boolean | null
          bracket_type: string | null
          created_at: string
          cycle_position: number | null
          event_id: string
          id: string
          match_status: Database["public"]["Enums"]["match_status"] | null
          pilot1_id: string
          pilot1_position: number | null
          pilot2_id: string
          pilot2_position: number | null
          round_number: number
          scheduled_time: string | null
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          betting_locked?: boolean | null
          bracket_type?: string | null
          created_at?: string
          cycle_position?: number | null
          event_id: string
          id?: string
          match_status?: Database["public"]["Enums"]["match_status"] | null
          pilot1_id: string
          pilot1_position?: number | null
          pilot2_id: string
          pilot2_position?: number | null
          round_number: number
          scheduled_time?: string | null
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          betting_locked?: boolean | null
          bracket_type?: string | null
          created_at?: string
          cycle_position?: number | null
          event_id?: string
          id?: string
          match_status?: Database["public"]["Enums"]["match_status"] | null
          pilot1_id?: string
          pilot1_position?: number | null
          pilot2_id?: string
          pilot2_position?: number | null
          round_number?: number
          scheduled_time?: string | null
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_pilot1_id_fkey"
            columns: ["pilot1_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_pilot2_id_fkey"
            columns: ["pilot2_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
        ]
      }
      pilots: {
        Row: {
          best_time: string | null
          car_model: string | null
          car_name: string
          created_at: string
          current_position: number | null
          id: string
          image_url: string | null
          losses: number | null
          name: string
          points: number | null
          position: number | null
          team: string | null
          total_races: number | null
          updated_at: string
          wins: number | null
        }
        Insert: {
          best_time?: string | null
          car_model?: string | null
          car_name: string
          created_at?: string
          current_position?: number | null
          id?: string
          image_url?: string | null
          losses?: number | null
          name: string
          points?: number | null
          position?: number | null
          team?: string | null
          total_races?: number | null
          updated_at?: string
          wins?: number | null
        }
        Update: {
          best_time?: string | null
          car_model?: string | null
          car_name?: string
          created_at?: string
          current_position?: number | null
          id?: string
          image_url?: string | null
          losses?: number | null
          name?: string
          points?: number | null
          position?: number | null
          team?: string | null
          total_races?: number | null
          updated_at?: string
          wins?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          favorite_pilot_id: string | null
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          favorite_pilot_id?: string | null
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          favorite_pilot_id?: string | null
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_favorite_pilot_id_fkey"
            columns: ["favorite_pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
        ]
      }
      top20_positions: {
        Row: {
          consecutive_absences: number | null
          created_at: string | null
          id: string
          last_match_date: string | null
          pilot_id: string | null
          position: number
          updated_at: string | null
        }
        Insert: {
          consecutive_absences?: number | null
          created_at?: string | null
          id?: string
          last_match_date?: string | null
          pilot_id?: string | null
          position: number
          updated_at?: string | null
        }
        Update: {
          consecutive_absences?: number | null
          created_at?: string | null
          id?: string
          last_match_date?: string | null
          pilot_id?: string | null
          position?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "top20_positions_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "pilots"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          category: Database["public"]["Enums"]["badge_category"]
          created_at: string
          earned_at: string
          id: string
          metadata: Json | null
          progress: number | null
          tier: Database["public"]["Enums"]["badge_tier"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          badge_id: string
          category: Database["public"]["Enums"]["badge_category"]
          created_at?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          progress?: number | null
          tier?: Database["public"]["Enums"]["badge_tier"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          category?: Database["public"]["Enums"]["badge_category"]
          created_at?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          progress?: number | null
          tier?: Database["public"]["Enums"]["badge_tier"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          points: number | null
          total_bets: number | null
          total_wins: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          points?: number | null
          total_bets?: number | null
          total_wins?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          points?: number | null
          total_bets?: number | null
          total_wins?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_points_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_match_odds: {
        Args: { p_match_id: string }
        Returns: Json
      }
      capture_initial_positions: {
        Args: { p_event_id: string }
        Returns: undefined
      }
      finalize_event_rankings: {
        Args: { p_event_id: string }
        Returns: undefined
      }
      generate_top20_matches: {
        Args: { p_bracket_type: string; p_event_id: string }
        Returns: {
          cycle_pos: number
          pilot1_id: string
          pilot1_pos: number
          pilot2_id: string
          pilot2_pos: number
          round_num: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      place_bet: {
        Args: {
          p_amount: number
          p_match_id: string
          p_pilot_id: string
          p_user_id: string
        }
        Returns: Json
      }
      settle_match: {
        Args: { p_match_id: string; p_winner_id: string }
        Returns: undefined
      }
      swap_top20_positions: {
        Args: { p_positions: number[] }
        Returns: undefined
      }
      update_event_standings_for_match: {
        Args: { p_match_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      badge_category:
        | "participation"
        | "performance"
        | "volume"
        | "special"
        | "social"
      badge_tier:
        | "bronze"
        | "silver"
        | "gold"
        | "platinum"
        | "diamond"
        | "legendary"
      event_type: "top_20"
      match_status: "upcoming" | "in_progress" | "finished"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      badge_category: [
        "participation",
        "performance",
        "volume",
        "special",
        "social",
      ],
      badge_tier: [
        "bronze",
        "silver",
        "gold",
        "platinum",
        "diamond",
        "legendary",
      ],
      event_type: ["top_20"],
      match_status: ["upcoming", "in_progress", "finished"],
    },
  },
} as const
