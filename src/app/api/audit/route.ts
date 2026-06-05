import { NextResponse } from "next/server";
import { z } from "zod";

import {
  analyzeSolidity,
  AuditCompilationError,
} from "@/lib/audit/analyzer";

export const runtime = "nodejs";

const requestSchema = z.object({
  source: z.string().min(20).max(200_000),
  filename: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_.-]+\.sol$/)
    .default("Contract.sol"),
});

export async function POST(request: Request) {
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
      {
        error: "Invalid audit request.",
        issues: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(
      analyzeSolidity(parsed.data.source, parsed.data.filename),
    );
  } catch (error) {
    if (error instanceof AuditCompilationError) {
      return NextResponse.json(
        {
          error: error.message,
          diagnostics: error.diagnostics,
        },
        { status: 422 },
      );
    }

    console.error("Audit request failed", error);
    return NextResponse.json(
      { error: "The audit engine could not process this contract." },
      { status: 500 },
    );
  }
}
