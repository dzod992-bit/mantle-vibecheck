import { readFileSync } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import { extname, isAbsolute, relative, resolve } from "node:path";

import {
  analyzeSolidity,
  AuditCompilationError,
  type SolidityImportResolver,
} from "./analyzer";
import type {
  AuditReport,
  CompilationDiagnostic,
  FindingSeverity,
} from "./types";

export type FailureThreshold = FindingSeverity | "none";

export type FileScanResult =
  | {
      path: string;
      report: AuditReport;
      diagnostics: [];
    }
  | {
      path: string;
      report: null;
      diagnostics: CompilationDiagnostic[];
    };

export type ScanSummary = {
  files: number;
  findings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  compilationErrors: number;
};

const severityRank: Record<FindingSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export async function collectSolidityFiles(
  inputs: string[],
  cwd = process.cwd(),
): Promise<string[]> {
  const files = new Set<string>();

  for (const input of inputs) {
    await collectPath(resolve(cwd, input), files);
  }

  return [...files].sort((left, right) => left.localeCompare(right));
}

export async function scanSolidityFiles(
  files: string[],
  cwd = process.cwd(),
): Promise<FileScanResult[]> {
  const importResolver = createProjectImportResolver(cwd);

  return Promise.all(
    files.map(async (file) => {
      const source = await readFile(file, "utf8");
      const displayPath = normalizePath(relative(cwd, file) || file);

      try {
        return {
          path: displayPath,
          report: analyzeSolidity(source, displayPath, { importResolver }),
          diagnostics: [],
        };
      } catch (error) {
        if (error instanceof AuditCompilationError) {
          return {
            path: displayPath,
            report: null,
            diagnostics: error.diagnostics,
          };
        }
        throw error;
      }
    }),
  );
}

export function createProjectImportResolver(
  projectRoot: string,
): SolidityImportResolver {
  const root = resolve(projectRoot);
  const nodeModulesRoot = resolve(root, "node_modules");

  return (importPath) => {
    const candidates = importPath.startsWith("@")
      ? [resolve(nodeModulesRoot, importPath)]
      : [resolve(root, importPath), resolve(nodeModulesRoot, importPath)];

    for (const candidate of candidates) {
      if (!isWithinRoot(candidate, root)) {
        continue;
      }
      try {
        return { contents: readFileSync(candidate, "utf8") };
      } catch {
        // Try the next project-scoped candidate.
      }
    }

    return {
      error: `Import "${importPath}" was not found inside the project.`,
    };
  };
}

export function summarizeScan(results: FileScanResult[]): ScanSummary {
  return results.reduce<ScanSummary>(
    (summary, result) => {
      summary.files += 1;
      if (result.report === null) {
        summary.compilationErrors += 1;
        return summary;
      }

      summary.findings += result.report.summary.total;
      summary.critical += result.report.summary.critical;
      summary.high += result.report.summary.high;
      summary.medium += result.report.summary.medium;
      summary.low += result.report.summary.low;
      return summary;
    },
    {
      files: 0,
      findings: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      compilationErrors: 0,
    },
  );
}

export function violatesThreshold(
  results: FileScanResult[],
  threshold: FailureThreshold,
): boolean {
  if (threshold === "none") {
    return false;
  }

  const thresholdRank = severityRank[threshold];
  return results.some((result) =>
    result.report?.findings.some(
      (finding) => severityRank[finding.severity] <= thresholdRank,
    ),
  );
}

export function formatScanText(
  results: FileScanResult[],
  threshold: FailureThreshold,
): string {
  const lines = ["Mantle VibeCheck Solidity scan", ""];

  for (const result of results) {
    if (result.report === null) {
      lines.push(`[ERROR] ${result.path} did not compile`);
      for (const diagnostic of result.diagnostics) {
        const location =
          diagnostic.line === undefined
            ? ""
            : `:${diagnostic.line}:${diagnostic.column ?? 1}`;
        lines.push(`  ${location} ${diagnostic.message}`);
      }
      lines.push("");
      continue;
    }

    lines.push(
      `[${result.report.risk.toUpperCase()}] ${result.path} ` +
        `score=${result.report.score}/100 findings=${result.report.summary.total}`,
    );
    for (const finding of result.report.findings) {
      lines.push(
        `  ${finding.severity.toUpperCase()} ${finding.ruleId} ` +
          `L${finding.line}:${finding.column} ${finding.title}`,
      );
      lines.push(`    Fix: ${finding.remediation}`);
    }
    lines.push("");
  }

  const summary = summarizeScan(results);
  lines.push(
    `Scanned ${summary.files} file(s): ${summary.findings} finding(s), ` +
      `${summary.compilationErrors} compilation error(s).`,
  );
  lines.push(
    threshold === "none"
      ? "CI gate disabled (--fail-on none)."
      : `CI gate: fail on ${threshold} or higher.`,
  );

  return lines.join("\n");
}

async function collectPath(
  path: string,
  files: Set<string>,
): Promise<void> {
  const metadata = await stat(path);
  if (metadata.isFile()) {
    if (extname(path).toLowerCase() === ".sol") {
      files.add(path);
    }
    return;
  }

  if (!metadata.isDirectory()) {
    return;
  }

  const entries = await readdir(path, { withFileTypes: true });
  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    await collectPath(resolve(path, entry.name), files);
  }
}

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/");
}

function isWithinRoot(path: string, root: string): boolean {
  const pathFromRoot = relative(root, path);
  return (
    pathFromRoot === "" ||
    (!pathFromRoot.startsWith("..") && !isAbsolute(pathFromRoot))
  );
}
