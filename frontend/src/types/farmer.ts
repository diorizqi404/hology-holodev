export type DecisionStatus = "draft" | "recorded";
export type AttentionKind = "stale_evidence" | "review_ready" | "draft_open";

export type FarmerProfile = {
  displayName: string;
  roleLabel: string;
  groupLabel: string;
};

export type ActiveDecision = {
  id: string;
  hamparanName: string;
  summary: string;
  statusLabel: string;
  lastOpened: string;
};

export type AttentionItem = {
  id: string;
  kind: AttentionKind;
  title: string;
  description: string;
};

export type RecentDecision = {
  id: string;
  hamparanName: string;
  decisionText: string;
  timestamp: string;
  status: DecisionStatus;
  isDemo?: boolean;
};

export type HamparanSummary = {
  id: string;
  name: string;
  location: string;
  crop: string;
  variety: string;
  stage: string;
  areaHa: number;
};
