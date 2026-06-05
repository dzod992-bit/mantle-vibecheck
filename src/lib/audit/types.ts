import type { Hex } from "viem";

export type FindingSeverity = "critical" | "high" | "medium" | "low";
export type FindingConfidence = "high" | "medium";
export type AuditRisk = "critical" | "high" | "medium" | "low" | "pass";

export type AuditFinding = {
  ruleId: string;
  severity: FindingSeverity;
  confidence: FindingConfidence;
  title: string;
  description: string;
  impact: string;
  remediation: string;
  line: number;
  column: number;
  evidence: string;
};

export type AuditSummary = {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
};

export type CompilationDiagnostic = {
  severity: "error" | "warning";
  message: string;
  line?: number;
  column?: number;
};

export type AuditReport = {
  schemaVersion: "1.0";
  engineVersion: string;
  sourceHash: Hex;
  compilerVersion: string;
  filename: string;
  score: number;
  risk: AuditRisk;
  summary: AuditSummary;
  findings: AuditFinding[];
  diagnostics: CompilationDiagnostic[];
};
