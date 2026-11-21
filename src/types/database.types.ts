export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      bookmarks: {
        Row: {
          id: string;
          saved_at: string;
          spot_id: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          id?: string;
          saved_at?: string;
          spot_id: string;
          user_id: string;
        };
        Update: {
          id?: string;
          saved_at?: string;
          spot_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookmarks_spot_id_fkey";
            columns: ["spot_id"];
            isOneToOne: false;
            referencedRelation: "spots";
            referencedColumns: ["id"];
          },
        ];
      };
      conversation_participants: {
        Row: {
          conversation_id: string;
          joined_at: string;
          last_read_at: string | null;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          conversation_id: string;
          joined_at?: string;
          last_read_at?: string | null;
          user_id: string;
        };
        Update: {
          conversation_id?: string;
          joined_at?: string;
          last_read_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          created_at: string;
          created_by: string | null;
          dm_key: string | null;
          id: string;
          last_message_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          created_by?: string | null;
          dm_key?: string | null;
          id?: string;
          last_message_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          dm_key?: string | null;
          id?: string;
          last_message_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          body: string | null;
          conversation_id: string;
          created_at: string;
          id: string;
          sender_id: string;
          shared_spot_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          body?: string | null;
          conversation_id: string;
          created_at?: string;
          id?: string;
          sender_id: string;
          shared_spot_id?: string | null;
        };
        Update: {
          body?: string | null;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          sender_id?: string;
          shared_spot_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_shared_spot_id_fkey";
            columns: ["shared_spot_id"];
            isOneToOne: false;
            referencedRelation: "spots";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          age: number | null;
          avatar_url: string | null;
          created_at: string;
          discipline: string | null;
          filmer: boolean;
          first_name: string | null;
          home_city: string;
          id: string;
          last_name: string | null;
          stance: string | null;
          updated_at: string;
          username: string;
          years_skating: number | null;
        };
        ComputedFields: never;
        Insert: {
          age?: number | null;
          avatar_url?: string | null;
          created_at?: string;
          discipline?: string | null;
          filmer?: boolean;
          first_name?: string | null;
          home_city?: string;
          id: string;
          last_name?: string | null;
          stance?: string | null;
          updated_at?: string;
          username: string;
          years_skating?: number | null;
        };
        Update: {
          age?: number | null;
          avatar_url?: string | null;
          created_at?: string;
          discipline?: string | null;
          filmer?: boolean;
          first_name?: string | null;
          home_city?: string;
          id?: string;
          last_name?: string | null;
          stance?: string | null;
          updated_at?: string;
          username?: string;
          years_skating?: number | null;
        };
        Relationships: [];
      };
      spots: {
        Row: {
          city: string;
          created_at: string;
          description: string | null;
          difficulty: Database["public"]["Enums"]["difficulty"];
          features: Database["public"]["Enums"]["feature"][];
          id: string;
          is_public: boolean;
          is_skateable: boolean;
          lat: number;
          lat_lng: unknown;
          lng: number;
          name: string;
          owner_id: string | null;
          photo: string | null;
          rating: number;
          spot_type: Database["public"]["Enums"]["spot_type"];
          status: Database["public"]["Enums"]["spot_status"];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          city?: string;
          created_at?: string;
          description?: string | null;
          difficulty: Database["public"]["Enums"]["difficulty"];
          features?: Database["public"]["Enums"]["feature"][];
          id?: string;
          is_public?: boolean;
          is_skateable?: boolean;
          lat: number;
          lat_lng?: never;
          lng: number;
          name: string;
          owner_id?: string | null;
          photo?: string | null;
          rating?: number;
          spot_type: Database["public"]["Enums"]["spot_type"];
          status?: Database["public"]["Enums"]["spot_status"];
          updated_at?: string;
        };
        Update: {
          city?: string;
          created_at?: string;
          description?: string | null;
          difficulty?: Database["public"]["Enums"]["difficulty"];
          features?: Database["public"]["Enums"]["feature"][];
          id?: string;
          is_public?: boolean;
          is_skateable?: boolean;
          lat?: number;
          lat_lng?: never;
          lng?: number;
          name?: string;
          owner_id?: string | null;
          photo?: string | null;
          rating?: number;
          spot_type?: Database["public"]["Enums"]["spot_type"];
          status?: Database["public"]["Enums"]["spot_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_read_spot_photo: { Args: { p_object_name: string }; Returns: boolean };
      is_conversation_participant: {
        Args: { p_conversation_id: string; p_user_id: string };
        Returns: boolean;
      };
      mark_conversation_read: { Args: { p_conversation_id: string }; Returns: undefined };
      my_conversations: {
        Args: Record<PropertyKey, never>;
        Returns: {
          conversation_id: string;
          last_message_at: string;
          last_message_body: string;
          last_message_shared_spot_id: string;
          last_message_shared_spot_name: string;
          other_avatar_url: string;
          other_user_id: string;
          other_username: string;
          unread_count: number;
        }[];
      };
      spot_owner_id: { Args: { p_spot_id: string }; Returns: string };
      spots_nearby: {
        Args: { p_lat: number; p_limit?: number; p_lng: number; p_radius_meters?: number };
        Returns: {
          city: string;
          created_at: string;
          description: string;
          difficulty: Database["public"]["Enums"]["difficulty"];
          distance_meters: number;
          features: Database["public"]["Enums"]["feature"][];
          id: string;
          is_public: boolean;
          is_skateable: boolean;
          lat: number;
          lng: number;
          name: string;
          owner_id: string;
          photo: string;
          rating: number;
          spot_type: Database["public"]["Enums"]["spot_type"];
          status: Database["public"]["Enums"]["spot_status"];
        }[];
      };
      start_conversation: { Args: { p_other_user_id: string }; Returns: string };
    };
    Enums: {
      difficulty: "beginner" | "intermediate" | "advanced" | "pro";
      feature: "ledge" | "rail" | "plaza" | "stairs" | "skatepark";
      spot_status: "active" | "pending" | "closed";
      spot_type: "park" | "street" | "diy";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      difficulty: ["beginner", "intermediate", "advanced", "pro"],
      feature: ["ledge", "rail", "plaza", "stairs", "skatepark"],
      spot_status: ["active", "pending", "closed"],
      spot_type: ["park", "street", "diy"],
    },
  },
} as const;
