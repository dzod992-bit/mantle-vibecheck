import { describe, expect, it } from "vitest";

import { analyzeSolidity } from "./analyzer";
import {
  formatScanText,
  summarizeScan,
  violatesThreshold,
  type FileScanResult,
} from "./cli";
import { safeSample, vulnerableSample } from "./samples";

function resultFor(source: string, path: string): FileScanResult {
  return {
    path,
    report: analyzeSolidity(source, path),
    diagnostics: [],
  };
}

describe("VibeCheck CLI reporting", () => {
  it("fails when a finding meets or exceeds the configured threshold", () => {
    const results = [resultFor(vulnerableSample, "VibeVault.sol")];

    expect(violatesThreshold(results, "critical")).toBe(true);
    expect(violatesThreshold(results, "high")).toBe(true);
    expect(violatesThreshold(results, "none")).toBe(false);
  });

  it("passes a safe contract and produces a stable summary", () => {
    const results = [resultFor(safeSample, "SaferVault.sol")];

    expect(violatesThreshold(results, "low")).toBe(false);
    expect(summarizeScan(results)).toEqual({
      files: 1,
      findings: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      compilationErrors: 0,
    });
  });

  it("prints actionable rule IDs and remediation", () => {
    const output = formatScanText(
      [resultFor(vulnerableSample, "VibeVault.sol")],
      "high",
    );

    expect(output).toContain("reentrancy-state-after-call");
    expect(output).toContain("Fix:");
    expect(output).toContain("CI gate: fail on high or higher.");
  });
});
