# X thread draft

## Post 1

We built Mantle VibeCheck for #MantleAIHackathon.

AI can generate Solidity in seconds. VibeCheck helps builders understand the
risk, patch the code, and publish an immutable audit proof on Mantle.

[DEMO VIDEO]

## Post 2

The scanner starts with deterministic analysis, not an AI guess:

- solc 0.8.23 AST
- reentrancy and call-order checks
- authorization risks
- dangerous low-level calls
- line-level evidence and reproducible scoring

[SCREENSHOT: findings]

## Post 3

AI turns verified findings into a threat model and focused remediation.

Source comments are treated as untrusted input. Output is schema validated. If
the model fails, the UI explicitly switches to a deterministic fallback.

[SCREENSHOT: threat model]

## Post 4

Every publishable report is bound to:

- code hash
- report hash
- model hash
- score and severity counts
- publisher, expiry, and nonce

The backend signs this payload with EIP-712. The user publishes it through
their own wallet.

## Post 5

The final proof lives in `AuditRegistry` on Mantle Sepolia.

Anyone can open `/proof/<auditId>` and read the immutable record directly from
Mantle instead of trusting our database or a mutable PDF.

[MANTLESCAN CONTRACT]

## Post 6

Demo: [URL]
GitHub: [URL]
Contract: [URL]
Public proof: [URL]

Built for the AI DevTools track, with a focus on real Mantle utility,
transparent AI, and Web2-friendly UX.
