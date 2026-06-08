# Development roadmap

Target submission date: June 15, 2026.

## Iteration 1 - Product foundation

- Next.js application and visual system
- Interactive contract editor and demo report
- Architecture and owner checklist
- Local lint, typecheck, and production build

Exit condition: a polished product shell runs locally and communicates the
full user flow.

## Iteration 2 - On-chain audit registry

- Hardhat project
- `AuditRegistry` contract
- EIP-712 or equivalent signer authorization
- Contract tests and deployment scripts
- Frontend read model for published proofs

Exit condition: a signed audit result can be recorded and queried locally.

## Iteration 3 - Deterministic Solidity analysis

- Solidity compilation and AST extraction
- Initial security rule set
- Stable finding schema and severity scoring
- API endpoint and automated tests
- UI wired to real findings

Exit condition: the sample vulnerable contract produces a real, repeatable
report without an AI provider.

## Iteration 4 - AI reasoning and remediation

- Provider-neutral AI interface
- Structured threat model output
- Suggested patch and code diff
- Prompt-injection and output-validation controls
- Signed report payload ready for on-chain publication

Exit condition: a user can scan, review, and publish a complete audit report.

## Iteration 5 - Testnet and submission release

- Mantle Sepolia deployment and explorer verification
- Public frontend deployment
- End-to-end test and security review
- Demo video script, README, architecture diagram, pitch, and X thread
- DoraHacks submission checklist

Exit condition: all Deployment Award requirements are satisfied and the
submission package is ready before the deadline.

Status: completed in commit `2710ad7`.

## Iteration 6 - Production signer isolation

- Dedicated audit signer without funds
- On-chain trusted signer rotation
- Owner key excluded from production hosting
- Rotation scripts and deployment metadata

Status: completed in commit `91cf0a7`.

## Iteration 7 - Hardened production deployment

- Vercel production environment
- `.env` excluded from deployment upload
- Owner wallet rotation after unsafe upload
- Production API and public proof smoke tests

Status: completed in commit `472f3fa`.

## Iteration 8 - Verification and submission package

- Sourcify exact-match automation
- MantleScan verified-source confirmation
- DoraHacks form copy
- Demo video script
- Mandatory X thread
- Final owner checklist

Exit condition: repository, demo, contract, proof, verification, and
submission copy are public; only owner-authenticated posting remains.

## Scope controls

The hackathon MVP is not a replacement for a professional audit. It focuses
on a small number of high-confidence checks, transparent limitations, and a
verifiable review trail.
