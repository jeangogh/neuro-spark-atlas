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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bonus_requests: {
        Row: {
          analysis_result: Json | null
          analyzed_at: string | null
          consent_token: string
          consented_at: string | null
          created_at: string
          id: string
          partner_consented: boolean
          partner_email: string
          partner_id: string | null
          relationship_detail: string | null
          relationship_type: string
          requester_consented: boolean
          requester_id: string
          status: string
        }
        Insert: {
          analysis_result?: Json | null
          analyzed_at?: string | null
          consent_token?: string
          consented_at?: string | null
          created_at?: string
          id?: string
          partner_consented?: boolean
          partner_email: string
          partner_id?: string | null
          relationship_detail?: string | null
          relationship_type: string
          requester_consented?: boolean
          requester_id: string
          status?: string
        }
        Update: {
          analysis_result?: Json | null
          analyzed_at?: string | null
          consent_token?: string
          consented_at?: string | null
          created_at?: string
          id?: string
          partner_consented?: boolean
          partner_email?: string
          partner_id?: string | null
          relationship_detail?: string | null
          relationship_type?: string
          requester_consented?: boolean
          requester_id?: string
          status?: string
        }
        Relationships: []
      }
      funnel_events: {
        Row: {
          color_theme: string
          created_at: string
          elapsed_ms: number | null
          event_type: string
          font_theme: string
          id: string
          layout: string
          lead_variant: string
          page: string | null
          session_id: string
          step: number | null
          total_steps: number | null
        }
        Insert: {
          color_theme?: string
          created_at?: string
          elapsed_ms?: number | null
          event_type: string
          font_theme?: string
          id?: string
          layout?: string
          lead_variant?: string
          page?: string | null
          session_id: string
          step?: number | null
          total_steps?: number | null
        }
        Update: {
          color_theme?: string
          created_at?: string
          elapsed_ms?: number | null
          event_type?: string
          font_theme?: string
          id?: string
          layout?: string
          lead_variant?: string
          page?: string | null
          session_id?: string
          step?: number | null
          total_steps?: number | null
        }
        Relationships: []
      }
      preference_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          page: string | null
          session_id: string
          value: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          page?: string | null
          session_id: string
          value: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          page?: string | null
          session_id?: string
          value?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
          user_id?: string
        }
        Relationships: []
      }
      quiz_results: {
        Row: {
          answers: Json
          created_at: string
          demographic_data: Json | null
          id: string
          scores: Json
          test_type: string
          user_id: string
        }
        Insert: {
          answers: Json
          created_at?: string
          demographic_data?: Json | null
          id?: string
          scores: Json
          test_type?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          demographic_data?: Json | null
          id?: string
          scores?: Json
          test_type?: string
          user_id?: string
        }
        Relationships: []
      }
      shared_invites: {
        Row: {
          created_at: string
          guest_email: string | null
          guest_name: string | null
          guest_user_id: string | null
          id: string
          invite_code: string
          inviter_id: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          guest_user_id?: string | null
          id?: string
          invite_code?: string
          inviter_id: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          guest_user_id?: string | null
          id?: string
          invite_code?: string
          inviter_id?: string
          used_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
