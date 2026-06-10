import type { Metadata } from "next";
import Link from "next/link";

import { projectLinks, projectRelease } from "@/lib/project";

export const metadata: Metadata = {
  title: "Judge Center | Mantle VibeCheck",
  description:
    "Reproducible benchmark, developer workflow, architecture, and on-chain evidence for Mantle VibeCheck.",
};

const demoPath = [
  {
    number: "01",
    title: "Run the scanner",
    body: "Use the vulnerable sample to see deterministic AST findings, line evidence, scoring, remediation, and the validated reasoning layer.",
    href: "/#workbench",
    label: "Open scanner",
  },
  {
    number: "02",
    title: "Inspect reproducible evidence",
    body: "Review the committed six-case corpus, all 10 rules, exact expected labels, and the GitHub Actions regression gate.",
    href: projectLinks.benchmark,
    label: "Open benchmark",
  },
  {
    number: "03",
    title: "Verify the Mantle proof",
    body: "Read a published audit directly from Mantle Sepolia and compare it with the source-verified AuditRegistry contract.",
    href: projectLinks.demoProof,
    label: "Verify proof",
  },
];

const evidence = [
  {
    label: "Working product",
    value: "Live scanner",
    detail: "End-to-end source-to-proof workflow",
    href: projectLinks.demo,
  },
  {
    label: "Developer workflow",
    value: "CLI + CI gate",
    detail: "Recursive imports, JSON output, severity thresholds",
    href: projectLinks.workflow,
  },
  {
    label: "Benchmark",
    value: "11 TP · 0 FP · 0 FN",
    detail: "Six exact cases covering all 10 rules",
    href: projectLinks.benchmark,
  },
  {
    label: "Mantle evidence",
    value: "Published proof",
    detail: "Public verifier reads registry state",
    href: projectLinks.demoProof,
  },
  {
    label: "Verified contract",
    value: "Exact bytecode match",
    detail: "Solidity 0.8.23 on Mantle Sepolia",
    href: projectLinks.registry,
  },
  {
    label: "Open source",
    value: "18 + 5 tests",
    detail: "Unit/integration plus smart-contract tests",
    href: projectLinks.github,
  },
];

const architecture = [
  ["01", "Solidity source", "Exact code revision"],
  ["02", "solc AST", "Deterministic compilation"],
  ["03", "Rule engine", "Line-level findings"],
  ["04", "Validated reasoning", "Threat model and patch"],
  ["05", "EIP-712 payload", "Code and report hashes"],
  ["06", "Mantle registry", "Public immutable proof"],
];

const scorecard = [
  {
    title: "Output quality",
    body: "LLM output cannot invent vulnerability claims. Rule IDs are allowlisted, JSON is schema-validated, and patched Solidity is recompiled before display.",
  },
  {
    title: "Developer productivity",
    body: "The same engine runs in the web UI, local CLI, and a focused pull-request workflow with configurable severity failure thresholds.",
  },
  {
    title: "Verifiability",
    body: "The benchmark is committed and executable. Published reports bind the code hash and canonical report hash to a signed Mantle record.",
  },
  {
    title: "Mantle integration",
    body: "Mantle is the verification layer, not a logo: the registry authorizes signatures, prevents nonce replay, and indexes proofs by code hash.",
  },
];

const businessModel = [
  {
    tier: "Open source",
    title: "Free local gate",
    body: "CLI, deterministic rules, and public proof verification create adoption among individual Mantle builders.",
  },
  {
    tier: "Team SaaS",
    title: "Continuous review",
    body: "Private repositories, policy presets, PR annotations, history, team dashboards, and usage-based AI reasoning.",
  },
  {
    tier: "Protocol API",
    title: "Release evidence",
    body: "Wallets, launchpads, and deployment platforms consume machine-readable proof status as a release or listing signal.",
  },
  {
    tier: "Escalation",
    title: "Human audit handoff",
    body: "High-risk findings can be packaged for paid professional review without presenting automation as a full audit.",
  },
];

