# Mantle VibeCheck

Mantle VibeCheck is an AI-assisted security review tool for Solidity contracts
created through rapid and AI-assisted development. It combines deterministic
checks, an AI threat model, focused remediation guidance, and a verifiable
audit proof stored on Mantle.

## Current status

Iteration 1 provides the product shell and an interactive report preview.
The scanner, AI provider, and Mantle contract are implemented in later
iterations described in [docs/ROADMAP.md](docs/ROADMAP.md).

## Local development

Requirements:

- Node.js 22+
- npm 10+

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Planned architecture

```text
Next.js frontend
  -> audit API
     -> solc AST + deterministic rule engine
     -> AI threat model and remediation
  -> signed audit result
     -> AuditRegistry contract on Mantle Sepolia
```

## Security

Never commit `.env` files, wallet seed phrases, private keys, or API keys.
Use a dedicated low-value testnet wallet for development and deployment.

## Hackathon

This project targets the AI DevTools track of Mantle's Turing Test Hackathon
2026. Submission materials and owner actions are tracked in
[docs/OWNER_CHECKLIST_RU.md](docs/OWNER_CHECKLIST_RU.md).
