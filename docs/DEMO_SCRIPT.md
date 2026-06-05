# Demo video script

Target duration: 2 minutes 30 seconds.

## 0:00-0:20 - Problem

"AI can write a Solidity contract in seconds, but developers still need to
understand whether that contract can lose funds. Mantle VibeCheck turns a fast
AI-generated contract into a structured, verifiable security review."

Show the landing page and the vulnerable `VibeVault` sample.

## 0:20-0:55 - Deterministic scan

Click `Run VibeCheck`.

Show:

- compilation with Solidity 0.8.23;
- reentrancy finding;
- `tx.origin` authorization finding;
- exact line and source evidence;
- deterministic score.

Say that the engine uses the Solidity AST rather than asking a model to guess
whether code is vulnerable.

## 0:55-1:30 - AI threat model

Click `Generate AI threat model`.

Show:

- executive summary;
- protected assets and threats;
- remediation controls;
- patched Solidity preview.

Explain that source comments are untrusted input and AI JSON is schema
validated. If the provider fails, the interface clearly labels fallback mode.

## 1:30-2:05 - Mantle proof

Connect the dedicated testnet wallet.

Show:

- chain switched to Mantle Sepolia;
- signed proof request;
- `Publish proof on Mantle`;
- wallet confirmation;
- confirmed transaction in MantleScan.

Explain that code hash, report hash, model hash, score, counts, publisher,
timestamp, and nonce are bound by EIP-712.

## 2:05-2:25 - Public verification

Open `/proof/<auditId>`.

Show that the page reads the immutable record directly from Mantle and links to
the verified registry contract.

## 2:25-2:30 - Close

"Mantle VibeCheck helps developers ship at AI speed without asking users to
trust an editable security badge."