export default function JudgesPage() {
  return (
    <main className="judge-page">
      <nav className="nav shell">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            V
          </span>
          <span>Mantle VibeCheck</span>
        </Link>
        <div className="nav-links judge-nav-links">
          <a href="#evidence">Evidence</a>
          <a href="#architecture">Architecture</a>
          <a href="#business">Business</a>
          <a href={projectLinks.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <span className="network-pill">
            <i aria-hidden="true" />
            Judge Center
          </span>
        </div>
      </nav>

      <section className="judge-hero shell">
        <div className="eyebrow">
          <span>AI DevTools · judge evidence</span>
          <span className="eyebrow-line" />
        </div>
        <div className="judge-hero-grid">
          <div>
            <h1>
              Trust the evidence,
              <br />
              <span>not the badge.</span>
            </h1>
            <p>
              Mantle VibeCheck combines deterministic Solidity analysis,
              constrained AI remediation, developer workflow automation, and
              an independently verifiable audit trail on Mantle.
            </p>
            <div className="hero-actions">
              <Link className="primary-link" href="/#workbench">
                Run the product
                <span aria-hidden="true">↗</span>
              </Link>
              <a className="secondary-link" href={projectLinks.demoProof}>
                Verify on Mantle
              </a>
            </div>
          </div>
          <aside className="judge-snapshot" aria-label="Release evidence">
            <span className="section-kicker">Release snapshot</span>
            <dl>
              <div>
                <dt>Rules covered</dt>
                <dd>10 / 10</dd>
              </div>
              <div>
                <dt>Benchmark</dt>
                <dd>6 / 6 exact</dd>
              </div>
              <div>
                <dt>Automated tests</dt>
                <dd>23 total</dd>
              </div>
              <div>
                <dt>On-chain proofs</dt>
                <dd>Mantle Sepolia</dd>
              </div>
            </dl>
            <span className="judge-release">{projectRelease}</span>
          </aside>
        </div>
      </section>

      <section className="judge-section shell">
        <div className="judge-section-heading">
          <span className="section-kicker">Three-minute review path</span>
          <h2>See the full claim, then verify every layer.</h2>
        </div>
        <div className="judge-path">
          {demoPath.map((step) => (
            <article key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <a href={step.href}>{step.label} ↗</a>
            </article>
          ))}
        </div>
      </section>

      <section className="judge-section shell" id="evidence">
        <div className="judge-section-heading">
          <span className="section-kicker">Public evidence</span>
          <h2>No private dashboard is required to check our claims.</h2>
        </div>
        <div className="judge-evidence-grid">
          {evidence.map((item) => (
            <a href={item.href} key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.detail}</small>
              <i aria-hidden="true">↗</i>
            </a>
          ))}
        </div>
      </section>

      <section className="judge-section shell" id="architecture">
        <div className="judge-section-heading judge-heading-split">
          <div>
            <span className="section-kicker">Architecture</span>
            <h2>Deterministic first. AI constrained. Mantle verifiable.</h2>
          </div>
          <p>
            Security claims originate in compiled AST evidence. The reasoning
            layer can explain and patch known findings, but it cannot introduce
            new rule IDs into a signed report.
          </p>
        </div>
        <div className="architecture-flow">
          {architecture.map(([number, title, detail]) => (
            <article key={number}>
              <span>{number}</span>
              <strong>{title}</strong>
              <small>{detail}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="judge-section shell">
        <div className="judge-section-heading">
          <span className="section-kicker">Scorecard alignment</span>
          <h2>Built around the AI DevTools evaluation criteria.</h2>
        </div>
        <div className="scorecard-grid">
          {scorecard.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="judge-section shell" id="business">
        <div className="judge-section-heading judge-heading-split">
          <div>
            <span className="section-kicker">Business potential</span>
            <h2>Open-source adoption, paid continuous assurance.</h2>
          </div>
          <p>
            The free CLI is the distribution channel. Revenue comes from team
            workflow, private code, policy automation, API access, and
            responsible escalation to human reviewers.
          </p>
        </div>
        <div className="business-grid">
          {businessModel.map((item) => (
            <article key={item.tier}>
              <span>{item.tier}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="judge-caveat shell">
        <div>
          <span className="section-kicker">Transparent limitation</span>
          <h2>Pre-audit evidence, not a security guarantee.</h2>
        </div>
        <p>
          The benchmark measures the committed high-confidence rules, not
          universal vulnerability detection. VibeCheck does not replace
          fuzzing, invariant tests, formal verification, economic review, or a
          professional audit.
        </p>
      </section>

      <footer className="footer shell">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            V
          </span>
          <span>Mantle VibeCheck</span>
        </div>
        <p>Evidence-first security tooling for the Mantle ecosystem.</p>
        <div className="footer-links">
          <Link href="/">Product</Link>
          <a href={projectLinks.github} target="_blank" rel="noreferrer">
            Source
          </a>
          <span>{projectRelease}</span>
        </div>
      </footer>
    </main>
  );
}
