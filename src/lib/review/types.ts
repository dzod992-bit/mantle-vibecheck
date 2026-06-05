import type { Address, Hex } from "viem";

import type { AuditReport } from "@/lib/audit/types";

export type AiThreat = {
  asset: string;
  threat: string;
  control: string;
};

export type AiPatch = {
  ruleId: string;
  title: string;
  rationale: string;
  recommendation: string;
};

export type AiReview = {
  mode: "live" | "local-fallback";
  provider: string;
  model: string;
  executiveSummary: string;
  threatModel: AiThreat[];
  patches: AiPatch[];
  patchedSource: string | null;
  limitations: string[];
};

export type SerializedSignedAudit = {
  codeHash: Hex;
  reportHash: Hex;
  modelHash: Hex;
  publisher: Address;
  score: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  issuedAt: string;
  expiresAt: string;
  nonce: string;
};

export type AuditProof = {
  audit: SerializedSignedAudit;
  signature: Hex;
  auditId: Hex;
  registryAddress: Address;
  chainId: number;
  reportHash: Hex;
};

export type ReviewResponse = {
  report: AuditReport;
  ai: AiReview;
  proof: AuditProof | null;
  proofUnavailableReason?: string;
};
