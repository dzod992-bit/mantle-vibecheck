import { afterEach, describe, expect, it, vi } from "vitest";
import { verifyTypedData } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

import { analyzeSolidity } from "../audit/analyzer";
import { vulnerableSample } from "../audit/samples";
import {
  auditTypedData,
  createAuditDomain,
} from "../contracts/audit-registry";

import { canonicalJson, hashCanonicalJson } from "./canonical";
import { createSignedAuditProof } from "./proof";
import { createAiReview, createFallbackReview } from "./reviewer";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("review pipeline", () => {
  it("canonicalizes equivalent objects to the same report hash", () => {
    const left = { z: 1, a: { d: 2, b: [3, { y: true, x: false }] } };
    const right = { a: { b: [3, { x: false, y: true }], d: 2 }, z: 1 };

    expect(canonicalJson(left)).toBe(canonicalJson(right));
    expect(hashCanonicalJson(left)).toBe(hashCanonicalJson(right));
  });

  it("builds a fallback patch that improves the vulnerable sample", () => {
    const report = analyzeSolidity(vulnerableSample, "VibeVault.sol");
    const review = createFallbackReview(vulnerableSample, report);

    expect(review.patchedSource).not.toBeNull();
    const patchedReport = analyzeSolidity(
      review.patchedSource as string,
      "VibeVault.sol",
    );
    expect(patchedReport.score).toBeGreaterThan(report.score);
    expect(
      patchedReport.findings.some(
        (finding) => finding.ruleId === "tx-origin-auth",
      ),
    ).toBe(false);
  });

  it("creates a verifiable EIP-712 audit proof", async () => {
    const report = analyzeSolidity(vulnerableSample, "VibeVault.sol");
    const review = createFallbackReview(vulnerableSample, report);
    const signerPrivateKey = generatePrivateKey();
    const signer = privateKeyToAccount(signerPrivateKey);
    const publisher = privateKeyToAccount(generatePrivateKey()).address;
    const registryAddress = privateKeyToAccount(generatePrivateKey()).address;
    const proof = await createSignedAuditProof(report, review, {
      publisher,
      registryAddress,
      chainId: 5003,
      signerPrivateKey,
      now: 1_800_000_000n,
      nonce: 42n,
    });
    const audit = {
      ...proof.audit,
      issuedAt: BigInt(proof.audit.issuedAt),
      expiresAt: BigInt(proof.audit.expiresAt),
      nonce: BigInt(proof.audit.nonce),
    };

    await expect(
      verifyTypedData({
        address: signer.address,
        domain: createAuditDomain(5003, registryAddress),
        types: auditTypedData,
        primaryType: "Audit",
        message: audit,
        signature: proof.signature,
      }),
    ).resolves.toBe(true);
  });

  it("accepts schema-valid live AI output tied to known findings", async () => {
    const report = analyzeSolidity(vulnerableSample, "VibeVault.sol");
    const fallback = createFallbackReview(vulnerableSample, report);
    const firstFinding = report.findings[0];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  executiveSummary:
                    "The contract exposes a critical fund-loss path and requires remediation before deployment.",
                  threatModel: [
                    {
                      asset: "Contract funds",
                      threat: firstFinding.title,
                      control: firstFinding.remediation,
                    },
                  ],
                  patches: [
                    {
                      ruleId: firstFinding.ruleId,
                      title: firstFinding.title,
                      rationale: firstFinding.impact,
                      recommendation: firstFinding.remediation,
                    },
                  ],
                  patchedSource: fallback.patchedSource,
                  limitations: ["Manual review remains required."],
                }),
              },
            },
          ],
        }),
      ),
    );

    const review = await createAiReview(vulnerableSample, report, {
      apiKey: "test-key",
      baseUrl: "https://api.openai.com/v1",
      model: "test-model",
    });

    expect(review.mode).toBe("live");
    expect(review.provider).toBe("api.openai.com");
    expect(review.patchedSource).not.toBeNull();
  });

  it("rejects live AI patches that reference unknown findings", async () => {
    const report = analyzeSolidity(vulnerableSample, "VibeVault.sol");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  executiveSummary:
                    "The contract requires remediation before it can be deployed safely.",
                  threatModel: [],
                  patches: [
                    {
                      ruleId: "invented-vulnerability",
                      title: "Invented vulnerability",
                      rationale: "This finding does not exist.",
                      recommendation: "Do not trust it.",
                    },
                  ],
                  patchedSource: null,
                  limitations: [],
                }),
              },
            },
          ],
        }),
      ),
    );

    const review = await createAiReview(vulnerableSample, report, {
      apiKey: "test-key",
      model: "test-model",
    });

    expect(review.mode).toBe("local-fallback");
    expect(review.limitations).toContain(
      "Live AI referenced an unknown finding; local fallback was used.",
    );
  });

  it("reports a safe provider error code without exposing its message", async () => {
    const report = analyzeSolidity(vulnerableSample, "VibeVault.sol");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          {
            error: {
              code: "invalid_api_key",
              message: "Secret provider details must not be exposed.",
            },
          },
          { status: 401 },
        ),
      ),
    );

    const review = await createAiReview(vulnerableSample, report, {
      apiKey: "test-key",
      model: "test-model",
    });

    expect(review.mode).toBe("local-fallback");
    expect(review.limitations).toContain(
      "Live AI provider returned HTTP 401 (invalid_api_key); local fallback was used.",
    );
    expect(review.limitations.join(" ")).not.toContain(
      "Secret provider details",
    );
  });

  it("keeps live reasoning but discards an invalid AI patch", async () => {
    const report = analyzeSolidity(vulnerableSample, "VibeVault.sol");
    const firstFinding = report.findings[0];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  executiveSummary:
                    "The deterministic findings identify a critical issue that should be fixed before deployment.",
                  threatModel: [
                    {
                      asset: "Contract funds",
                      threat: firstFinding.title,
                      control: firstFinding.remediation,
                    },
                  ],
                  patches: [
                    {
                      ruleId: firstFinding.ruleId,
                      title: firstFinding.title,
                      rationale: firstFinding.impact,
                      recommendation: firstFinding.remediation,
                    },
                  ],
                  patchedSource: "contract Broken {",
                  limitations: [],
                }),
              },
            },
          ],
        }),
      ),
    );

    const review = await createAiReview(vulnerableSample, report, {
      apiKey: "test-key",
      model: "test-model",
    });

    expect(review.mode).toBe("live");
    expect(review.patchedSource).toBeNull();
    expect(review.limitations).toContain(
      "The AI patch did not compile and was discarded.",
    );
  });
});
