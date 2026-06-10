import { describe, expect, it } from "vitest";

import { runBenchmark } from "./benchmark";

describe("VibeCheck benchmark", () => {
  it("matches every versioned benchmark case exactly", async () => {
    const result = await runBenchmark();

    expect(result.passed).toBe(true);
    expect(result.summary.cases).toBe(6);
    expect(result.summary.expectedFindings).toBe(11);
    expect(result.summary.truePositives).toBe(11);
    expect(result.summary.falsePositives).toBe(0);
    expect(result.summary.falseNegatives).toBe(0);
    expect(result.summary.precision).toBe(1);
    expect(result.summary.recall).toBe(1);
    expect(result.summary.exactMatchRate).toBe(1);
  });
});
