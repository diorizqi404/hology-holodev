import { apiFetch } from "./auth";

export interface ApiPendingReview {
  review_id: string;
  case_id: string;
  land_name: string;
  farmer_name: string;
  location: string;
  crop_name: string;
  growth_stage: string;
  decision_type: string;
  submitted_at: string;
  assessment: { id: string; summary: string; basis_strength: string | null } | null;
  evidence: {
    bmkg: { condition: string; temp: number; text: string } | null;
    field_pulse: { condition: string; text: string } | null;
  };
}

export interface ApiCompletedReview {
  review_id: string;
  land_name: string;
  farmer_name: string;
  village: string;
  status: string;
  comment: string;
  responded_at: string;
  assessment: { summary: string; basis_strength: string | null } | null;
  evidence_labels: string[];
}

export interface ApiReviewerDashboard {
  reviewer_name: string;
  region: string;
  weather: { condition: string; temp: number; text: string } | null;
  stats: {
    pending_count: number;
    urgent_count: number;
  };
  pending_reviews: ApiPendingReview[];
  completed_reviews: ApiCompletedReview[];
}

export interface ApiReviewerProfile {
  id: string;
  display_name: string;
  role: "reviewer";
  avatar_url?: string | null;
  email?: string | null;
  phone?: string | null;
  created_at: string;
  last_sign_in_at?: string | null;
}

export interface ApiReviewerReviewDetail {
  case_id: string;
  status: string;
  decision_type: string;
  submitted_at: string;
  land: {
    id: string;
    name: string;
    description: string | null;
    location: string;
    village: string | null;
    district: string | null;
    regency: string | null;
    province: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  farmer: { name: string };
  crop: { name: string; variety: string | null; growth_stage: string; planting_date: string | null } | null;
  evidence: {
    bmkg: { condition: string; temp: number; humidity: number | null; wind_speed: number | null; wind_direction: string | null; target_time: string | null; source: string; freshness_status: string | null } | null;
    field_pulse: { water_presence: string; irrigation_flow: string; notes: string | null; observed_at: string | null; freshness_status: string | null } | null;
  };
  assessment: { id: string; summary: string; basis_strength: string | null; factors: string[]; missing_evidence: string[]; limitations: string[]; rule_version: string | null } | null;
  action_options: Array<{ id: string; title: string; description?: string; rationale?: string; catalog_option_id: string | null }>;
  prior_review: { id: string; status: "approve" | "modify" | "reject"; comment?: string; responded_at?: string } | null;
}

export const reviewerApi = {
  getDashboard: () => apiFetch<ApiReviewerDashboard>("/reviewer/dashboard"),
  getProfile: () => apiFetch<ApiReviewerProfile>("/profile"),
  getReviewDetail: (caseId: string) => apiFetch<ApiReviewerReviewDetail>(`/reviewer/reviews/${caseId}`),
  submitReview: (caseId: string, payload: { status: "approve" | "modify" | "reject"; assessment_id?: string; comment?: string }) =>
    apiFetch<{ id: string; status: string }>(`/decision-cases/${caseId}/reviews`, { method: "POST", body: JSON.stringify(payload) }),
};
