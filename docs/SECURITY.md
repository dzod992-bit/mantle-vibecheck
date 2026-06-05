# Security model

## Trust boundaries

- Solidity source is untrusted.
- Solidity comments cannot modify AI instructions.
- AI output is untrusted until it passes the Zod schema.
- Browser-provided deterministic reports are ignored; the server recompiles
  source before creating a review or proof.
- A proof is publishable only when signed by the registry's trusted signer.
- The contract binds the proof to `msg.sender`, expiry, and a one-time nonce.

## Application controls

- Source and request sizes are bounded.
- Audit and AI endpoints have best-effort fixed-window rate limits.
- Security headers restrict framing, content types, permissions, and origins.
- Secrets are server-only and excluded from Git.
- AI failures fall back explicitly rather than returning unvalidated text.

## Contract controls

- EIP-712 domain separation.
- ECDSA trusted-signer verification.
- Publisher binding.
- Nonce replay protection.
- Expiring signatures.
- Score and hash validation.
- Owner-controlled signer rotation.

## Known limitations

- In-memory rate limits are per server instance. Production abuse protection
  should also use Vercel Firewall, a durable rate-limit store, or both.
- Static analysis is intentionally narrow and can produce false negatives.
- AI remediation must be reviewed and retested before deployment.
- The hackathon testnet signer is a hot key. Production should use KMS or HSM.
