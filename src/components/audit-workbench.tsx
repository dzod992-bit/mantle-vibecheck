"use client";

import { useState } from "react";

const sampleContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract VibeVault {
    address public owner;
    mapping(address => uint256) public balances;

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount);

        (bool sent,) = msg.sender.call{value: amount}("");
        require(sent);

        balances[msg.sender] -= amount;
    }

    function emergencySweep(address payable recipient) external {
        require(tx.origin == owner);
        recipient.transfer(address(this).balance);
    }
}`;

const findings = [
  {
    severity: "Critical",
    title: "State update after external call",
    line: "19",
    body: "The withdrawal sends ETH before reducing the caller balance. A receiver can re-enter and withdraw repeatedly.",
  },
  {
    severity: "High",
    title: "Authorization uses tx.origin",
    line: "26",
    body: "A malicious intermediary contract can trick the owner into authorizing the emergency sweep.",
  },
  {
    severity: "Medium",
    title: "No zero-address guard",
    line: "25",
    body: "Funds can be irrecoverably sent to the zero address during an emergency action.",
  },
];

export function AuditWorkbench() {
  const [code, setCode] = useState(sampleContract);
  const [isScanning, setIsScanning] = useState(false);
  const [hasReport, setHasReport] = useState(false);

  function runDemoScan() {
    setIsScanning(true);
    setHasReport(false);

    window.setTimeout(() => {
      setIsScanning(false);
      setHasReport(true);
    }, 700);
  }

  return (
    <section className="workbench-section shell" id="workbench">
      <div className="workbench-header">
        <div>
          <span className="section-kicker">Live product preview</span>
          <h2>Check a contract before it becomes an incident.</h2>
        </div>
        <span className="demo-badge">Iteration 01 · Demo engine</span>
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
                setCode(sampleContract);
                setHasReport(false);
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
              setHasReport(false);
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
              onClick={runDemoScan}
            >
              {isScanning ? "Inspecting contract..." : "Run VibeCheck"}
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>

        <aside className="report-panel" aria-live="polite">
          {!hasReport && !isScanning ? (
            <div className="report-empty">
              <div className="radar" aria-hidden="true">
                <span />
              </div>
              <h3>Ready to inspect</h3>
              <p>
                Run the sample contract to preview the security report
                experience.
              </p>
              <ul>
                <li>Deterministic Solidity checks</li>
                <li>AI-assisted threat model</li>
                <li>Mantle audit proof</li>
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

          {hasReport ? (
            <div className="report">
              <div className="score-row">
                <div className="score-ring">
                  <strong>42</strong>
                  <span>/100</span>
                </div>
                <div>
                  <span className="risk-label">High risk</span>
                  <h3>Not ready to ship</h3>
                  <p>3 actionable findings</p>
                </div>
              </div>
              <div className="finding-list">
                {findings.map((finding) => (
                  <article className="finding" key={finding.title}>
                    <div className="finding-top">
                      <span className={`severity ${finding.severity.toLowerCase()}`}>
                        {finding.severity}
                      </span>
                      <span className="mono">L{finding.line}</span>
                    </div>
                    <h4>{finding.title}</h4>
                    <p>{finding.body}</p>
                  </article>
                ))}
              </div>
              <button className="proof-button" type="button" disabled>
                Publish proof · available in Iteration 02
              </button>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
