export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string
          role: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name: string
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      lands: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          latitude: number
          longitude: number
          boundary_polygon: [number, number][] | null
          province: string | null
          regency: string | null
          district: string | null
          village: string | null
          adm4_code: string | null
          location_source: string | null
          location_resolved_at: string | null
          created_at: string
          updated_at: string
          archived_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          latitude: number
          longitude: number
          province?: string | null
          regency?: string | null
          district?: string | null
          village?: string | null
          adm4_code?: string | null
          location_source?: string | null
          location_resolved_at?: string | null
          created_at?: string
          updated_at?: string
          archived_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          latitude?: number
          longitude?: number
          boundary_polygon?: [number, number][] | null
          province?: string | null
          regency?: string | null
          district?: string | null
          village?: string | null
          adm4_code?: string | null
          location_source?: string | null
          location_resolved_at?: string | null
          created_at?: string
          updated_at?: string
          archived_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_lands_owner"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      crop_contexts: {
        Row: {
          id: string
          land_id: string
          crop_name: string
          variety_name: string | null
          growth_stage: string
          planting_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          land_id: string
          crop_name: string
          variety_name?: string | null
          growth_stage?: string
          planting_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          land_id?: string
          crop_name?: string
          variety_name?: string | null
          growth_stage?: string
          planting_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_crop_contexts_land"
            columns: ["land_id"]
            isOneToOne: false
            referencedRelation: "lands"
            referencedColumns: ["id"]
          }
        ]
      }
      decision_cases: {
        Row: {
          id: string
          land_id: string
          crop_context_id: string
          created_by: string
          decision_type: string
          selected_action_option_id: string | null
          status: string
          created_at: string
          updated_at: string
          closed_at: string | null
        }
        Insert: {
          id?: string
          land_id: string
          crop_context_id: string
          created_by: string
          decision_type: string
          selected_action_option_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          closed_at?: string | null
        }
        Update: {
          id?: string
          land_id?: string
          crop_context_id?: string
          created_by?: string
          decision_type?: string
          selected_action_option_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          closed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_decision_cases_land"
            columns: ["land_id"]
            isOneToOne: false
            referencedRelation: "lands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_decision_cases_crop_context"
            columns: ["crop_context_id"]
            isOneToOne: false
            referencedRelation: "crop_contexts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_decision_cases_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      external_source_cache: {
        Row: {
          id: string
          source_name: string
          request_key: string
          request_uri: string | null
          adm4_code: string | null
          raw_payload: Json
          observed_at: string | null
          fetched_at: string
          expires_at: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          source_name: string
          request_key: string
          request_uri?: string | null
          adm4_code?: string | null
          raw_payload: Json
          observed_at?: string | null
          fetched_at?: string
          expires_at?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          source_name?: string
          request_key?: string
          request_uri?: string | null
          adm4_code?: string | null
          raw_payload?: Json
          observed_at?: string | null
          fetched_at?: string
          expires_at?: string | null
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      decision_case_evidence: {
        Row: {
          id: string
          decision_case_id: string
          type: string
          source: string | null
          payload: Json
          observed_at: string | null
          collected_at: string
          freshness_status: string | null
          quality_status: string | null
          is_mock: boolean
          created_at: string
        }
        Insert: {
          id?: string
          decision_case_id: string
          type: string
          source?: string | null
          payload: Json
          observed_at?: string | null
          collected_at?: string
          freshness_status?: string | null
          quality_status?: string | null
          is_mock?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          decision_case_id?: string
          type?: string
          source?: string | null
          payload?: Json
          observed_at?: string | null
          collected_at?: string
          freshness_status?: string | null
          quality_status?: string | null
          is_mock?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_evidence_decision_case"
            columns: ["decision_case_id"]
            isOneToOne: false
            referencedRelation: "decision_cases"
            referencedColumns: ["id"]
          }
        ]
      }
      assessments: {
        Row: {
          id: string
          decision_case_id: string
          version: number
          status: string
          summary: string
          basis_strength: string | null
          factors: Json | null
          missing_evidence: Json | null
          limitations: Json | null
          rule_version: string | null
          created_at: string
        }
        Insert: {
          id?: string
          decision_case_id: string
          version?: number
          status?: string
          summary: string
          basis_strength?: string | null
          factors?: Json | null
          missing_evidence?: Json | null
          limitations?: Json | null
          rule_version?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          decision_case_id?: string
          version?: number
          status?: string
          summary?: string
          basis_strength?: string | null
          factors?: Json | null
          missing_evidence?: Json | null
          limitations?: Json | null
          rule_version?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_assessments_decision_case"
            columns: ["decision_case_id"]
            isOneToOne: false
            referencedRelation: "decision_cases"
            referencedColumns: ["id"]
          }
        ]
      }
      action_options: {
        Row: {
          id: string
          assessment_id: string
          title: string
          description: string | null
          rationale: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          title: string
          description?: string | null
          rationale?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          title?: string
          description?: string | null
          rationale?: string | null
          display_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_action_options_assessment"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          }
        ]
      }
      trusted_reviewers: {
        Row: {
          id: string
          owner_id: string
          name: string
          role: string
          contact: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          role: string
          contact?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          role?: string
          contact?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_trusted_reviewers_owner"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      trusted_reviews: {
        Row: {
          id: string
          decision_case_id: string
          assessment_id: string | null
          reviewer_id: string
          status: string
          comment: string | null
          created_at: string
          responded_at: string | null
        }
        Insert: {
          id?: string
          decision_case_id: string
          assessment_id?: string | null
          reviewer_id: string
          status: string
          comment?: string | null
          created_at?: string
          responded_at?: string | null
        }
        Update: {
          id?: string
          decision_case_id?: string
          assessment_id?: string | null
          reviewer_id?: string
          status?: string
          comment?: string | null
          created_at?: string
          responded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_trusted_reviews_decision_case"
            columns: ["decision_case_id"]
            isOneToOne: false
            referencedRelation: "decision_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trusted_reviews_assessment"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trusted_reviews_reviewer"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      decision_records: {
        Row: {
          id: string
          decision_case_id: string
          decided_by: string
          assessment_id: string
          selected_action_option_id: string | null
          decision_type: string
          decision_text: string
          reason: string | null
          authority: string
          is_mock: boolean
          supersedes_record_id: string | null
          assessment_snapshot: Json | null
          evidence_snapshot: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          decision_case_id: string
          decided_by: string
          assessment_id: string
          selected_action_option_id?: string | null
          decision_type: string
          decision_text: string
          reason?: string | null
          authority?: string
          is_mock?: boolean
          supersedes_record_id?: string | null
          assessment_snapshot?: Json | null
          evidence_snapshot?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          decision_case_id?: string
          decided_by?: string
          assessment_id?: string
          selected_action_option_id?: string | null
          decision_type?: string
          decision_text?: string
          reason?: string | null
          authority?: string
          is_mock?: boolean
          supersedes_record_id?: string | null
          assessment_snapshot?: Json | null
          evidence_snapshot?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_decision_records_decision_case"
            columns: ["decision_case_id"]
            isOneToOne: true
            referencedRelation: "decision_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_decision_records_decided_by"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_decision_records_assessment"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_decision_records_action_option"
            columns: ["selected_action_option_id"]
            isOneToOne: false
            referencedRelation: "action_options"
            referencedColumns: ["id"]
          }
        ]
      }
      assessment_evidence: {
        Row: {
          assessment_id: string
          evidence_id: string
          created_at: string | null
        }
        Insert: {
          assessment_id: string
          evidence_id: string
          created_at?: string | null
        }
        Update: {
          assessment_id?: string
          evidence_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_assessment_evidence_assessment"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assessment_evidence_evidence"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "decision_case_evidence"
            referencedColumns: ["id"]
          }
        ]
      }
      decision_record_evidence: {
        Row: {
          decision_record_id: string
          evidence_id: string
        }
        Insert: {
          decision_record_id: string
          evidence_id: string
        }
        Update: {
          decision_record_id?: string
          evidence_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_dre_decision_record"
            columns: ["decision_record_id"]
            isOneToOne: false
            referencedRelation: "decision_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_dre_evidence"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "decision_case_evidence"
            referencedColumns: ["id"]
          }
        ]
      }
      decision_briefs: {
        Row: {
          id: string
          decision_record_id: string
          template_version: string | null
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          decision_record_id: string
          template_version?: string | null
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          decision_record_id?: string
          template_version?: string | null
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_decision_briefs_decision_record"
            columns: ["decision_record_id"]
            isOneToOne: true
            referencedRelation: "decision_records"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {}
    Functions: {
      update_updated_at_column: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database }
    ? PublicTableNameOrOptions
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName & keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]] & {
      Schema: PublicTableNameOrOptions["schema"]
    }
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] & {
        Schema: "public"
      }
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database }
    ? PublicTableNameOrOptions
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName & keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database }
    ? PublicTableNameOrOptions
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName & keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

type PublicTablesInsert = PublicSchema["Tables"][keyof PublicSchema["Tables"]] extends {
  Insert: infer I
}
  ? I
  : never

type PublicTablesUpdate = PublicSchema["Tables"][keyof PublicSchema["Tables"]] extends {
  Update: infer U
}
  ? U
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database }
    ? PublicEnumNameOrOptions
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName & keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
