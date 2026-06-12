# Hackathon release freeze

Release candidate: `v1.2.0-hackathon`

Freeze date: June 10, 2026

Submission deadline: June 15, 2026

## Public evidence

| Surface | URL | Freeze check |
| --- | --- | --- |
| Product | https://mantle-vibecheck.vercel.app | HTTP 200 |
| Judge Center | https://mantle-vibecheck.vercel.app/judges | HTTP 200 |
| Public proof | https://mantle-vibecheck.vercel.app/proof/0xe52b3cc268f564d3a19a22d58393c10da6709c97b42f9a082d442a8d4d728088 | HTTP 200 |
| GitHub | https://github.com/dzod992-bit/mantle-vibecheck | Public, main branch |
| Verified registry | https://sepolia.mantlescan.xyz/address/0xdf8e3b1d7332903a0ac6ed11c078e0c35a62ff52#code | HTTP 200, exact match |
| Sourcify | https://repo.sourcify.dev/5003/0xDf8E3b1D7332903a0aC6Ed11C078E0c35a62ff52 | HTTP 200, exact match |

## Verification snapshot

- 18 unit and integration tests pass.
- 5 smart-contract tests pass.
- ESLint and TypeScript checks pass.
- Next.js production build passes.
- `npm audit --audit-level=moderate` reports zero vulnerabilities.
- Solidity CLI passes the production `AuditRegistry` with a 100/100 score.
- GitHub Actions CI and the focused VibeCheck workflow pass.
- Benchmark: 6/6 exact cases, 11 TP, 0 FP, 0 FN.
- Desktop and 390px mobile Judge Center QA show no horizontal overflow.
- Production browser console contains no errors.
- Public proof EIP-712 signature matches the trusted signer.
- Derived audit ID matches the signed proof.
- No `.env` file is tracked by Git.

## Known limitation

The configured OpenAI key is valid, but the provider currently returns
`insufficient_quota`. Production therefore uses the visible deterministic
fallback. This does not block the scanner, CLI, benchmark, signed proof, or
submission. Adding OpenAI API balance later enables live reasoning without a
code change.

## Change policy

After this freeze, only accept:

- broken-link fixes;
- submission text or video-link updates;
- critical security fixes;
- a verified OpenAI billing configuration change.

Do not add new product scope before submission.
