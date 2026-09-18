export type SourcePlatform = 'WhatsApp' | 'X' | 'Instagram' | 'Facebook' | 'Telegram' | 'Other';

export type ClaimCategory = 'Politics' | 'Health' | 'Finance' | 'Other';

export type ClaimStatus = 'Unverified' | 'Verified True' | 'False' | 'Misleading';

export type RiskFlagType = 'Sensational' | 'Shouting' | 'Unsourced';

export interface RiskFlag {
  type: RiskFlagType;
  label: string;
  reason: string;
}

export interface ClaimRevision {
  editedAt: string;
  previousText: string;
  newText: string;
  note: string;
}

export interface Claim {
  id: string;
  text: string;
  sourcePlatform: SourcePlatform;
  sourceUrl?: string;
  category: ClaimCategory;
  region?: string;
  status: ClaimStatus;
  flags: RiskFlag[];
  isHighRisk: boolean;
  submittedAt: string;
  reviewedAt?: string;
  reviewerNote?: string;
  reviewerName?: string;
  verificationSourceUrl?: string;
  revisions?: ClaimRevision[];
  upvotes?: number;
}

export type FeedSortOption = 'risk' | 'recency' | 'status';

export type VisibilityPolicy = 'all' | 'quarantine_unverified';

export interface DecisionPointsConfig {
  feedOrder: FeedSortOption;
  visibility: VisibilityPolicy;
  allowEditing: boolean;
}

export interface TriageStats {
  totalClaims: number;
  unverifiedCount: number;
  highRiskCount: number;
  debunkedFalseCount: number;
  verifiedTrueCount: number;
  misleadingCount: number;
}
