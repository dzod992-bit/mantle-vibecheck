# DoraHacks submission

## Basic fields

**Project name:** Mantle VibeCheck

**Track:** AI DevTools

**Tagline:** Ship Solidity at AI speed with security findings and immutable
audit proofs on Mantle.

**Demo:** https://mantle-vibecheck.vercel.app

**Repository:** https://github.com/dzod992-bit/mantle-vibecheck

**Contract:**
https://sepolia.mantlescan.xyz/address/0xdf8e3b1d7332903a0ac6ed11c078e0c35a62ff52#code

**Demo video:** `[DEMO_VIDEO_URL]`

**X thread:** `[X_THREAD_URL]`

## Short description

Mantle VibeCheck is an AI-assisted security review tool for Solidity contracts
created through rapid and AI-assisted development. It combines reproducible
AST checks, a validated threat model, focused remediation, EIP-712 signatures,
and an immutable audit record on Mantle.

## Problem

AI coding tools let developers create smart contracts faster than they can
understand their security assumptions. Existing scanners often return noisy
output, while a mutable dashboard or PDF cannot prove which exact source code
was reviewed.

## Solution

Mantle VibeCheck follows one evidence-based flow:

1. Compile Solidity 0.8.23 and inspect its AST.
2. Run deterministic high-confidence security rules.
3. Convert findings into a schema-validated threat model and patch.
4. Hash the source and canonical report.
5. Sign the audit payload with EIP-712.
6. Let the developer publish the proof from their wallet.
7. Verify the immutable record through a public Mantle-backed proof page.

## Why Mantle

Mantle is the settlement and verification layer for each published review.
Low transaction costs make one proof per source revision practical. The
product serves Mantle builders directly, and its verifier reads Mantle state
instead of trusting an application database.

## AI implementation

AI is used for structured security reasoning, not decorative chat. It receives
deterministic findings and produces an executive summary, assets, threats,
controls, and a patched-source proposal. Source code is treated as untrusted
input and the result must pass a strict schema before it can enter a signed
report. If the provider is absent or invalid, the app exposes a deterministic
fallback.

## Technical architecture

```text
Solidity source
  -> solc 0.8.23 AST
  -> deterministic security rules
  -> validated AI threat model and remediation
  -> canonical report hash
  -> EIP-712 server signature
  -> user wallet transaction
  -> AuditRegistry on Mantle Sepolia
  -> public on-chain proof page
```

## Innovation

- Security findings remain reproducible and are not delegated to an LLM.
- AI output is constrained, validated, and visibly replaceable by fallback.
- Every report is cryptographically bound to the exact code revision.
- The user controls publication through their wallet.
- Anyone can verify the result without trusting the VibeCheck backend.

## Validation

- 9 unit tests and 5 contract tests
- CI covers compile, lint, typecheck, tests, build, and dependency audit
- Production API signature validated against the on-chain trusted signer
- Demo proof confirmed through the public verifier
- Contract source verified as an exact bytecode match on MantleScan and
  Sourcify

## Business potential

The initial wedge is a free pre-deployment check for AI-assisted Solidity
builders. A hosted product can add private repositories, team policies,
continuous pull-request reviews, historical proof dashboards, and paid
professional review escalation. Protocols and developer platforms can consume
the proof format as a machine-readable release gate.

## Limitations

Mantle VibeCheck is not a replacement for a professional audit, fuzzing,
formal verification, invariant testing, or economic review. It catches common
high-impact mistakes earlier and makes the resulting review verifiable.
