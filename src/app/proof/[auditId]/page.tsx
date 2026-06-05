import type { Metadata } from "next";
import Link from "next/link";
import { createPublicClient, getAddress, http, isAddress, type Hex } from "viem";

import { auditRegistryAbi } from "@/lib/contracts/audit-registry";
import {
  mantleSepolia,
  mantleSepoliaExplorerUrl,
} from "@/lib/contracts/mantle";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verify audit proof | Mantle VibeCheck",
  description: "Read a Mantle VibeCheck audit record directly from Mantle.",
};

type ProofPageProps = {
  params: Promise<{ auditId: string }>;
};

export default async function ProofPage({ params }: ProofPageProps) {
  const { auditId } = await params;
  const registryAddress = process.env.NEXT_PUBLIC_AUDIT_REGISTRY_ADDRESS;

  if (!/^0x[0-9a-fA-F]{64}$/.test(auditId)) {
    return <ProofState title="Invalid audit ID" body="Use a 32-byte audit ID." />;
  }
  if (registryAddress === undefined || !isAddress(registryAddress)) {
    return (
      <ProofState
        title="Registry deployment pending"
        body="The public verifier will activate after the Mantle Sepolia contract address is configured."
      />
    );
  }

  const result = await readAuditRecord(
    getAddress(registryAddress),
    auditId as Hex,
  );
  if (result.kind === "error") {
    return (
      <ProofState
        title="Mantle RPC unavailable"
        body="The proof could not be read right now. Retry shortly or inspect the registry in MantleScan."
      />
    );
  }
  if (result.record.publishedAt === 0n) {
    return (
      <ProofState
        title="Audit proof not found"
        body="No record with this ID exists in the configured registry."
      />
    );
  }

  const { record } = result;
  return (
    <main className="proof-page shell">
      <Link className="proof-back" href="/">
        &lt;- Back to scanner
      </Link>
      <section className="proof-card">
        <div className="proof-status">
          <span className="network-pill">
            <i aria-hidden="true" />
            Verified on Mantle Sepolia
          </span>
          <span className="mono">{formatTimestamp(record.publishedAt)}</span>
        </div>
        <div className="proof-hero">
          <div className="score-ring risk-pass">
            <strong>{record.score}</strong>
            <span>/100</span>
          </div>
          <div>
            <span className="section-kicker">Immutable audit record</span>
            <h1>Proof matches the Mantle registry.</h1>
            <p>
              This page reads the audit metadata directly from the deployed
              contract. It does not trust a database or editable report.
            </p>
          </div>
        </div>
        <dl className="proof-grid">
          <ProofField label="Audit ID" value={auditId} />
          <ProofField label="Code hash" value={record.codeHash} />
          <ProofField label="Report hash" value={record.reportHash} />
          <ProofField label="Model hash" value={record.modelHash} />
          <ProofField label="Publisher" value={record.publisher} />
          <ProofField
            label="Findings"
            value={`${record.criticalCount} critical | ${record.highCount} high | ${record.mediumCount} medium`}
          />
        </dl>
        <a
          className="proof-button proof-explorer"
          href={`${mantleSepoliaExplorerUrl}/address/${registryAddress}`}
          target="_blank"
          rel="noreferrer"
        >
          Inspect registry on MantleScan -&gt;
        </a>
      </section>
    </main>
  );
}

function ProofField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ProofState({ title, body }: { title: string; body: string }) {
  return (
    <main className="proof-page shell">
      <Link className="proof-back" href="/">
        &lt;- Back to scanner
      </Link>
      <section className="proof-card proof-empty">
        <span className="section-kicker">Mantle VibeCheck verifier</span>
        <h1>{title}</h1>
        <p>{body}</p>
      </section>
    </main>
  );
}

async function readAuditRecord(registryAddress: Hex, auditId: Hex) {
  try {
    const client = createPublicClient({
      chain: mantleSepolia,
      transport: http(),
    });
    const record = await client.readContract({
      address: registryAddress,
      abi: auditRegistryAbi,
      functionName: "getAudit",
      args: [auditId],
    });

    return { kind: "success" as const, record };
  } catch {
    return { kind: "error" as const };
  }
}

function formatTimestamp(timestamp: bigint): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(Number(timestamp) * 1_000));
}
