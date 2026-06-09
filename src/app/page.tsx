import { AuditWorkbench } from "@/components/audit-workbench";
import { projectLinks, projectRelease } from "@/lib/project";

const steps = [
  {
    number: "01",
    title: "Inspect",
    body: "Compile Solidity and run deterministic checks against risky patterns.",
  },
  {
    number: "02",
    title: "Reason",
    body: "Generate an AI threat model, plain-language findings, and focused fixes.",
  },
  {
    number: "03",
    title: "Prove",
    body: "Anchor the code hash and signed audit result on Mantle for anyone to verify.",
  },
];

export default function Home() {
  return (
    <main>
      <nav className="nav shell">
        <a className="brand" href="#">
          <span className="brand-mark" aria-hidden="true">
            V
          </span>
          <span>Mantle VibeCheck</span>
        </a>
        <div className="nav-links">
          <a href="#workbench">Scanner</a>
          <a href="#how-it-works">How it works</a>
          <a href={projectLinks.demoProof}>Demo proof</a>
          <a href={projectLinks.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <span className="network-pill">
            <i aria-hidden="true" />
            Mantle Sepolia
          </span>
        </div>
      </nav>

      <section className="hero shell">
        <div className="eyebrow">
          <span>AI security for vibe-coded contracts</span>
          <span className="eyebrow-line" />
        </div>
        <h1>
          Ship the vibe.
          <br />
          <span>Prove the code.</span>
        </h1>
        <p className="hero-copy">
          A Mantle-native security copilot that finds dangerous Solidity
          patterns, explains the risk, proposes a patch, and publishes a
          verifiable audit proof on-chain.
        </p>
        <div className="hero-actions">
          <a className="primary-link" href="#workbench">
            Run the live scanner
            <span aria-hidden="true">↓</span>
          </a>
          <a className="secondary-link" href={projectLinks.demoProof}>
            Verify a published proof
          </a>
        </div>
        <div className="hero-meta">
          <div>
            <strong>10</strong>
            <span>security checks</span>
          </div>
          <div>
            <strong>&lt;60s</strong>
            <span>target scan time</span>
          </div>
          <div>
            <strong>1 tx</strong>
            <span>to publish proof</span>
          </div>
        </div>
      </section>

      <AuditWorkbench />

      <section className="evidence shell" aria-labelledby="evidence-title">
        <div>
          <span className="section-kicker">Transparent by design</span>
          <h2 id="evidence-title">A fast review, not a security guarantee.</h2>
        </div>
        <div className="evidence-copy">
          <p>
            VibeCheck catches high-confidence patterns before a professional
            audit. It does not replace fuzzing, formal verification, economic
            review, or an independent human auditor.
          </p>
          <div className="evidence-links">
            <a href={projectLinks.demoProof}>Open demo proof</a>
            <a href={projectLinks.registry} target="_blank" rel="noreferrer">
              Verified contract ↗
            </a>
            <a href={projectLinks.github} target="_blank" rel="noreferrer">
              Review the source ↗
            </a>
          </div>
        </div>
      </section>

      <section className="how shell" id="how-it-works">
        <div className="section-heading">
          <span>Built for evidence, not theatre</span>
          <h2>One clear path from source code to on-chain proof.</h2>
        </div>
        <div className="steps">
          {steps.map((step) => (
            <article className="step-card" key={step.number}>
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer shell">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            V
          </span>
          <span>Mantle VibeCheck</span>
        </div>
        <p>Open-source security infrastructure for the Mantle ecosystem.</p>
        <div className="footer-links">
          <a href={projectLinks.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={projectLinks.registry} target="_blank" rel="noreferrer">
            MantleScan
          </a>
          <span>{projectRelease}</span>
        </div>
      </footer>
    </main>
  );
}
