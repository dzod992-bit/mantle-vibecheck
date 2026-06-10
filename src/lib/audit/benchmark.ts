import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { z } from "zod";

import { analyzeSolidity } from "./analyzer";
import { createProjectImportResolver } from "./cli";

const manifestSchema = z.object({
  schemaVersion: z.literal("1.0"),
  cases: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        file: z.string().regex(/\.sol$/),
        expectedRuleIds: z.array(z.string().min(1)),
      }),
    )
    .min(1),
});

export type BenchmarkCaseResult = {
  id: string;
  title: string;
  file: string;
  expectedRuleIds: string[];
  actualRuleIds: string[];
  truePositives: string[];
  falsePositives: string[];
  falseNegatives: string[];
  passed: boolean;
};

export type BenchmarkResult = {
  schemaVersion: "1.0";
  engineVersion: string;
  cases: BenchmarkCaseResult[];
  summary: {
    cases: number;
    passedCases: number;
    expectedFindings: number;
    actualFindings: number;
    truePositives: number;
    falsePositives: number;
    falseNegatives: number;
    precision: number;
    recall: number;
    exactMatchRate: number;
  };
  passed: boolean;
};

export async function runBenchmark(
  manifestPath = "benchmark/manifest.json",
  cwd = process.cwd(),
): Promise<BenchmarkResult> {
  const manifest = manifestSchema.parse(
    JSON.parse(await readFile(resolve(cwd, manifestPath), "utf8")),
  );
  const importResolver = createProjectImportResolver(cwd);
  let engineVersion = "unknown";

  const cases = await Promise.all(
    manifest.cases.map(async (benchmarkCase) => {
      const source = await readFile(resolve(cwd, benchmarkCase.file), "utf8");
      const report = analyzeSolidity(source, benchmarkCase.file, {
        importResolver,
      });
      engineVersion = report.engineVersion;
      return evaluateCase(
        benchmarkCase.id,
        benchmarkCase.title,
        benchmarkCase.file,
        benchmarkCase.expectedRuleIds,
        report.findings.map((finding) => finding.ruleId),
      );
    }),
  );

  const totals = cases.reduce(
    (summary, benchmarkCase) => {
      summary.expectedFindings += benchmarkCase.expectedRuleIds.length;
      summary.actualFindings += benchmarkCase.actualRuleIds.length;
      summary.truePositives += benchmarkCase.truePositives.length;
      summary.falsePositives += benchmarkCase.falsePositives.length;
      summary.falseNegatives += benchmarkCase.falseNegatives.length;
      summary.passedCases += benchmarkCase.passed ? 1 : 0;
      return summary;
    },
    {
      passedCases: 0,
      expectedFindings: 0,
      actualFindings: 0,
      truePositives: 0,
      falsePositives: 0,
      falseNegatives: 0,
    },
  );

  const precision = ratio(
    totals.truePositives,
    totals.truePositives + totals.falsePositives,
  );
  const recall = ratio(
    totals.truePositives,
    totals.truePositives + totals.falseNegatives,
  );
  const exactMatchRate = ratio(totals.passedCases, cases.length);

  return {
    schemaVersion: "1.0",
    engineVersion,
    cases,
    summary: {
      cases: cases.length,
      ...totals,
      precision,
      recall,
      exactMatchRate,
    },
    passed: cases.every((benchmarkCase) => benchmarkCase.passed),
  };
}

export function formatBenchmarkText(result: BenchmarkResult): string {
  const lines = [
    `Mantle VibeCheck benchmark (${result.engineVersion})`,
    "",
  ];

  for (const benchmarkCase of result.cases) {
    lines.push(
      `[${benchmarkCase.passed ? "PASS" : "FAIL"}] ${benchmarkCase.id}: ` +
        `${benchmarkCase.title}`,
    );
    lines.push(
      `  expected=${formatRuleList(benchmarkCase.expectedRuleIds)} ` +
        `actual=${formatRuleList(benchmarkCase.actualRuleIds)}`,
    );
    if (benchmarkCase.falsePositives.length > 0) {
      lines.push(
        `  false positives: ${benchmarkCase.falsePositives.join(", ")}`,
      );
    }
    if (benchmarkCase.falseNegatives.length > 0) {
      lines.push(
        `  false negatives: ${benchmarkCase.falseNegatives.join(", ")}`,
      );
    }
  }

  lines.push("");
  lines.push(
    `${result.summary.passedCases}/${result.summary.cases} exact case matches`,
  );
  lines.push(
    `TP=${result.summary.truePositives} FP=${result.summary.falsePositives} ` +
      `FN=${result.summary.falseNegatives}`,
  );
  lines.push(
    `precision=${formatPercent(result.summary.precision)} ` +
      `recall=${formatPercent(result.summary.recall)} ` +
      `exact-match=${formatPercent(result.summary.exactMatchRate)}`,
  );

  return lines.join("\n");
}

function evaluateCase(
  id: string,
  title: string,
  file: string,
  expected: string[],
  actual: string[],
): BenchmarkCaseResult {
  const expectedRuleIds = uniqueSorted(expected);
  const actualRuleIds = uniqueSorted(actual);
  const expectedSet = new Set(expectedRuleIds);
  const actualSet = new Set(actualRuleIds);
  const truePositives = expectedRuleIds.filter((ruleId) =>
    actualSet.has(ruleId),
  );
  const falsePositives = actualRuleIds.filter(
    (ruleId) => !expectedSet.has(ruleId),
  );
  const falseNegatives = expectedRuleIds.filter(
    (ruleId) => !actualSet.has(ruleId),
  );

  return {
    id,
    title,
    file,
    expectedRuleIds,
    actualRuleIds,
    truePositives,
    falsePositives,
    falseNegatives,
    passed: falsePositives.length === 0 && falseNegatives.length === 0,
  };
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function ratio(numerator: number, denominator: number): number {
  return denominator === 0 ? 1 : numerator / denominator;
}

function formatRuleList(ruleIds: string[]): string {
  return ruleIds.length === 0 ? "none" : ruleIds.join(",");
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
