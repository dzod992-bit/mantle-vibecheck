import { randomBytes } from "node:crypto";

import { getAddress, keccak256, toHex, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import type { AuditReport } from "@/lib/audit/types";
import {
  auditTypedData,
  createAuditDomain,
  deriveAuditId,
  type SignedAudit,
} from "@/lib/contracts/audit-registry";

import { hashCanonicalJson } from "./canonical";
import type { AiReview, AuditProof } from "./types";

type CreateProofOptions = {
  publisher: Address;
  registryAddress: Address;
  chainId: number;
  signerPrivateKey: Hex;
  now?: bigint;
  nonce?: bigint;
};

export async function createSignedAuditProof(
  report: AuditReport,
  review: AiReview,
  options: CreateProofOptions,
): Promise<AuditProof> {
  const account = privateKeyToAccount(options.signerPrivateKey);
  const issuedAt = options.now ?? BigInt(Math.floor(Date.now() / 1_000));
  const nonce = options.nonce ?? createNonce();
  const reportHash = hashCanonicalJson({ report, review });
  const audit: SignedAudit = {
    codeHash: report.sourceHash,
    reportHash,
    modelHash: keccak256(
      toHex(`${review.provider}:${review.model}:${report.engineVersion}`),
    ),
    publisher: getAddress(options.publisher),
    score: report.score,
    criticalCount: report.summary.critical,
    highCount: report.summary.high,
    mediumCount: report.summary.medium,
    issuedAt,
    expiresAt: issuedAt + 15n * 60n,
    nonce,
  };
  const registryAddress = getAddress(options.registryAddress);
  const signature = await account.signTypedData({
    domain: createAuditDomain(options.chainId, registryAddress),
    types: auditTypedData,
    primaryType: "Audit",
    message: audit,
  });

  return {
    audit: {
      ...audit,
      issuedAt: audit.issuedAt.toString(),
      expiresAt: audit.expiresAt.toString(),
      nonce: audit.nonce.toString(),
    },
    signature,
    auditId: deriveAuditId(audit),
    registryAddress,
    chainId: options.chainId,
    reportHash,
  };
}

function createNonce(): bigint {
  return BigInt(`0x${randomBytes(16).toString("hex")}`);
}
