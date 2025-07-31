export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      course_managers: {
        Row: {
          course_id: string
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          password_hash: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name: string
          password_hash: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          password_hash?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_managers_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "golf_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reviews: {
        Row: {
          comment: string
          course_id: string
          created_at: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment: string
          course_id: string
          created_at?: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string
          course_id?: string
          created_at?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "golf_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_requests: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          id: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      golf_courses: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          description: string | null
          established_year: number | null
          hole_handicaps: number[] | null
          hole_pars: number[] | null
          holes: number
          id: string
          image_gallery: string | null
          image_url: string | null
          latitude: number | null
          longitude: number | null
          name: string
          opening_hours: Json | null
          par: number | null
          phone: string | null
          state: string | null
          type: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          established_year?: number | null
          hole_handicaps?: number[] | null
          hole_pars?: number[] | null
          holes?: number
          id?: string
          image_gallery?: string | null
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_hours?: Json | null
          par?: number | null
          phone?: string | null
          state?: string | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          established_year?: number | null
          hole_handicaps?: number[] | null
          hole_pars?: number[] | null
          holes?: number
          id?: string
          image_gallery?: string | null
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_hours?: Json | null
          par?: number | null
          phone?: string | null
          state?: string | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      match_scores: {
        Row: {
          hole_scores: number[]
          id: string
          match_id: string
          submitted_at: string
          submitted_by: string
          total_score: number
          user_id: string
        }
        Insert: {
          hole_scores: number[]
          id?: string
          match_id: string
          submitted_at?: string
          submitted_by: string
          total_score: number
          user_id: string
        }
        Update: {
          hole_scores?: number[]
          id?: string
          match_id?: string
          submitted_at?: string
          submitted_by?: string
          total_score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_scores_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          course_id: string
          created_at: string
          creator_id: string
          id: string
          match_date: string
          match_type: string
          name: string
          opponent_id: string
          stakes: string | null
          status: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          creator_id: string
          id?: string
          match_date: string
          match_type?: string
          name: string
          opponent_id: string
          stakes?: string | null
          status?: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          creator_id?: string
          id?: string
          match_date?: string
          match_type?: string
          name?: string
          opponent_id?: string
          stakes?: string | null
          status?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "golf_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_course_managers: {
        Row: {
          course_id: string
          created_at: string
          email: string
          id: string
          name: string
          password_hash: string
          phone: string | null
          status: string
        }
        Insert: {
          course_id: string
          created_at?: string
          email: string
          id?: string
          name: string
          password_hash: string
          phone?: string | null
          status?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          password_hash?: string
          phone?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_course_managers_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "golf_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          handicap: number | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          handicap?: number | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          handicap?: number | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          additional_players: Json | null
          confirmed_at: string | null
          confirmed_by: string | null
          course_id: string
          course_location: string | null
          course_name: string
          course_notes: string | null
          created_at: string | null
          date: string
          id: string
          license: string | null
          player_name: string | null
          players: number
          status: string | null
          time: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          additional_players?: Json | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          course_id: string
          course_location?: string | null
          course_name: string
          course_notes?: string | null
          created_at?: string | null
          date: string
          id?: string
          license?: string | null
          player_name?: string | null
          players?: number
          status?: string | null
          time: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          additional_players?: Json | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          course_id?: string
          course_location?: string | null
          course_name?: string
          course_notes?: string | null
          created_at?: string | null
          date?: string
          id?: string
          license?: string | null
          player_name?: string | null
          players?: number
          status?: string | null
          time?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "course_managers"
            referencedColumns: ["id"]
          },
        ]
      }
      rounds: {
        Row: {
          course_id: string
          created_at: string | null
          date: string
          hole_scores: number[] | null
          id: string
          notes: string | null
          score: number
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          date?: string
          hole_scores?: number[] | null
          id?: string
          notes?: string | null
          score: number
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          date?: string
          hole_scores?: number[] | null
          id?: string
          notes?: string | null
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rounds_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "golf_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rounds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participants: {
        Row: {
          id: string
          registration_date: string
          status: string
          tournament_id: string
          user_id: string
        }
        Insert: {
          id?: string
          registration_date?: string
          status?: string
          tournament_id: string
          user_id: string
        }
        Update: {
          id?: string
          registration_date?: string
          status?: string
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_scores: {
        Row: {
          hole_scores: number[]
          id: string
          participant_id: string
          position: number | null
          round_number: number
          submitted_at: string
          submitted_by: string
          total_score: number
          tournament_id: string
        }
        Insert: {
          hole_scores: number[]
          id?: string
          participant_id: string
          position?: number | null
          round_number?: number
          submitted_at?: string
          submitted_by: string
          total_score: number
          tournament_id: string
        }
        Update: {
          hole_scores?: number[]
          id?: string
          participant_id?: string
          position?: number | null
          round_number?: number
          submitted_at?: string
          submitted_by?: string
          total_score?: number
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_scores_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "tournament_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_scores_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          course_id: string
          created_at: string
          creator_id: string
          description: string | null
          end_date: string | null
          entry_fee: number | null
          id: string
          max_players: number | null
          name: string
          prize_pool: number | null
          rules: Json | null
          start_date: string
          status: string
          tournament_type: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          creator_id: string
          description?: string | null
          end_date?: string | null
          entry_fee?: number | null
          id?: string
          max_players?: number | null
          name: string
          prize_pool?: number | null
          rules?: Json | null
          start_date: string
          status?: string
          tournament_type?: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          creator_id?: string
          description?: string | null
          end_date?: string | null
          entry_fee?: number | null
          id?: string
          max_players?: number | null
          name?: string
          prize_pool?: number | null
          rules?: Json | null
          start_date?: string
          status?: string
          tournament_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "golf_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          course_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "golf_courses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_friend_request: {
        Args: { request_id: string }
        Returns: boolean
      }
      approve_course_manager: {
        Args: { pending_id: string }
        Returns: boolean
      }
      authenticate_course_manager: {
        Args: { manager_email: string; manager_password: string }
        Returns: {
          manager_id: string
          course_id: string
          name: string
          email: string
          course_name: string
        }[]
      }
      calculate_user_handicap: {
        Args: { user_uuid: string }
        Returns: number
      }
      reject_course_manager: {
        Args: { pending_id: string }
        Returns: boolean
      }
      reject_friend_request: {
        Args: { request_id: string }
        Returns: boolean
      }
      remove_friendship: {
        Args: { friend_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
