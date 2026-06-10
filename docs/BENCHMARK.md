# Reproducible rule benchmark

Mantle VibeCheck includes a versioned, rule-level regression corpus for the
deterministic Solidity engine. The benchmark is intentionally small and
auditable: every source file and expected rule ID is committed to the public
repository.

## Reproduce

```bash
npm ci
npm run benchmark
npm run benchmark -- --format json
```

The `VibeCheck Solidity` GitHub Actions workflow runs the same command. Any
false positive, false negative, or non-exact case match fails the workflow.

## Current result

Engine: `rules-0.1.0`

| Metric | Result |
| --- | ---: |
| Benchmark cases | 6 |
| Deterministic rules covered | 10 / 10 |
| Expected rule findings | 11 |
| True positives | 11 |
| False positives | 0 |
| False negatives | 0 |
| Precision on this corpus | 100.0% |
| Recall on this corpus | 100.0% |
| Exact case matches | 6 / 6 |

## Cases

| Case | Expected evidence |
| --- | --- |
| SafeVault | No findings; checks-effects-interactions negative control |
| VulnerableVault | Reentrancy, `tx.origin`, missing access control, floating pragma, `transfer` |
| UnsafeCalls | Ignored low-level call and `selfdestruct` |
| DelegateExecutor | Raw `delegatecall` and ignored low-level result |
| WeakLottery | Manipulable block-data randomness |
| UnboundedDistributor | Dynamic loop with state mutation |

The exact labels live in
[`benchmark/manifest.json`](../benchmark/manifest.json), and the corresponding
contracts live in [`benchmark/contracts`](../benchmark/contracts).

## Interpretation

These numbers are regression evidence, not a claim of universal audit
accuracy. The corpus demonstrates that the 10 documented high-confidence
rules behave repeatably on their explicit positive and negative controls. It
does not measure unseen vulnerability classes, protocol economics, invariant
violations, or adversarial false-positive rates across production codebases.

Professional review, fuzzing, invariant testing, and formal methods remain
necessary before deploying contracts that hold meaningful value.
