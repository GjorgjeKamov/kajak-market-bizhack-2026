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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_invites: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      buyer_requests: {
        Row: {
          buyer_id: string
          created_at: string
          currency: string | null
          delivery_location: string | null
          delivery_period: string | null
          id: string
          product: string
          quantity: number | null
          recurring: boolean | null
          status: string
          target_price: number | null
          unit: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string
          currency?: string | null
          delivery_location?: string | null
          delivery_period?: string | null
          id?: string
          product: string
          quantity?: number | null
          recurring?: boolean | null
          status?: string
          target_price?: number | null
          unit?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string
          currency?: string | null
          delivery_location?: string | null
          delivery_period?: string | null
          id?: string
          product?: string
          quantity?: number | null
          recurring?: boolean | null
          status?: string
          target_price?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_requests_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      buyers: {
        Row: {
          business_name: string | null
          buyer_type: string | null
          completed_at: string | null
          contact_share_consent: boolean
          country: string
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_test: boolean
          language: string | null
          last_activity_at: string
          location: string | null
          missing_fields: string[]
          phone: string | null
          registration_status: string
          session_hash: string | null
        }
        Insert: {
          business_name?: string | null
          buyer_type?: string | null
          completed_at?: string | null
          contact_share_consent?: boolean
          country?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_test?: boolean
          language?: string | null
          last_activity_at?: string
          location?: string | null
          missing_fields?: string[]
          phone?: string | null
          registration_status?: string
          session_hash?: string | null
        }
        Update: {
          business_name?: string | null
          buyer_type?: string | null
          completed_at?: string | null
          contact_share_consent?: boolean
          country?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_test?: boolean
          language?: string | null
          last_activity_at?: string
          location?: string | null
          missing_fields?: string[]
          phone?: string | null
          registration_status?: string
          session_hash?: string | null
        }
        Relationships: []
      }
      consent_records: {
        Row: {
          consent_type: string
          created_at: string
          granted: boolean
          id: string
          policy_version: string
          subject_id: string
          subject_type: string
          withdrawn_at: string | null
          wording: string
        }
        Insert: {
          consent_type: string
          created_at?: string
          granted: boolean
          id?: string
          policy_version: string
          subject_id: string
          subject_type: string
          withdrawn_at?: string | null
          wording: string
        }
        Update: {
          consent_type?: string
          created_at?: string
          granted?: boolean
          id?: string
          policy_version?: string
          subject_id?: string
          subject_type?: string
          withdrawn_at?: string | null
          wording?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          buyer_id: string | null
          created_at: string
          id: string
          message: string
          source: string | null
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string
          id?: string
          message: string
          source?: string | null
        }
        Update: {
          buyer_id?: string | null
          created_at?: string
          id?: string
          message?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_translations: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          content: Json
          created_at: string
          doc: string
          id: string
          lang: string
          status: string
          updated_at: string
          version: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          content: Json
          created_at?: string
          doc: string
          id?: string
          lang: string
          status?: string
          updated_at?: string
          version: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          content?: Json
          created_at?: string
          doc?: string
          id?: string
          lang?: string
          status?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      match_events: {
        Row: {
          buyer_request_id: string | null
          created_at: string
          id: string
          producer_id: string | null
          product_id: string | null
          score: number | null
        }
        Insert: {
          buyer_request_id?: string | null
          created_at?: string
          id?: string
          producer_id?: string | null
          product_id?: string | null
          score?: number | null
        }
        Update: {
          buyer_request_id?: string | null
          created_at?: string
          id?: string
          producer_id?: string | null
          product_id?: string | null
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "match_events_buyer_request_id_fkey"
            columns: ["buyer_request_id"]
            isOneToOne: false
            referencedRelation: "buyer_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_requests: {
        Row: {
          created_at: string
          details: string | null
          email: string | null
          id: string
          phone: string | null
          request_type: string
          session_hash: string | null
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          request_type: string
          session_hash?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          request_type?: string
          session_hash?: string | null
          status?: string
        }
        Relationships: []
      }
      producers: {
        Row: {
          buyer_contact_ack: boolean
          completed_at: string | null
          country: string
          created_at: string
          email: string | null
          email_active: boolean | null
          export_capability: string | null
          free_delivery: boolean | null
          free_delivery_areas: string | null
          full_name: string | null
          id: string
          is_test: boolean
          language: string | null
          last_activity_at: string
          location: string | null
          missing_fields: string[]
          paid_delivery_macedonia: boolean | null
          phone: string | null
          phone_public_consent: boolean
          producer_type: string | null
          registration_status: string
          session_hash: string | null
          status: string
          updated_at: string
        }
        Insert: {
          buyer_contact_ack?: boolean
          completed_at?: string | null
          country?: string
          created_at?: string
          email?: string | null
          email_active?: boolean | null
          export_capability?: string | null
          free_delivery?: boolean | null
          free_delivery_areas?: string | null
          full_name?: string | null
          id?: string
          is_test?: boolean
          language?: string | null
          last_activity_at?: string
          location?: string | null
          missing_fields?: string[]
          paid_delivery_macedonia?: boolean | null
          phone?: string | null
          phone_public_consent?: boolean
          producer_type?: string | null
          registration_status?: string
          session_hash?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          buyer_contact_ack?: boolean
          completed_at?: string | null
          country?: string
          created_at?: string
          email?: string | null
          email_active?: boolean | null
          export_capability?: string | null
          free_delivery?: boolean | null
          free_delivery_areas?: string | null
          full_name?: string | null
          id?: string
          is_test?: boolean
          language?: string | null
          last_activity_at?: string
          location?: string | null
          missing_fields?: string[]
          paid_delivery_macedonia?: boolean | null
          phone?: string | null
          phone_public_consent?: boolean
          producer_type?: string | null
          registration_status?: string
          session_hash?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          available_quantity: number | null
          created_at: string
          currency: string | null
          id: string
          name: string
          negotiable: boolean | null
          price: number | null
          price_unit: string | null
          producer_id: string
          production_quantity: number | null
          season: string | null
          unit: string | null
        }
        Insert: {
          available_quantity?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          name: string
          negotiable?: boolean | null
          price?: number | null
          price_unit?: string | null
          producer_id: string
          production_quantity?: number | null
          season?: string | null
          unit?: string | null
        }
        Update: {
          available_quantity?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          name?: string
          negotiable?: boolean | null
          price?: number | null
          price_unit?: string | null
          producer_id?: string
          production_quantity?: number | null
          season?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          count: number
          key: string
          window_start: string
        }
        Insert: {
          count?: number
          key: string
          window_start?: string
        }
        Update: {
          count?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      registration_metrics: {
        Row: {
          created_at: string
          id: string
          is_test: boolean
          mode: string
          seconds: number
          turns: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_test?: boolean
          mode: string
          seconds: number
          turns?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_test?: boolean
          mode?: string
          seconds?: number
          turns?: number
        }
        Relationships: []
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
      aggregate_stats: {
        Row: {
          approved_producers: number | null
          avg_buyer_seconds: number | null
          avg_seller_seconds: number | null
          buyer_requests: number | null
          buyers: number | null
          incomplete_buyers: number | null
          incomplete_producers: number | null
          matches: number | null
          producers: number | null
          products: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      claim_first_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hit_rate_limit: {
        Args: { _key: string; _max: number; _window_seconds: number }
        Returns: boolean
      }
      purge_abandoned_registrations: { Args: never; Returns: number }
    }
    Enums: {
      app_role: "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
    },
  },
} as const
