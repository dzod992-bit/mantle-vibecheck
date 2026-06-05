# Hackathon submission draft

## Project

**Name:** Mantle VibeCheck

**One-line pitch:** AI-assisted security review and immutable audit proofs for
Solidity contracts built at vibe-coding speed.

## Problem

AI coding tools let developers create Solidity contracts faster than they can
understand their security assumptions. Existing scanners often return noisy,
opaque output, while an editable PDF or dashboard does not prove which source
code was actually reviewed.

## Solution

Mantle VibeCheck combines:

1. deterministic Solidity AST checks with line-level evidence;
2. a schema-validated AI threat model and remediation plan;
3. a patched-source preview;
4. an EIP-712 signed report;
5. an immutable `AuditRegistry` record on Mantle;
6. a public proof page that reads the record directly from the chain.

## Why Mantle

- Mantle is the settlement and verification layer for every published audit.
- Low-cost transactions make one proof per code revision practical.
- The product directly supports Mantle builders shipping Solidity contracts.
- The public verifier reads Mantle state rather than trusting an application
  database.

## AI role

AI is not a decorative chatbot. It converts deterministic findings into a
coherent threat model, proposes focused remediation, and produces a structured
review that is validated before its hash can be signed and published.

Source code and comments are treated as untrusted input. Model output must pass
a strict schema. If the provider is missing or returns invalid output, the
product transparently switches to a deterministic fallback instead of
inventing a result.

## Technical architecture

```text
Solidity source
  -> solc 0.8.23 AST
  -> deterministic rule engine
  -> validated AI review
  -> canonical report hash
  -> EIP-712 server signature
  -> user wallet transaction
  -> AuditRegistry on Mantle Sepolia
  -> public on-chain proof page
```

## Track and awards

- Primary: AI DevTools
- Additional eligibility: Best UI/UX
- Target: Deployment Award

## Current verification

- Unit tests: 9
- Smart contract tests: 5
- Lint, TypeScript, production build, and npm audit included in CI
- Contract compiler: Solidity 0.8.23 with optimizer enabled, 200 runs

## Links to fill before submission

- Demo: `TBD`
- GitHub: `TBD`
- Demo video: `TBD`
- Mantle contract: `TBD`
- Public proof: `TBD`
- X thread: `TBD`

## Limitations

Mantle VibeCheck is not a replacement for a professional security audit,
fuzzing, formal verification, invariant tests, or economic review. Its purpose
is to catch common high-impact mistakes earlier and make each review
verifiable.
