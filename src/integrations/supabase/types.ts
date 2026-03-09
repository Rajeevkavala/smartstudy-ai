export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          id: string
          code: string
          name: string
          description: string
          icon: string
          xp_reward: number
          rarity: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description: string
          icon: string
          xp_reward?: number
          rarity?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string
          icon?: string
          xp_reward?: number
          rarity?: string
        }
        Relationships: []
      }
      battle_rooms: {
        Row: {
          id: string
          host_id: string
          opponent_id: string | null
          document_id: string
          status: string
          mode: string
          questions: Json | null
          host_score: number
          opponent_score: number
          winner_id: string | null
          started_at: string | null
          ended_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          host_id: string
          opponent_id?: string | null
          document_id: string
          status?: string
          mode?: string
          questions?: Json | null
          host_score?: number
          opponent_score?: number
          winner_id?: string | null
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          host_id?: string
          opponent_id?: string | null
          document_id?: string
          status?: string
          mode?: string
          questions?: Json | null
          host_score?: number
          opponent_score?: number
          winner_id?: string | null
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_rooms_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      concept_relationships: {
        Row: {
          id: string
          concept_a: string
          concept_b: string
          relationship_type: string | null
          strength: number
          created_at: string
        }
        Insert: {
          id?: string
          concept_a: string
          concept_b: string
          relationship_type?: string | null
          strength?: number
          created_at?: string
        }
        Update: {
          id?: string
          concept_a?: string
          concept_b?: string
          relationship_type?: string | null
          strength?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "concept_relationships_concept_a_fkey"
            columns: ["concept_a"]
            isOneToOne: false
            referencedRelation: "concepts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concept_relationships_concept_b_fkey"
            columns: ["concept_b"]
            isOneToOne: false
            referencedRelation: "concepts"
            referencedColumns: ["id"]
          },
        ]
      }
      concepts: {
        Row: {
          id: string
          user_id: string
          document_id: string
          name: string
          definition: string | null
          category: string | null
          importance_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          document_id: string
          name: string
          definition?: string | null
          category?: string | null
          importance_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          document_id?: string
          name?: string
          definition?: string | null
          category?: string | null
          importance_score?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "concepts_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          document_id: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_pages: {
        Row: {
          id: string
          document_id: string
          page_number: number
          content: string
          word_count: number
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          page_number: number
          content: string
          word_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          page_number?: number
          content?: string
          word_count?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_pages_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_tag_links: {
        Row: {
          document_id: string
          tag_id: string
        }
        Insert: {
          document_id: string
          tag_id: string
        }
        Update: {
          document_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_tag_links_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_tag_links_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "document_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      document_tags: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          extracted_text: string | null
          file_path: string
          file_size: number | null
          folder_id: string | null
          id: string
          page_count: number | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          extracted_text?: string | null
          file_path: string
          file_size?: number | null
          folder_id?: string | null
          id?: string
          page_count?: number | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          extracted_text?: string | null
          file_path?: string
          file_size?: number | null
          folder_id?: string | null
          id?: string
          page_count?: number | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      elo_ratings: {
        Row: {
          id: string
          user_id: string
          rating: number
          wins: number
          losses: number
          streak: number
          best_streak: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          rating?: number
          wins?: number
          losses?: number
          streak?: number
          best_streak?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          rating?: number
          wins?: number
          losses?: number
          streak?: number
          best_streak?: number
          updated_at?: string
        }
        Relationships: []
      }
      exam_sessions: {
        Row: {
          completed_at: string | null
          correct_answers: number | null
          document_id: string
          id: string
          mode: string
          started_at: string
          time_spent_seconds: number | null
          total_questions: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          correct_answers?: number | null
          document_id: string
          id?: string
          mode: string
          started_at?: string
          time_spent_seconds?: number | null
          total_questions?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          correct_answers?: number | null
          document_id?: string
          id?: string
          mode?: string
          started_at?: string
          time_spent_seconds?: number | null
          total_questions?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_sessions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          id: string
          user_id: string
          name: string
          subject: string | null
          exam_date: string
          difficulty: number
          confidence: number
          actual_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          subject?: string | null
          exam_date: string
          difficulty?: number
          confidence?: number
          actual_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          subject?: string | null
          exam_date?: string
          difficulty?: number
          confidence?: number
          actual_score?: number | null
          created_at?: string
        }
        Relationships: []
      }
      flashcard_reviews: {
        Row: {
          id: string
          flashcard_id: string
          user_id: string
          quality: number
          time_taken_ms: number | null
          reviewed_at: string
        }
        Insert: {
          id?: string
          flashcard_id: string
          user_id: string
          quality: number
          time_taken_ms?: number | null
          reviewed_at?: string
        }
        Update: {
          id?: string
          flashcard_id?: string
          user_id?: string
          quality?: number
          time_taken_ms?: number | null
          reviewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_reviews_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          id: string
          user_id: string
          document_id: string | null
          front: string
          back: string
          tags: string[] | null
          ease_factor: number
          interval_days: number
          repetitions: number
          next_review_date: string
          last_reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          document_id?: string | null
          front: string
          back: string
          tags?: string[] | null
          ease_factor?: number
          interval_days?: number
          repetitions?: number
          next_review_date?: string
          last_reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          document_id?: string | null
          front?: string
          back?: string
          tags?: string[] | null
          ease_factor?: number
          interval_days?: number
          repetitions?: number
          next_review_date?: string
          last_reviewed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          parent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          parent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          parent_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          mark_level: string | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          mark_level?: string | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          mark_level?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      micro_lessons: {
        Row: {
          id: string
          weakness_id: string
          title: string
          content: string
          lesson_type: string | null
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          weakness_id: string
          title: string
          content: string
          lesson_type?: string | null
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          weakness_id?: string
          title?: string
          content?: string
          lesson_type?: string | null
          completed?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "micro_lessons_weakness_id_fkey"
            columns: ["weakness_id"]
            isOneToOne: false
            referencedRelation: "weakness_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      score_predictions: {
        Row: {
          id: string
          user_id: string
          document_id: string | null
          predicted_min: number | null
          predicted_max: number | null
          confidence: number | null
          factors: Json | null
          actual_score: number | null
          predicted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          document_id?: string | null
          predicted_min?: number | null
          predicted_max?: number | null
          confidence?: number | null
          factors?: Json | null
          actual_score?: number | null
          predicted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          document_id?: string | null
          predicted_min?: number | null
          predicted_max?: number | null
          confidence?: number | null
          factors?: Json | null
          actual_score?: number | null
          predicted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "score_predictions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plan_items: {
        Row: {
          id: string
          plan_id: string
          document_id: string | null
          title: string
          description: string | null
          scheduled_date: string
          scheduled_start_time: string | null
          duration_minutes: number
          priority: string
          completed: boolean
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          document_id?: string | null
          title: string
          description?: string | null
          scheduled_date: string
          scheduled_start_time?: string | null
          duration_minutes?: number
          priority?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          document_id?: string | null
          title?: string
          description?: string | null
          scheduled_date?: string
          scheduled_start_time?: string | null
          duration_minutes?: number
          priority?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_plan_items_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "study_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_plan_items_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plans: {
        Row: {
          id: string
          user_id: string
          name: string
          start_date: string
          end_date: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          start_date: string
          end_date: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          start_date?: string
          end_date?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: string
          status: string
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: string
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: string
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          feature: string
          count: number
          period_start: string
          period_end: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          feature: string
          count?: number
          period_start: string
          period_end: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          feature?: string
          count?: number
          period_start?: string
          period_end?: string
          created_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          user_id: string
          achievement_id: string
          earned_at: string
        }
        Insert: {
          user_id: string
          achievement_id: string
          earned_at?: string
        }
        Update: {
          user_id?: string
          achievement_id?: string
          earned_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gamification: {
        Row: {
          user_id: string
          xp: number
          level: number
          current_streak: number
          longest_streak: number
          last_active_date: string | null
          total_study_minutes: number
          updated_at: string
        }
        Insert: {
          user_id: string
          xp?: number
          level?: number
          current_streak?: number
          longest_streak?: number
          last_active_date?: string | null
          total_study_minutes?: number
          updated_at?: string
        }
        Update: {
          user_id?: string
          xp?: number
          level?: number
          current_streak?: number
          longest_streak?: number
          last_active_date?: string | null
          total_study_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      weakness_profiles: {
        Row: {
          id: string
          user_id: string
          document_id: string | null
          topic: string
          subtopic: string | null
          confidence_score: number
          times_tested: number
          times_correct: number
          last_tested_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          document_id?: string | null
          topic: string
          subtopic?: string | null
          confidence_score?: number
          times_tested?: number
          times_correct?: number
          last_tested_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          document_id?: string | null
          topic?: string
          subtopic?: string | null
          confidence_score?: number
          times_tested?: number
          times_correct?: number
          last_tested_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "weakness_profiles_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
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
