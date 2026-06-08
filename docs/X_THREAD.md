# X thread

Publish from the project owner's public account. Replace
`[DEMO_VIDEO_URL]` before posting.

## Post 1

We built Mantle VibeCheck for #MantleAIHackathon by @Mantle_Official.

AI can generate Solidity in seconds. VibeCheck finds high-confidence security
risks, explains and patches them, then publishes a verifiable audit proof on
Mantle.

Demo: https://mantle-vibecheck.vercel.app

[Attach demo video: `[DEMO_VIDEO_URL]`]

## Post 2

The scanner begins with reproducible analysis, not an AI guess:

- Solidity 0.8.23 AST
- reentrancy and call-order checks
- authorization risks such as tx.origin
- dangerous low-level calls
- line-level evidence and deterministic scoring

[Attach findings screenshot]

## Post 3

AI converts those findings into a structured threat model and focused
remediation.

Source comments are untrusted input, output must pass a strict schema, and the
product transparently falls back to deterministic reasoning when no model is
configured.

[Attach threat-model screenshot]

## Post 4

Each publishable review is bound to its code hash, report hash, model hash,
score, severity counts, publisher, expiry, and nonce.

The backend signs the EIP-712 payload. The user publishes it from their own
wallet, so the app cannot silently rewrite the on-chain result.

## Post 5

The proof lives in AuditRegistry on Mantle Sepolia.

The contract is source-verified with an exact bytecode match, and the public
proof page reads Mantle state directly instead of trusting a private database
or editable PDF.

Contract:
https://sepolia.mantlescan.xyz/address/0xdf8e3b1d7332903a0ac6ed11c078e0c35a62ff52#code

## Post 6

Try Mantle VibeCheck:
https://mantle-vibecheck.vercel.app

GitHub:
https://github.com/dzod992-bit/mantle-vibecheck

Public proof:
https://mantle-vibecheck.vercel.app/proof/0xe52b3cc268f564d3a19a22d58393c10da6709c97b42f9a082d442a8d4d728088

Built for the AI DevTools track. #MantleAIHackathon
