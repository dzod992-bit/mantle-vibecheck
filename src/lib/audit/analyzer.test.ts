import { describe, expect, it } from "vitest";

import {
  analyzeSolidity,
  AuditCompilationError,
} from "./analyzer";
import { safeSample, vulnerableSample } from "./samples";

describe("analyzeSolidity", () => {
  it("finds reentrancy and tx.origin in the vulnerable sample", () => {
    const report = analyzeSolidity(vulnerableSample, "VibeVault.sol");
    const ruleIds = report.findings.map((finding) => finding.ruleId);

    expect(ruleIds).toContain("reentrancy-state-after-call");
    expect(ruleIds).toContain("tx-origin-auth");
    expect(report.summary.critical).toBe(1);
    expect(report.summary.high).toBeGreaterThanOrEqual(1);
    expect(report.score).toBeLessThan(60);
    expect(report.sourceHash).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("does not report critical or high findings for checks-effects-interactions", () => {
    const report = analyzeSolidity(safeSample, "SaferVault.sol");

    expect(report.summary.critical).toBe(0);
    expect(report.summary.high).toBe(0);
    expect(report.score).toBe(100);
    expect(report.risk).toBe("pass");
  });

  it("detects unchecked low-level calls and selfdestruct", () => {
    const source = `// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;
contract Unsafe {
    function ping(address target) external {
        target.call("");
    }
    function destroy(address payable recipient) external {
        selfdestruct(recipient);
    }
}`;
    const report = analyzeSolidity(source, "Unsafe.sol");
    const ruleIds = report.findings.map((finding) => finding.ruleId);

    expect(ruleIds).toContain("unchecked-low-level-call");
    expect(ruleIds).toContain("selfdestruct");
  });

  it("supports explicit import resolution for local developer tooling", () => {
    const source = `// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;
import {Guard} from "./Guard.sol";
contract UsesGuard is Guard {}`;
    const importedSource = `// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;
contract Guard {}`;

    const report = analyzeSolidity(source, "contracts/UsesGuard.sol", {
      importResolver: (path) =>
        path.endsWith("Guard.sol")
          ? { contents: importedSource }
          : { error: "Import not found" },
    });

    expect(report.filename).toBe("contracts/UsesGuard.sol");
    expect(report.risk).toBe("pass");
  });

  it("returns structured compiler errors", () => {
    expect(() =>
      analyzeSolidity("pragma solidity 0.8.23; contract Broken {", "Broken.sol"),
    ).toThrow(AuditCompilationError);

    try {
      analyzeSolidity("pragma solidity 0.8.23; contract Broken {", "Broken.sol");
    } catch (error) {
      expect(error).toBeInstanceOf(AuditCompilationError);
      expect((error as AuditCompilationError).diagnostics[0].line).toBe(1);
    }
  });
});
