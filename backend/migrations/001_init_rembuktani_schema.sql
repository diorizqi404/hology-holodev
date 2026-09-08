-- RembukTani Database Schema Migration
-- M2 Vertical Slice - Decision Support System
-- Created: 2026-09-04

-- ===================================
-- 1. PROFILES - User profiles linked to auth.users
-- ===================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Foreign key to auth.users (managed by Supabase Auth)
  user_id UUID NOT NULL UNIQUE,
  
  display_name VARCHAR(255) NOT NULL,
  
  -- Roles: farmer, reviewer (enforced by migration 003 CHECK)
  role VARCHAR(50) NOT NULL DEFAULT 'farmer',
  
  avatar_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ===================================
-- 2. LANDS - Main land objects owned by users
-- ===================================
CREATE TABLE lands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  owner_id UUID NOT NULL,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Geographic coordinates
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  
  -- Administrative hierarchy
  province VARCHAR(100),
  regency VARCHAR(100),
  district VARCHAR(100),
  village VARCHAR(100),
  
  -- Administrative division code (adm4)
  adm4_code VARCHAR(50),
  
  -- Track location resolution
  location_source VARCHAR(50), -- 'manual', 'bmkg', 'geocoding', etc.
  location_resolved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  archived_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT fk_lands_owner FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_lands_owner_id ON lands(owner_id);
CREATE INDEX idx_lands_adm4_code ON lands(adm4_code);
CREATE INDEX idx_lands_coordinates ON lands(latitude, longitude);
CREATE INDEX idx_lands_archived_at ON lands(archived_at);

-- ===================================
-- 3. CROP_CONTEXTS - Crop info per land per season
-- ===================================
CREATE TABLE crop_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  land_id UUID NOT NULL,
  
  crop_name VARCHAR(255) NOT NULL, -- e.g., 'Padi Inpari 32'
  variety_name VARCHAR(255),
  
  -- Growth stages: vegetative, flowering, ripening, unknown
  growth_stage VARCHAR(50) NOT NULL DEFAULT 'unknown',
  
  planting_date DATE,
  
  is_active BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_crop_contexts_land FOREIGN KEY (land_id) REFERENCES lands(id) ON DELETE CASCADE
);

-- Partial unique index: Only 1 active crop context per land
CREATE UNIQUE INDEX idx_unique_active_crop_per_land ON crop_contexts(land_id) WHERE is_active = TRUE;
CREATE INDEX idx_crop_contexts_land_id ON crop_contexts(land_id);
CREATE INDEX idx_crop_contexts_is_active ON crop_contexts(is_active);
CREATE INDEX idx_crop_contexts_growth_stage ON crop_contexts(growth_stage);

-- ===================================
-- 4. DECISION_CASES - Decision-making sessions
-- ===================================
CREATE TABLE decision_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  land_id UUID NOT NULL,
  crop_context_id UUID NOT NULL,
  created_by UUID NOT NULL,
  
  -- Examples: water_condition, pest_pressure, nutrient_status
  decision_type VARCHAR(100) NOT NULL,
  
  -- Status flow: draft -> collecting_evidence -> assessed -> review_pending -> ready_for_decision -> decided
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT fk_decision_cases_land FOREIGN KEY (land_id) REFERENCES lands(id) ON DELETE CASCADE,
  CONSTRAINT fk_decision_cases_crop_context FOREIGN KEY (crop_context_id) REFERENCES crop_contexts(id) ON DELETE CASCADE,
  CONSTRAINT fk_decision_cases_created_by FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE RESTRICT
);

CREATE INDEX idx_decision_cases_land_id ON decision_cases(land_id);
CREATE INDEX idx_decision_cases_crop_context_id ON decision_cases(crop_context_id);
CREATE INDEX idx_decision_cases_created_by ON decision_cases(created_by);
CREATE INDEX idx_decision_cases_status ON decision_cases(status);
CREATE INDEX idx_decision_cases_decision_type ON decision_cases(decision_type);
CREATE INDEX idx_decision_cases_created_at ON decision_cases(created_at DESC);

