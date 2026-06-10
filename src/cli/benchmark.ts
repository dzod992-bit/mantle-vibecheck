import {
  formatBenchmarkText,
  runBenchmark,
} from "../lib/audit/benchmark";

async function main() {
  const format = parseFormat(process.argv.slice(2));
  const result = await runBenchmark();

  console.log(
    format === "json"
      ? JSON.stringify(result, null, 2)
      : formatBenchmarkText(result),
  );
  process.exitCode = result.passed ? 0 : 1;
}

function parseFormat(args: string[]): "text" | "json" {
  if (args.length === 0) {
    return "text";
  }
  if (args.length === 2 && args[0] === "--format") {
    return validateFormat(args[1]);
  }
  if (args.length === 1 && args[0].startsWith("--format=")) {
    return validateFormat(args[0].slice("--format=".length));
  }
  throw new Error("Usage: npm run benchmark -- [--format text|json]");
}

function validateFormat(value: string | undefined): "text" | "json" {
  if (value === "text" || value === "json") {
    return value;
  }
  throw new Error("--format must be text or json.");
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Unknown benchmark error";
  console.error(`Benchmark failed: ${message}`);
  process.exitCode = 2;
});
