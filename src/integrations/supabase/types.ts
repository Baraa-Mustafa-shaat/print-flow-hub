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
      customer_rewards: {
        Row: {
          customer_id: string
          granted_at: string | null
          id: string
          notes: string | null
          order_id: string | null
          redeemed_at: string | null
          reward_id: string
          status: string | null
        }
        Insert: {
          customer_id: string
          granted_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          redeemed_at?: string | null
          reward_id: string
          status?: string | null
        }
        Update: {
          customer_id?: string
          granted_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          redeemed_at?: string | null
          reward_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_rewards_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_rewards_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          printed_pages_monthly: number | null
          printed_pages_total: number | null
          reward_points: number | null
          updated_at: string | null
          user_id: string
          visits_count_monthly: number | null
          visits_count_total: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          printed_pages_monthly?: number | null
          printed_pages_total?: number | null
          reward_points?: number | null
          updated_at?: string | null
          user_id: string
          visits_count_monthly?: number | null
          visits_count_total?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          printed_pages_monthly?: number | null
          printed_pages_total?: number | null
          reward_points?: number | null
          updated_at?: string | null
          user_id?: string
          visits_count_monthly?: number | null
          visits_count_total?: number | null
        }
        Relationships: []
      }
      order_files: {
        Row: {
          created_at: string | null
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          order_id: string
          original_name: string
          page_count: number | null
          source_type: string | null
          stored_name: string
        }
        Insert: {
          created_at?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          order_id: string
          original_name: string
          page_count?: number | null
          source_type?: string | null
          stored_name: string
        }
        Update: {
          created_at?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          order_id?: string
          original_name?: string
          page_count?: number | null
          source_type?: string | null
          stored_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_files_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_history: {
        Row: {
          action_type: string
          changed_by: string | null
          created_at: string | null
          description: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          order_id: string
        }
        Insert: {
          action_type: string
          changed_by?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          order_id: string
        }
        Update: {
          action_type?: string
          changed_by?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          branch: string | null
          cover: boolean | null
          created_at: string | null
          curriculum_type: string | null
          details_json: Json | null
          files_count: number | null
          grade: string | null
          id: string
          item_type: string
          order_id: string
          papers_count: number | null
          print_color_mode: string | null
          print_size_mode: string | null
          quantity: number | null
          semester: string | null
          subject: string | null
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          branch?: string | null
          cover?: boolean | null
          created_at?: string | null
          curriculum_type?: string | null
          details_json?: Json | null
          files_count?: number | null
          grade?: string | null
          id?: string
          item_type?: string
          order_id: string
          papers_count?: number | null
          print_color_mode?: string | null
          print_size_mode?: string | null
          quantity?: number | null
          semester?: string | null
          subject?: string | null
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          branch?: string | null
          cover?: boolean | null
          created_at?: string | null
          curriculum_type?: string | null
          details_json?: Json | null
          files_count?: number | null
          grade?: string | null
          id?: string
          item_type?: string
          order_id?: string
          papers_count?: number | null
          print_color_mode?: string | null
          print_size_mode?: string | null
          quantity?: number | null
          semester?: string | null
          subject?: string | null
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          customer_id: string | null
          discount: number | null
          employee_id: string | null
          finished_printing_at: string | null
          id: string
          is_cancelled: boolean | null
          notes: string | null
          order_date: string | null
          order_number: number
          paid_amount: number | null
          payment_method: string | null
          queue_position: number | null
          remaining_amount: number | null
          source_ref: string | null
          source_type: string | null
          started_printing_at: string | null
          status: string
          subtotal: number | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          discount?: number | null
          employee_id?: string | null
          finished_printing_at?: string | null
          id?: string
          is_cancelled?: boolean | null
          notes?: string | null
          order_date?: string | null
          order_number?: number
          paid_amount?: number | null
          payment_method?: string | null
          queue_position?: number | null
          remaining_amount?: number | null
          source_ref?: string | null
          source_type?: string | null
          started_printing_at?: string | null
          status?: string
          subtotal?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          discount?: number | null
          employee_id?: string | null
          finished_printing_at?: string | null
          id?: string
          is_cancelled?: boolean | null
          notes?: string | null
          order_date?: string | null
          order_number?: number
          paid_amount?: number | null
          payment_method?: string | null
          queue_position?: number | null
          remaining_amount?: number | null
          source_ref?: string | null
          source_type?: string | null
          started_printing_at?: string | null
          status?: string
          subtotal?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rewards: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          min_monthly_pages: number | null
          min_monthly_visits: number | null
          min_total_pages: number | null
          min_total_visits: number | null
          reward_mode: string | null
          reward_type: string
          reward_value: number | null
          start_date: string | null
          stock_count: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          min_monthly_pages?: number | null
          min_monthly_visits?: number | null
          min_total_pages?: number | null
          min_total_visits?: number | null
          reward_mode?: string | null
          reward_type?: string
          reward_value?: number | null
          start_date?: string | null
          stock_count?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          min_monthly_pages?: number | null
          min_monthly_visits?: number | null
          min_total_pages?: number | null
          min_total_visits?: number | null
          reward_mode?: string | null
          reward_type?: string
          reward_value?: number | null
          start_date?: string | null
          stock_count?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
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
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "employee" | "customer"
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
      app_role: ["admin", "employee", "customer"],
    },
  },
} as const