-- ===================================
-- 5. EXTERNAL_SOURCE_CACHE - Raw data from external sources
-- ===================================
CREATE TABLE external_source_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  source_name VARCHAR(100) NOT NULL, -- e.g., 'BMKG'
  request_key VARCHAR(255) NOT NULL, -- Key for deduplication
  
  adm4_code VARCHAR(50),
  
  raw_payload JSONB NOT NULL,
  
  observed_at TIMESTAMP WITH TIME ZONE,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Status: success, failed
  status VARCHAR(50) NOT NULL DEFAULT 'success',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_external_source_cache_source_name ON external_source_cache(source_name);
CREATE INDEX idx_external_source_cache_request_key ON external_source_cache(source_name, request_key);
CREATE INDEX idx_external_source_cache_adm4_code ON external_source_cache(adm4_code);
CREATE INDEX idx_external_source_cache_expires_at ON external_source_cache(expires_at);
CREATE INDEX idx_external_source_cache_status ON external_source_cache(status);

-- ===================================
-- 6. DECISION_CASE_EVIDENCE - Collected evidence for decisions
-- ===================================
CREATE TABLE decision_case_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  decision_case_id UUID NOT NULL,
  
  -- Types: bmkg_forecast, field_pulse, crop_context, external, user_input
  type VARCHAR(100) NOT NULL,
  
  -- Source name/reference
  source VARCHAR(255),
  
  -- Evidence payload (varies by type)
  payload JSONB NOT NULL,
  
  -- When the observation was made (may differ from collection time)
  observed_at TIMESTAMP WITH TIME ZONE,
  
  -- When it was collected/recorded
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Freshness status: fresh, stale, expired
  freshness_status VARCHAR(50),
  
  -- Quality status: high, medium, low, uncertain
  quality_status VARCHAR(50),
  
  -- Mark mock/demo data
  is_mock BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_evidence_decision_case FOREIGN KEY (decision_case_id) REFERENCES decision_cases(id) ON DELETE CASCADE
);

CREATE INDEX idx_evidence_decision_case_id ON decision_case_evidence(decision_case_id);
CREATE INDEX idx_evidence_type ON decision_case_evidence(type);
CREATE INDEX idx_evidence_source ON decision_case_evidence(source);
CREATE INDEX idx_evidence_is_mock ON decision_case_evidence(is_mock);
CREATE INDEX idx_evidence_freshness_status ON decision_case_evidence(freshness_status);
CREATE INDEX idx_evidence_collected_at ON decision_case_evidence(collected_at DESC);

-- ===================================
-- 7. ASSESSMENTS - Reasoning output
-- ===================================
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  decision_case_id UUID NOT NULL,
  
  -- Version number for tracking changes
  version INT NOT NULL DEFAULT 1,
  
  -- Status: draft, active, superseded, archived
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  
  summary TEXT NOT NULL,
  
  -- Basis strength: high, medium, low, insufficient
  basis_strength VARCHAR(50),
  
  -- Factors considered (array of strings)
  factors JSONB,
  
  -- Evidence that was missing
  missing_evidence JSONB,
  
  -- Known limitations
  limitations JSONB,
  
  -- Reference to reasoning/assessment rule version
  rule_version VARCHAR(100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_assessments_decision_case FOREIGN KEY (decision_case_id) REFERENCES decision_cases(id) ON DELETE CASCADE
);

CREATE INDEX idx_assessments_decision_case_id ON assessments(decision_case_id);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_assessments_basis_strength ON assessments(basis_strength);
CREATE INDEX idx_assessments_created_at ON assessments(created_at DESC);

-- ===================================
-- 8. ACTION_OPTIONS - Action options from assessment
-- ===================================
CREATE TABLE action_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  assessment_id UUID NOT NULL,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  rationale TEXT,
  
  -- Display order
  display_order INT NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_action_options_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);

CREATE INDEX idx_action_options_assessment_id ON action_options(assessment_id);
CREATE INDEX idx_action_options_display_order ON action_options(assessment_id, display_order);

-- ===================================
-- 9. TRUSTED_REVIEWERS - List of trusted people
-- ===================================
CREATE TABLE trusted_reviewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  owner_id UUID NOT NULL,
  
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL, -- free-form label, e.g. 'PPL', 'ketua kelompok'
  contact VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_trusted_reviewers_owner FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_trusted_reviewers_owner_id ON trusted_reviewers(owner_id);
CREATE INDEX idx_trusted_reviewers_role ON trusted_reviewers(role);

