# Mantle VibeCheck

Mantle VibeCheck is an AI-assisted security review tool for Solidity contracts
created through rapid and AI-assisted development. It combines deterministic
checks, an AI threat model, focused remediation guidance, and a verifiable
audit proof stored on Mantle.

## Current status

The current build includes the product UI, deterministic Solidity AST
analysis, a provider-neutral AI review layer, EIP-712 proof generation, wallet
publication flow, and the signed on-chain audit registry deployed on
[Mantle Sepolia](https://sepolia.mantlescan.xyz/address/0xdf8e3b1d7332903a0ac6ed11c078e0c35a62ff52).
Deployment details are in
[docs/DEPLOYMENT_RU.md](docs/DEPLOYMENT_RU.md).

## Local development

Requirements:

- Node.js 22+
- npm 10+

```bash
npm install
npm run dev
npm test
```

Open `http://localhost:3000`.

## Smart contracts

```bash
npm run contracts:compile
npm run contracts:test
npm run contracts:deploy:local
npm run contracts:verification-input
```

`AuditRegistry` verifies an EIP-712 signature from the configured trusted
VibeCheck signer before recording an audit. A report is bound to its source
code, model version, publisher, score, finding counts, expiry, and nonce.

## AI review

The app works without an API key by using a transparent deterministic fallback.
For live model reasoning, configure:

```text
AI_API_KEY=...
AI_MODEL=...
AI_API_BASE_URL=https://api.openai.com/v1
```

The endpoint uses an OpenAI-compatible chat-completions interface and validates
the returned JSON before it can be included in a signed proof.

## Planned architecture

```text
Next.js frontend
  -> audit API
     -> solc 0.8.23 AST + deterministic rule engine
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

- [Development roadmap](docs/ROADMAP.md)
- [Deployment guide](docs/DEPLOYMENT_RU.md)
- [Submission draft](docs/SUBMISSION.md)
- [Demo script](docs/DEMO_SCRIPT.md)
- [Security model](docs/SECURITY.md)
