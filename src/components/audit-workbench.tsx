"use client";

import { useState } from "react";

import { vulnerableSample } from "@/lib/audit/samples";
import type { AuditReport } from "@/lib/audit/types";

type AuditErrorPayload = {
  error?: string;
  diagnostics?: Array<{ message: string }>;
};

export function AuditWorkbench() {
  const [code, setCode] = useState(vulnerableSample);
  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runScan() {
    setIsScanning(true);
    setReport(null);
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
      const payload = (await response.json()) as AuditReport | AuditErrorPayload;

      if (!response.ok) {
        const errorPayload = payload as AuditErrorPayload;
        throw new Error(
          errorPayload.diagnostics?.[0]?.message ??
            errorPayload.error ??
            "The contract could not be analysed.",
        );
      }

      setReport(payload as AuditReport);
    } catch (scanError) {
      setError(
        scanError instanceof Error
          ? scanError.message
          : "The contract could not be analysed.",
      );
    } finally {
      setIsScanning(false);
    }
  }

  return (
    <section className="workbench-section shell" id="workbench">
      <div className="workbench-header">
        <div>
          <span className="section-kicker">Live product preview</span>
          <h2>Check a contract before it becomes an incident.</h2>
        </div>
        <span className="demo-badge">Iteration 03 · Solidity AST engine</span>
      </div>

      <div className="workbench">
        <div className="editor-panel">
          <div className="panel-bar">
            <div className="file-tab">
              <span className="solidity-icon">S</span>
              VibeVault.sol
            </div>
            <button
              className="text-button"
              type="button"
              onClick={() => {
                setCode(vulnerableSample);
                setReport(null);
                setError(null);
              }}
            >
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
              setError(null);
            }}
          />
          <div className="editor-footer">
            <span>
              <i aria-hidden="true" />
              Source stays private until you publish a report
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
                <li>Solidity 0.8.28 compilation</li>
                <li>AST-based security checks</li>
                <li>Line-level evidence</li>
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

          {error !== null && !isScanning ? (
            <div className="report-empty error-state">
              <span className="error-code">COMPILATION FAILED</span>
              <h3>Fix the source and run it again.</h3>
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
              <button className="proof-button" type="button" disabled>
                Add AI review · available in Iteration 04
              </button>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