-- ===================================
-- 10. TRUSTED_REVIEWS - Results of trusted review
-- ===================================
CREATE TABLE trusted_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  decision_case_id UUID NOT NULL,
  assessment_id UUID,
  reviewer_id UUID NOT NULL,
  
  -- Status: approve, modify, reject
  status VARCHAR(50) NOT NULL,
  
  comment TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT fk_trusted_reviews_decision_case FOREIGN KEY (decision_case_id) REFERENCES decision_cases(id) ON DELETE CASCADE,
  CONSTRAINT fk_trusted_reviews_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE SET NULL,
  CONSTRAINT fk_trusted_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES profiles(id) ON DELETE RESTRICT
);

CREATE INDEX idx_trusted_reviews_decision_case_id ON trusted_reviews(decision_case_id);
CREATE INDEX idx_trusted_reviews_assessment_id ON trusted_reviews(assessment_id);
CREATE INDEX idx_trusted_reviews_reviewer_id ON trusted_reviews(reviewer_id);
CREATE INDEX idx_trusted_reviews_status ON trusted_reviews(status);

-- ===================================
-- 11. DECISION_RECORDS - Final decision (immutable)
-- ===================================
CREATE TABLE decision_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  decision_case_id UUID NOT NULL UNIQUE,
  decided_by UUID NOT NULL,
  assessment_id UUID NOT NULL,
  
  -- Selected action option (may be NULL if custom decision)
  selected_action_option_id UUID,
  
  -- Decision type: selected_option, custom, deferred
  decision_type VARCHAR(50) NOT NULL,
  
  decision_text TEXT NOT NULL,
  reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_decision_records_decision_case FOREIGN KEY (decision_case_id) REFERENCES decision_cases(id) ON DELETE CASCADE,
  CONSTRAINT fk_decision_records_decided_by FOREIGN KEY (decided_by) REFERENCES profiles(id) ON DELETE RESTRICT,
  CONSTRAINT fk_decision_records_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE RESTRICT,
  CONSTRAINT fk_decision_records_action_option FOREIGN KEY (selected_action_option_id) REFERENCES action_options(id) ON DELETE SET NULL
);

CREATE INDEX idx_decision_records_decision_case_id ON decision_records(decision_case_id);
CREATE INDEX idx_decision_records_decided_by ON decision_records(decided_by);
CREATE INDEX idx_decision_records_assessment_id ON decision_records(assessment_id);
CREATE INDEX idx_decision_records_created_at ON decision_records(created_at DESC);

-- ===================================
-- 12. DECISION_RECORD_EVIDENCE - Audit trail
-- ===================================
CREATE TABLE decision_record_evidence (
  decision_record_id UUID NOT NULL,
  evidence_id UUID NOT NULL,
  
  PRIMARY KEY (decision_record_id, evidence_id),
  
  CONSTRAINT fk_dre_decision_record FOREIGN KEY (decision_record_id) REFERENCES decision_records(id) ON DELETE CASCADE,
  CONSTRAINT fk_dre_evidence FOREIGN KEY (evidence_id) REFERENCES decision_case_evidence(id) ON DELETE CASCADE
);

CREATE INDEX idx_decision_record_evidence_decision_record_id ON decision_record_evidence(decision_record_id);
CREATE INDEX idx_decision_record_evidence_evidence_id ON decision_record_evidence(evidence_id);

-- ===================================
-- 13. DECISION_BRIEFS - Shareable output
-- ===================================
CREATE TABLE decision_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  decision_record_id UUID NOT NULL UNIQUE,
  
  -- Template/format version
  template_version VARCHAR(100),
  
  -- Rendered content
  content TEXT NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_decision_briefs_decision_record FOREIGN KEY (decision_record_id) REFERENCES decision_records(id) ON DELETE CASCADE
);

CREATE INDEX idx_decision_briefs_decision_record_id ON decision_briefs(decision_record_id);

