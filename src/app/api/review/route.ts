import { NextResponse } from "next/server";
import { getAddress, isAddress, type Address, type Hex } from "viem";
import { z } from "zod";

import {
  analyzeSolidity,
  AuditCompilationError,
} from "@/lib/audit/analyzer";
import { createAiReview } from "@/lib/review/reviewer";
import { createSignedAuditProof } from "@/lib/review/proof";
import type { ReviewResponse } from "@/lib/review/types";
import {
  rateLimitResponse,
  rateLimitReviewRequest,
} from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const requestSchema = z.object({
  source: z.string().min(20).max(200_000),
  filename: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_.-]+\.sol$/)
    .default("Contract.sol"),
  publisher: z.string().optional(),
});

export async function POST(request: Request) {
  const rateLimit = rateLimitReviewRequest(request);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid review request.", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  if (
    parsed.data.publisher !== undefined &&
    !isAddress(parsed.data.publisher)
  ) {
    return NextResponse.json(
      { error: "Publisher must be a valid wallet address." },
      { status: 400 },
    );
  }

  try {
    const report = analyzeSolidity(parsed.data.source, parsed.data.filename);
    const ai = await createAiReview(parsed.data.source, report);
    const response: ReviewResponse = {
      report,
      ai,
      proof: null,
    };

    const proofConfig = getProofConfig(parsed.data.publisher);
    if ("reason" in proofConfig) {
      response.proofUnavailableReason = proofConfig.reason;
    } else {
      response.proof = await createSignedAuditProof(report, ai, proofConfig);
    }

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof AuditCompilationError) {
      return NextResponse.json(
        { error: error.message, diagnostics: error.diagnostics },
        { status: 422 },
      );
    }

    console.error("AI review failed", error);
    return NextResponse.json(
      { error: "The AI review could not be completed." },
      { status: 500 },
    );
  }
}

function getProofConfig(
  publisher: string | undefined,
):
  | {
      reason: string;
    }
  | {
      publisher: Address;
      registryAddress: Address;
      chainId: number;
      signerPrivateKey: Hex;
    } {
  if (publisher === undefined) {
    return { reason: "Connect a wallet to request a publishable proof." };
  }

  const registryAddress = process.env.NEXT_PUBLIC_AUDIT_REGISTRY_ADDRESS;
  const signerPrivateKey = process.env.AUDIT_SIGNER_PRIVATE_KEY;
  const chainId = Number.parseInt(
    process.env.NEXT_PUBLIC_MANTLE_CHAIN_ID ?? "5003",
    10,
  );

  if (
    registryAddress === undefined ||
    !isAddress(registryAddress) ||
    signerPrivateKey === undefined ||
    !/^0x[0-9a-fA-F]{64}$/.test(signerPrivateKey) ||
    !Number.isSafeInteger(chainId)
  ) {
    return {
      reason:
        "Proof signing is waiting for the Mantle deployment address and server signer configuration.",
    };
  }

  return {
    publisher: getAddress(publisher),
    registryAddress: getAddress(registryAddress),
    chainId,
    signerPrivateKey: signerPrivateKey as Hex,
  };
}
