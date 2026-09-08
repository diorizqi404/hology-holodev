/**
 * RembukTani Database Types
 * Auto-generated from schema migration
 */

// ===================================
// 1. PROFILES
// ===================================
export interface Profile {
  id: string; // UUID
  user_id: string; // UUID (FK to auth.users)
  display_name: string;
  role: 'farmer' | 'reviewer';
  avatar_url?: string;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export type CreateProfileInput = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProfileInput = Partial<Omit<Profile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

// ===================================
// 2. LANDS
// ===================================
export interface Land {
  id: string; // UUID
  owner_id: string; // UUID (FK to profiles)
  name: string;
  description?: string;
  latitude: number; // DECIMAL(10, 8)
  longitude: number; // DECIMAL(11, 8)
  boundary_polygon?: [number, number][];
  province?: string;
  regency?: string;
  district?: string;
  village?: string;
  adm4_code?: string;
  location_source?: string;
  location_resolved_at?: string; // ISO timestamp
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  archived_at?: string; // ISO timestamp
}

export type CreateLandInput = Omit<Land, 'id' | 'created_at' | 'updated_at' | 'location_resolved_at'>;
export type UpdateLandInput = Partial<Omit<Land, 'id' | 'owner_id' | 'created_at' | 'updated_at'>>;

// ===================================
// 3. CROP_CONTEXTS
// ===================================
export type GrowthStage = 'vegetative' | 'flowering' | 'ripening' | 'unknown';

export interface CropContext {
  id: string; // UUID
  land_id: string; // UUID (FK to lands)
  crop_name: string;
  variety_name?: string;
  growth_stage: GrowthStage;
  planting_date?: string; // DATE format YYYY-MM-DD
  is_active: boolean;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export type CreateCropContextInput = Omit<CropContext, 'id' | 'created_at' | 'updated_at'>;
export type UpdateCropContextInput = Partial<Omit<CropContext, 'id' | 'land_id' | 'created_at' | 'updated_at'>>;

// ===================================
// 4. DECISION_CASES
// ===================================
export type DecisionCaseStatus = 
  | 'draft' 
  | 'collecting_evidence' 
  | 'assessed' 
  | 'review_pending' 
  | 'ready_for_decision' 
  | 'decided';

export interface DecisionCase {
  id: string; // UUID
  land_id: string; // UUID (FK to lands)
  crop_context_id: string; // UUID (FK to crop_contexts)
  created_by: string; // UUID (FK to profiles)
  decision_type: string;
  selected_action_option_id?: string;
  status: DecisionCaseStatus;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  closed_at?: string; // ISO timestamp
}

export type CreateDecisionCaseInput = Omit<DecisionCase, 'id' | 'created_at' | 'updated_at' | 'closed_at'>;
export type UpdateDecisionCaseInput = Partial<Omit<DecisionCase, 'id' | 'land_id' | 'crop_context_id' | 'created_by' | 'created_at' | 'updated_at'>>;

// ===================================
// 5. EXTERNAL_SOURCE_CACHE
// ===================================
export type ExternalSourceStatus = 'success' | 'failed';

export interface ExternalSourceCache {
  id: string; // UUID
  source_name: string;
  request_key: string;
  adm4_code?: string;
  raw_payload: Record<string, any>;
  observed_at?: string; // ISO timestamp
  fetched_at: string; // ISO timestamp
  expires_at?: string; // ISO timestamp
  status: ExternalSourceStatus;
  created_at: string; // ISO timestamp
}

export type CreateExternalSourceCacheInput = Omit<ExternalSourceCache, 'id' | 'created_at' | 'fetched_at'>;

// ===================================
// 6. DECISION_CASE_EVIDENCE
// ===================================
export type EvidenceType = 'bmkg_forecast' | 'field_pulse' | 'crop_context' | 'external' | 'user_input';
export type FreshnessStatus = 'fresh' | 'stale' | 'expired';
export type QualityStatus = 'high' | 'medium' | 'low' | 'uncertain';

export interface DecisionCaseEvidence {
  id: string; // UUID
  decision_case_id: string; // UUID (FK to decision_cases)
  type: EvidenceType;
  source?: string;
  payload: Record<string, any>;
  observed_at?: string; // ISO timestamp
  collected_at: string; // ISO timestamp
  freshness_status?: FreshnessStatus;
  quality_status?: QualityStatus;
  is_mock: boolean;
  created_at: string; // ISO timestamp
}

export type CreateDecisionCaseEvidenceInput = Omit<DecisionCaseEvidence, 'id' | 'created_at' | 'collected_at'>;

// ===================================
// 7. ASSESSMENTS
// ===================================
export type AssessmentStatus = 'draft' | 'active' | 'superseded' | 'archived';
export type BasisStrength = 'high' | 'medium' | 'low' | 'insufficient';

export interface Assessment {
  id: string; // UUID
  decision_case_id: string; // UUID (FK to decision_cases)
  version: number;
  status: AssessmentStatus;
  summary: string;
  basis_strength?: BasisStrength;
  factors?: string[];
  missing_evidence?: string[];
  limitations?: string[];
  rule_version?: string;
  created_at: string; // ISO timestamp
}

export type CreateAssessmentInput = Omit<Assessment, 'id' | 'created_at'>;

// ===================================
// 8. ACTION_OPTIONS
// ===================================
export interface ActionOption {
  id: string; // UUID
  assessment_id: string; // UUID (FK to assessments)
  title: string;
  description?: string;
  rationale?: string;
  display_order: number;
  created_at: string; // ISO timestamp
}

export type CreateActionOptionInput = Omit<ActionOption, 'id' | 'created_at'>;

// ===================================
// 9. TRUSTED_REVIEWERS
// ===================================
export interface TrustedReviewer {
  id: string; // UUID
  owner_id: string; // UUID (FK to profiles)
  name: string;
  role: string;
  contact?: string;
  created_at: string; // ISO timestamp
}

export type CreateTrustedReviewerInput = Omit<TrustedReviewer, 'id' | 'created_at'>;

// ===================================
// 10. TRUSTED_REVIEWS
// ===================================
export type TrustedReviewStatus = 'approve' | 'modify' | 'reject';

export interface TrustedReview {
  id: string; // UUID
  decision_case_id: string; // UUID (FK to decision_cases)
  assessment_id?: string; // UUID (FK to assessments)
  reviewer_id: string; // UUID (FK to profiles)
  status: TrustedReviewStatus;
  comment?: string;
  created_at: string; // ISO timestamp
  responded_at?: string; // ISO timestamp
}

export type CreateTrustedReviewInput = Omit<TrustedReview, 'id' | 'created_at' | 'responded_at'>;

// ===================================
// 11. DECISION_RECORDS
// ===================================
export type DecisionType = 'selected_option' | 'custom' | 'deferred';

export interface DecisionRecord {
  id: string; // UUID
  decision_case_id: string; // UUID (FK to decision_cases, UNIQUE)
  decided_by: string; // UUID (FK to profiles)
  assessment_id: string; // UUID (FK to assessments)
  selected_action_option_id?: string; // UUID (FK to action_options)
  decision_type: DecisionType;
  decision_text: string;
  reason?: string;
  authority?: 'human';
  is_mock?: boolean;
  supersedes_record_id?: string;
  assessment_snapshot?: Record<string, any>;
  evidence_snapshot?: Record<string, any>;
  created_at: string; // ISO timestamp
}

export type CreateDecisionRecordInput = Omit<DecisionRecord, 'id' | 'created_at'>;

// ===================================
// 12. DECISION_RECORD_EVIDENCE
// ===================================
export interface DecisionRecordEvidenceLink {
  decision_record_id: string; // UUID
  evidence_id: string; // UUID
}

// ===================================
// 13. DECISION_BRIEFS
// ===================================
export interface DecisionBrief {
  id: string; // UUID
  decision_record_id: string; // UUID (FK to decision_records, UNIQUE)
  template_version?: string;
  content: string;
  created_at: string; // ISO timestamp
}

export type CreateDecisionBriefInput = Omit<DecisionBrief, 'id' | 'created_at'>;

// ===================================
// DOMAIN AGGREGATES (composed entities)
// ===================================

export interface LandWithCropAndDecisions {
  land: Land;
  current_crop_context?: CropContext;
  recent_decision_cases: DecisionCase[];
}

export interface DecisionCaseWithEvidence {
  decision_case: DecisionCase;
  evidence: DecisionCaseEvidence[];
  assessment?: Assessment;
  action_options: ActionOption[];
  decision_record?: DecisionRecord;
  decision_brief?: DecisionBrief;
  trusted_review?: TrustedReview;
}
