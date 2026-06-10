import {
  collectSolidityFiles,
  formatScanText,
  scanSolidityFiles,
  summarizeScan,
  violatesThreshold,
  type FailureThreshold,
} from "../lib/audit/cli";

type OutputFormat = "text" | "json";

type CliOptions = {
  inputs: string[];
  failOn: FailureThreshold;
  format: OutputFormat;
  help: boolean;
};

const helpText = `Mantle VibeCheck CLI

Usage:
  npm run scan -- [paths...] [options]

Options:
  --fail-on <severity>  Fail on critical, high, medium, low, or none (default: high)
  --format <format>     Print text or json (default: text)
  --help                Show this help

Examples:
  npm run scan -- contracts
  npm run scan -- contracts src --fail-on critical
  npm run scan -- contracts --format json --fail-on none`;

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(helpText);
    return;
  }

  const files = await collectSolidityFiles(options.inputs);
  if (files.length === 0) {
    throw new Error("No Solidity files were found in the supplied paths.");
  }

  const results = await scanSolidityFiles(files);
  const summary = summarizeScan(results);
  const thresholdViolated = violatesThreshold(results, options.failOn);
  const hasCompilationErrors = summary.compilationErrors > 0;

  if (options.format === "json") {
    console.log(
      JSON.stringify(
        {
          schemaVersion: "1.0",
          engine: "Mantle VibeCheck",
          failOn: options.failOn,
          passed: !thresholdViolated && !hasCompilationErrors,
          summary,
          files: results,
        },
        null,
        2,
      ),
    );
  } else {
    console.log(formatScanText(results, options.failOn));
  }

  process.exitCode = hasCompilationErrors ? 2 : thresholdViolated ? 1 : 0;
}

function parseArgs(args: string[]): CliOptions {
  const inputs: string[] = [];
  let failOn: FailureThreshold = "high";
  let format: OutputFormat = "text";
  let help = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--help" || argument === "-h") {
      help = true;
      continue;
    }

    if (argument === "--fail-on") {
      failOn = parseFailureThreshold(args[++index]);
      continue;
    }
    if (argument.startsWith("--fail-on=")) {
      failOn = parseFailureThreshold(argument.slice("--fail-on=".length));
      continue;
    }

    if (argument === "--format") {
      format = parseFormat(args[++index]);
      continue;
    }
    if (argument.startsWith("--format=")) {
      format = parseFormat(argument.slice("--format=".length));
      continue;
    }

    if (argument.startsWith("-")) {
      throw new Error(`Unknown option: ${argument}`);
    }
    inputs.push(argument);
  }

  return {
    inputs: inputs.length > 0 ? inputs : ["contracts"],
    failOn,
    format,
    help,
  };
}

function parseFailureThreshold(value: string | undefined): FailureThreshold {
  if (
    value === "critical" ||
    value === "high" ||
    value === "medium" ||
    value === "low" ||
    value === "none"
  ) {
    return value;
  }
  throw new Error(
    "--fail-on must be critical, high, medium, low, or none.",
  );
}

function parseFormat(value: string | undefined): OutputFormat {
  if (value === "text" || value === "json") {
    return value;
  }
  throw new Error("--format must be text or json.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown CLI error";
  console.error(`VibeCheck failed: ${message}`);
  process.exitCode = 2;
});