-- ===================================
-- UPDATED_AT TRIGGERS
-- ===================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_lands_updated_at
BEFORE UPDATE ON lands
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_crop_contexts_updated_at
BEFORE UPDATE ON crop_contexts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_decision_cases_updated_at
BEFORE UPDATE ON decision_cases
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================
-- Enable RLS on tables that need access control
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lands ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_case_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_reviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_briefs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view all profiles, update only their own
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Lands: Users can only view/edit their own lands
CREATE POLICY "lands_select_own" ON lands FOR SELECT USING (auth.uid() IN (
  SELECT user_id FROM profiles WHERE id = lands.owner_id
));
CREATE POLICY "lands_insert_own" ON lands FOR INSERT WITH CHECK (auth.uid() IN (
  SELECT user_id FROM profiles WHERE id = lands.owner_id
));
CREATE POLICY "lands_update_own" ON lands FOR UPDATE USING (auth.uid() IN (
  SELECT user_id FROM profiles WHERE id = lands.owner_id
));
CREATE POLICY "lands_delete_own" ON lands FOR DELETE USING (auth.uid() IN (
  SELECT user_id FROM profiles WHERE id = lands.owner_id
));

-- Crop Contexts: Access controlled through land ownership
CREATE POLICY "crop_contexts_select_via_land" ON crop_contexts FOR SELECT USING (
  land_id IN (
    SELECT l.id FROM lands l 
    WHERE auth.uid() IN (SELECT user_id FROM profiles WHERE id = l.owner_id)
  )
);
CREATE POLICY "crop_contexts_insert_via_land" ON crop_contexts FOR INSERT WITH CHECK (
  land_id IN (
    SELECT l.id FROM lands l 
    WHERE auth.uid() IN (SELECT user_id FROM profiles WHERE id = l.owner_id)
  )
);
CREATE POLICY "crop_contexts_update_via_land" ON crop_contexts FOR UPDATE USING (
  land_id IN (
    SELECT l.id FROM lands l 
    WHERE auth.uid() IN (SELECT user_id FROM profiles WHERE id = l.owner_id)
  )
);
CREATE POLICY "crop_contexts_delete_via_land" ON crop_contexts FOR DELETE USING (
  land_id IN (
    SELECT l.id FROM lands l 
    WHERE auth.uid() IN (SELECT user_id FROM profiles WHERE id = l.owner_id)
  )
);

-- Decision Cases: Access controlled through land ownership
CREATE POLICY "decision_cases_select_via_land" ON decision_cases FOR SELECT USING (
  land_id IN (
    SELECT l.id FROM lands l 
    WHERE auth.uid() IN (SELECT user_id FROM profiles WHERE id = l.owner_id)
  )
);
CREATE POLICY "decision_cases_insert_via_land" ON decision_cases FOR INSERT WITH CHECK (
  land_id IN (
    SELECT l.id FROM lands l 
    WHERE auth.uid() IN (SELECT user_id FROM profiles WHERE id = l.owner_id)
  )
);
CREATE POLICY "decision_cases_update_via_land" ON decision_cases FOR UPDATE USING (
  land_id IN (
    SELECT l.id FROM lands l 
    WHERE auth.uid() IN (SELECT user_id FROM profiles WHERE id = l.owner_id)
  )
);

-- Decision Case Evidence: Inherited from decision case access
CREATE POLICY "decision_case_evidence_select_via_case" ON decision_case_evidence FOR SELECT USING (
  decision_case_id IN (
    SELECT dc.id FROM decision_cases dc
    WHERE dc.land_id IN (
      SELECT l.id FROM lands l 
      WHERE auth.uid() IN (SELECT user_id FROM profiles WHERE id = l.owner_id)
    )
  )
);
CREATE POLICY "decision_case_evidence_insert_via_case" ON decision_case_evidence FOR INSERT WITH CHECK (
  decision_case_id IN (
    SELECT dc.id FROM decision_cases dc
    WHERE dc.land_id IN (
      SELECT l.id FROM lands l 
      WHERE auth.uid() IN (SELECT user_id FROM profiles WHERE id = l.owner_id)
    )
  )
);

-- Similar policies for assessments, actions, reviews, decision records, briefs
-- (Inherited through decision_case_id)

