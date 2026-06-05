"use client";

import { useState } from "react";
import type { Address, Hex } from "viem";

import { vulnerableSample } from "@/lib/audit/samples";
import type { AuditReport } from "@/lib/audit/types";
import type { ReviewResponse } from "@/lib/review/types";
import {
  connectBrowserWallet,
  publishAuditProof,
} from "@/lib/review/wallet";
import { mantleSepoliaExplorerUrl } from "@/lib/contracts/mantle";

type ApiErrorPayload = {
  error?: string;
  diagnostics?: Array<{ message: string }>;
};

export function AuditWorkbench() {
  const [code, setCode] = useState(vulnerableSample);
  const [isScanning, setIsScanning] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [walletAddress, setWalletAddress] = useState<Address | null>(null);
  const [transactionHash, setTransactionHash] = useState<Hex | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runScan() {
    setIsScanning(true);
    setReport(null);
    setReview(null);
    setTransactionHash(null);
    setError(null);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          filename: "VibeVault.sol",
          source: code,
        }),
      });
      const payload = (await response.json()) as AuditReport | ApiErrorPayload;

      if (!response.ok) {
        throwApiError(payload);
      }

      setReport(payload as AuditReport);
    } catch (scanError) {
      setError(getErrorMessage(scanError));
    } finally {
      setIsScanning(false);
    }
  }

  async function runAiReview(publisher = walletAddress) {
    setIsReviewing(true);
    setTransactionHash(null);
    setError(null);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          filename: "VibeVault.sol",
          source: code,
          publisher: publisher ?? undefined,
        }),
      });
      const payload = (await response.json()) as
        | ReviewResponse
        | ApiErrorPayload;

      if (!response.ok) {
        throwApiError(payload);
      }

      setReview(payload as ReviewResponse);
      setReport((payload as ReviewResponse).report);
    } catch (reviewError) {
      setError(getErrorMessage(reviewError));
    } finally {
      setIsReviewing(false);
    }
  }

  async function connectWallet() {
    setIsConnecting(true);
    setError(null);

    try {
      const address = await connectBrowserWallet();
      setWalletAddress(address);
      if (review !== null) {
        await runAiReview(address);
      }
    } catch (walletError) {
      setError(getErrorMessage(walletError));
    } finally {
      setIsConnecting(false);
    }
  }

  async function publishProof() {
    if (review?.proof === null || review?.proof === undefined) {
      return;
    }
    if (walletAddress === null) {
      setError("Connect the publisher wallet before sending the transaction.");
      return;
    }

    setIsPublishing(true);
    setError(null);
    try {
      const hash = await publishAuditProof(review.proof, walletAddress);
      setTransactionHash(hash);
    } catch (publishError) {
      setError(getErrorMessage(publishError));
    } finally {
      setIsPublishing(false);
    }
  }

  function resetSource() {
    setCode(vulnerableSample);
    setReport(null);
    setReview(null);
    setTransactionHash(null);
    setError(null);
  }

  return (
    <section className="workbench-section shell" id="workbench">
      <div className="workbench-header">
        <div>
          <span className="section-kicker">Live product preview</span>
          <h2>Check a contract before it becomes an incident.</h2>
        </div>
        <span className="demo-badge">Iteration 05 · Testnet release</span>
      </div>

      <div className="workbench">
        <div className="editor-panel">
          <div className="panel-bar">
            <div className="file-tab">
              <span className="solidity-icon">S</span>
              VibeVault.sol
            </div>
            <button className="text-button" type="button" onClick={resetSource}>
              Reset sample
            </button>
          </div>
          <label className="sr-only" htmlFor="contract-source">
            Solidity contract source
          </label>
          <textarea
            id="contract-source"
            spellCheck={false}
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setReport(null);
              setReview(null);
              setTransactionHash(null);
              setError(null);
            }}
          />
          <div className="editor-footer">
            <span>
              <i aria-hidden="true" />
              Source is processed in memory and is not persisted
            </span>
            <button
              className="primary-button"
              type="button"
              disabled={!code.trim() || isScanning}
              onClick={runScan}
            >
              {isScanning ? "Inspecting contract..." : "Run VibeCheck"}
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>

        <aside className="report-panel" aria-live="polite">
          {report === null && !isScanning && error === null ? (
            <div className="report-empty">
              <div className="radar" aria-hidden="true">
                <span />
              </div>
              <h3>Ready to inspect</h3>
              <p>Compile the sample and run the deterministic security rules.</p>
              <ul>
                <li>Solidity 0.8.23 AST checks</li>
                <li>Validated AI threat model</li>
                <li>Signed Mantle audit proof</li>
              </ul>
            </div>
          ) : null}

          {isScanning ? (
            <div className="scanning-state">
              <div className="scanner-line" />
              <span className="mono">ANALYSING SOURCE</span>
              <h3>Looking beyond the happy path.</h3>
              <p>Checking call order, authorization, and fund safety.</p>
            </div>
          ) : null}

          {error !== null && report === null && !isScanning ? (
            <div className="report-empty error-state">
              <span className="error-code">REQUEST FAILED</span>
              <h3>Fix the issue and run it again.</h3>
              <p>{error}</p>
            </div>
          ) : null}

          {report !== null ? (
            <div className="report">
              <div className="score-row">
                <div className={`score-ring risk-${report.risk}`}>
                  <strong>{report.score}</strong>
                  <span>/100</span>
                </div>
                <div>
                  <span className={`risk-label risk-${report.risk}`}>
                    {report.risk === "pass"
                      ? "No known risks"
                      : `${report.risk} risk`}
                  </span>
                  <h3>
                    {report.risk === "pass"
                      ? "Ready for AI review"
                      : "Not ready to ship"}
                  </h3>
                  <p>
                    {report.summary.total} actionable{" "}
                    {report.summary.total === 1 ? "finding" : "findings"} · solc{" "}
                    {report.compilerVersion.split("+")[0]}
                  </p>
                </div>
              </div>

              <div className="finding-list">
                {report.findings.map((finding) => (
                  <article
                    className="finding"
                    key={`${finding.ruleId}-${finding.line}`}
                  >
                    <div className="finding-top">
                      <span className={`severity ${finding.severity}`}>
                        {finding.severity}
                      </span>
                      <span className="mono">
                        L{finding.line} · {finding.confidence} confidence
                      </span>
                    </div>
                    <h4>{finding.title}</h4>
                    <p>{finding.description}</p>
                    <code>{finding.evidence}</code>
                  </article>
                ))}
                {report.findings.length === 0 ? (
                  <div className="clean-report">
                    No high-confidence issues were found by the deterministic
                    rule set. AI reasoning is the next review layer.
                  </div>
                ) : null}
              </div>

              {review === null ? (
                <button
                  className="proof-button"
                  type="button"
                  disabled={isReviewing}
                  onClick={() => runAiReview()}
                >
                  {isReviewing
                    ? "Building threat model..."
                    : "Generate AI threat model"}
                </button>
              ) : (
                <AiReviewPanel review={review} />
              )}

              {review !== null ? (
                <div className="publish-panel">
                  <div>
                    <span className="mono">ON-CHAIN PROOF</span>
                    <p>
                      {walletAddress === null
                        ? "Connect the wallet that will own this audit record."
                        : shortenAddress(walletAddress)}
                    </p>
                  </div>

                  {walletAddress === null ? (
                    <button
                      className="secondary-button"
                      type="button"
                      disabled={isConnecting}
                      onClick={connectWallet}
                    >
                      {isConnecting ? "Connecting..." : "Connect wallet"}
                    </button>
                  ) : null}

                  {walletAddress !== null && review.proof === null ? (
                    <button
                      className="secondary-button"
                      type="button"
                      disabled={isReviewing}
                      onClick={() => runAiReview(walletAddress)}
                    >
                      {isReviewing ? "Signing..." : "Request signed proof"}
                    </button>
                  ) : null}

                  {review.proof !== null && transactionHash === null ? (
                    <button
                      className="proof-button"
                      type="button"
                      disabled={isPublishing}
                      onClick={publishProof}
                    >
                      {isPublishing
                        ? "Publishing on Mantle..."
                        : "Publish proof on Mantle"}
                    </button>
                  ) : null}

                  {transactionHash !== null ? (
                    <a
                      className="transaction-link"
                      href={`${mantleSepoliaExplorerUrl}/tx/${transactionHash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View confirmed transaction ↗
                    </a>
                  ) : null}
                  {transactionHash !== null && review.proof !== null ? (
                    <a
                      className="proof-page-link"
                      href={`/proof/${review.proof.auditId}`}
                    >
                      Open public audit proof
                    </a>
                  ) : null}

                  {review.proofUnavailableReason !== undefined &&
                  review.proof === null ? (
                    <small>{review.proofUnavailableReason}</small>
                  ) : null}
                </div>
              ) : null}

              {error !== null ? <p className="inline-error">{error}</p> : null}
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function AiReviewPanel({ review }: { review: ReviewResponse }) {
  return (
    <section className="ai-review">
      <div className="ai-review-heading">
        <span className="ai-badge">
          {review.ai.mode === "live" ? "Live AI" : "Local fallback"}
        </span>
        <span className="mono">{review.ai.model}</span>
      </div>
      <h4>Threat model</h4>
      <p>{review.ai.executiveSummary}</p>
      <div className="threat-list">
        {review.ai.threatModel.slice(0, 3).map((item) => (
          <article key={`${item.asset}-${item.threat}`}>
            <strong>{item.asset}</strong>
            <span>{item.threat}</span>
            <small>{item.control}</small>
          </article>
        ))}
      </div>
      <div className="patch-summary">
        <span>{review.ai.patches.length} remediation steps prepared</span>
        <span>
          {review.ai.patchedSource === null
            ? "Manual patch required"
            : "Patched source generated"}
        </span>
      </div>
      {review.ai.patchedSource !== null ? (
        <details className="patch-preview">
          <summary>Preview patched Solidity</summary>
          <pre>{review.ai.patchedSource}</pre>
        </details>
      ) : null}
    </section>
  );
}

function throwApiError(payload: AuditReport | ReviewResponse | ApiErrorPayload): never {
  const errorPayload = payload as ApiErrorPayload;
  throw new Error(
    errorPayload.diagnostics?.[0]?.message ??
      errorPayload.error ??
      "The request could not be completed.",
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "The request could not be completed.";
}

function shortenAddress(address: Address): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
