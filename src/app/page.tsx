import { AuditWorkbench } from "@/components/audit-workbench";

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
        <div className="hero-meta">
          <div>
            <strong>12</strong>
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
        <span>Hackathon build · 2026</span>
      </footer>
    </main>
  );
}
