import { describe, expect, it } from "vitest";
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
import { createFallbackReview } from "./reviewer";

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
});