CREATE POLICY "assessments_select_via_case" ON assessments FOR SELECT USING (
  decision_case_id IN (
    SELECT dc.id FROM decision_cases dc
    WHERE dc.land_id IN (
      SELECT l.id FROM lands l 
      WHERE auth.uid() IN (SELECT user_id FROM profiles WHERE id = l.owner_id)
    )
  )
);
CREATE POLICY "assessments_insert_via_case" ON assessments FOR INSERT WITH CHECK (
  decision_case_id IN (
    SELECT dc.id FROM decision_cases dc
    WHERE dc.land_id IN (
      SELECT l.id FROM lands l 
      WHERE auth.uid() IN (SELECT user_id FROM profiles WHERE id = l.owner_id)
    )
  )
);

CREATE POLICY "action_options_select_via_assessment" ON action_options FOR SELECT USING (
  assessment_id IN (
    SELECT a.id FROM assessments a
    WHERE a.decision_case_id IN (
      SELECT dc.id FROM decision_cases dc
      WHERE dc.land_id IN (
        SELECT l.id FROM lands l 
        WHERE auth.uid() IN (SELECT user_id FROM profiles WHERE id = l.owner_id)
      )
    )
  )
);
CREATE POLICY "action_options_insert_via_assessment" ON action_options FOR INSERT WITH CHECK (
  assessment_id IN (
    SELECT a.id FROM assessments a
    WHERE a.decision_case_id IN (
      SELECT dc.id FROM decision_cases dc
      WHERE dc.land_id IN (
        SELECT l.id FROM lands l 
        WHERE auth.uid() IN (SELECT user_id FROM profiles WHERE id = l.owner_id)
      )
    )
  )
);

CREATE POLICY "trusted_reviewers_select_own" ON trusted_reviewers FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM profiles WHERE id = owner_id)
);
CREATE POLICY "trusted_reviewers_insert_own" ON trusted_reviewers FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM profiles WHERE id = owner_id)
);
CREATE POLICY "trusted_reviewers_update_own" ON trusted_reviewers FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM profiles WHERE id = owner_id)
);

CREATE POLICY "trusted_reviews_select_via_case" ON trusted_reviews FOR SELECT USING (
  decision_case_id IN (
    SELECT dc.id FROM decision_cases dc
    WHERE dc.land_id IN (
      SELECT l.id FROM lands l 
      WHERE auth.uid() IN (SELECT user_id FROM profiles WHERE id = l.owner_id)
    )
  )
);
CREATE POLICY "trusted_reviews_insert_via_case" ON trusted_reviews FOR INSERT WITH CHECK (
  decision_case_id IN (
    SELECT dc.id FROM decision_cases dc
    WHERE dc.land_id IN (
      SELECT l.id FROM lands l 
      WHERE auth.uid() IN (SELECT user_id FROM profiles WHERE id = l.owner_id)
    )
  )
);

CREATE POLICY "decision_records_select_via_case" ON decision_records FOR SELECT USING (
  decision_case_id IN (
    SELECT dc.id FROM decision_cases dc
    WHERE dc.land_id IN (
      SELECT l.id FROM lands l 
      WHERE auth.uid() IN (SELECT user_id FROM profiles WHERE id = l.owner_id)
    )
  )
);
CREATE POLICY "decision_records_insert_via_case" ON decision_records FOR INSERT WITH CHECK (
  decision_case_id IN (
    SELECT dc.id FROM decision_cases dc
    WHERE dc.land_id IN (
      SELECT l.id FROM lands l 
      WHERE auth.uid() IN (SELECT user_id FROM profiles WHERE id = l.owner_id)
    )
  )
);

CREATE POLICY "decision_briefs_select_via_record" ON decision_briefs FOR SELECT USING (
  decision_record_id IN (
    SELECT dr.id FROM decision_records dr
    WHERE dr.decision_case_id IN (
      SELECT dc.id FROM decision_cases dc
      WHERE dc.land_id IN (
        SELECT l.id FROM lands l 
        WHERE auth.uid() IN (SELECT user_id FROM profiles WHERE id = l.owner_id)
      )
    )
  )
);
CREATE POLICY "decision_briefs_insert_via_record" ON decision_briefs FOR INSERT WITH CHECK (
  decision_record_id IN (
    SELECT dr.id FROM decision_records dr
    WHERE dr.decision_case_id IN (
      SELECT dc.id FROM decision_cases dc
      WHERE dc.land_id IN (
        SELECT l.id FROM lands l 
        WHERE auth.uid() IN (SELECT user_id FROM profiles WHERE id = l.owner_id)
      )
    )
  )
);
