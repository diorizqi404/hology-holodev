import type { BmkgCanonicalEvidence, BmkgDelivery } from '../bmkg/bmkg.types.js';

export type FieldPulseValue = 'present' | 'limited' | 'none' | 'unknown' | 'flowing' | 'not_flowing';

export type FieldPulseEvidence = {
  evidenceId: string;
  observedAt?: string;
  waterPresence?: Extract<FieldPulseValue, 'present' | 'limited' | 'none' | 'unknown'>;
  irrigationFlow?: Extract<FieldPulseValue, 'flowing' | 'limited' | 'not_flowing' | 'unknown'>;
  waterTrend?: 'kering' | 'tetap' | 'basah' | 'gatau';
};

export type ReasoningInput = {
  decisionCaseId: string;
  evaluatedAt: string;
  cropContext?: {
    cropContextId: string;
    cropName: string;
    varietyName?: string;
    growthStage: 'vegetative' | 'flowering' | 'ripening' | 'unknown';
    plantingDate?: string;
  };
  bmkg?: {
    evidenceId: string;
    evidence: BmkgCanonicalEvidence;
    delivery: BmkgDelivery;
  };
  fieldPulse?: FieldPulseEvidence;
};

export type AssessmentContextState =
  | 'context_available'
  | 'needs_verification'
  | 'insufficient_evidence';

export type ReasoningAssessment = {
  status: 'available';
  summary: string;
  contextState: AssessmentContextState;
  confidence: 'medium' | 'low';
  factors: string[];
  missingEvidence: string[];
  limitations: string[];
  actionOptions: Array<{
    optionId: string;
    title: string;
    description: string;
    rationale: string;
  }>;
  actionSelection: {
    source: 'rule_catalog';
    ranking: null;
  };
  recommendation: {
    mode: 'alternatives_only';
    recommendedOptionId: null;
  };
  evaluatedAt: string;
  rulesetVersion: string;
  generation?: {
    mode: 'llm_enhanced' | 'deterministic_fallback';
    provider?: 'google-gemini';
    model?: string;
    fallbackReason?: string;
  };
  explanation: {
    summaryCode: AssessmentContextState;
    factorItems: Array<{ code: string; evidenceId: string }>;
    unknownItems: Array<{ code: string; required: boolean }>;
    strength: { level: 'medium' | 'low'; basisCodes: string[] };
    limitationCodes: string[];
    sourceRefs: Array<{ evidenceId: string; displayName: string }>;
  };
};
