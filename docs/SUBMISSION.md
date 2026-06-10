# Hackathon submission status

## Project

**Name:** Mantle VibeCheck

**Track:** AI DevTools

**Pitch:** AI-assisted security review and immutable audit proofs for Solidity
contracts built at vibe-coding speed.

## Ready

- Live demo:
  `https://mantle-vibecheck.vercel.app`
- Public GitHub:
  `https://github.com/dzod992-bit/mantle-vibecheck`
- Verified Mantle contract:
  `https://sepolia.mantlescan.xyz/address/0xdf8e3b1d7332903a0ac6ed11c078e0c35a62ff52#code`
- Sourcify exact match:
  `https://repo.sourcify.dev/5003/0xDf8E3b1D7332903a0aC6Ed11C078E0c35a62ff52`
- Public proof:
  `https://mantle-vibecheck.vercel.app/proof/0xe52b3cc268f564d3a19a22d58393c10da6709c97b42f9a082d442a8d4d728088`
- Demo proof transaction:
  `https://sepolia.mantlescan.xyz/tx/0x5e37439541426e58fffc56fc1cfb4265ea20824b1db19d79cd4e737e50858ad6`
- Dedicated signer rotation:
  `https://sepolia.mantlescan.xyz/tx/0x55a7f97eb657e8bdddd26b9ad04f76efa72afbccfbeae7d213674883469dba7f`
- Owner isolation:
  `https://sepolia.mantlescan.xyz/tx/0xdfd7143b58ed0d2b9831061612ad0a0e049310506cc6bd8d933be5dd34bfebff`

## Verification

- 17 unit and integration tests
- 5 smart-contract tests
- Local Solidity CLI with project import resolution
- GitHub Actions severity gate
- ESLint and TypeScript checks
- Production Next.js build
- Solidity 0.8.23, optimizer 200 runs
- MantleScan `Source Code Verified`, `Exact Match`
- Sourcify `exact_match`
- Production `/api/review` EIP-712 signature validated
- Public proof matched against Mantle registry

## Owner-only items

- Demo video URL: `TBD`
- X thread URL: `TBD`
- DoraHacks final submission: `TBD`

Use:

- `docs/DORAHACKS_SUBMISSION.md`
- `docs/VIDEO_SCRIPT_RU.md`
- `docs/X_THREAD.md`
- `docs/OWNER_CHECKLIST_RU.md`

## Limitation

Mantle VibeCheck is an early security review layer, not a replacement for a
professional audit, fuzzing, formal verification, invariant testing, or
economic review.
