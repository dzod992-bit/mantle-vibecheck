import solc from "solc";
import { keccak256, toHex } from "viem";

import type {
  AuditFinding,
  AuditReport,
  AuditRisk,
  CompilationDiagnostic,
  FindingSeverity,
} from "./types";

type AstNode = {
  id?: number;
  name?: string;
  nodeType?: string;
  src?: string;
  [key: string]: unknown;
};

type RuleContext = {
  source: string;
  stateVariableIds: Set<number>;
};

type SolcDiagnostic = {
  severity?: string;
  formattedMessage?: string;
  message?: string;
  sourceLocation?: {
    start?: number;
  };
};

type SolcOutput = {
  errors?: SolcDiagnostic[];
  sources?: Record<string, { ast?: AstNode }>;
};

export type SolidityImportResolver = (
  path: string,
) => { contents: string } | { error: string };

type AnalyzeOptions = {
  importResolver?: SolidityImportResolver;
};

const severityPenalty: Record<FindingSeverity, number> = {
  critical: 30,
  high: 18,
  medium: 8,
  low: 3,
};

const sensitiveFunctionPattern =
  /^(withdraw|sweep|rescue|mint|burn|upgrade|setOwner|setAdmin|pause|unpause|emergency)/i;

export class AuditCompilationError extends Error {
  constructor(public readonly diagnostics: CompilationDiagnostic[]) {
    super("Solidity compilation failed");
    this.name = "AuditCompilationError";
  }
}

export function analyzeSolidity(
  source: string,
  filename = "Contract.sol",
  options: AnalyzeOptions = {},
): AuditReport {
  const output = compileSource(source, filename, options.importResolver);
  const diagnostics = normalizeDiagnostics(source, output.errors ?? []);
  const errors = diagnostics.filter((diagnostic) => diagnostic.severity === "error");

  if (errors.length > 0) {
    throw new AuditCompilationError(errors);
  }

  const ast = output.sources?.[filename]?.ast;
  if (ast === undefined) {
    throw new AuditCompilationError([
      {
        severity: "error",
        message: "Compiler did not return a Solidity AST.",
      },
    ]);
  }

  const context = {
    source,
    stateVariableIds: collectStateVariableIds(ast),
  };
  const findings = deduplicateFindings([
    ...findFloatingPragma(source),
    ...findTxOrigin(ast, context),
    ...findSelfDestruct(ast, context),
    ...findDelegateCall(ast, context),
    ...findUncheckedLowLevelCalls(ast, context),
    ...findTransferUsage(ast, context),
    ...findWeakRandomness(ast, context),
    ...findRiskyLoops(ast, context),
    ...findMissingAccessControl(ast, context),
    ...findReentrancyPatterns(ast, context),
  ]).sort((left, right) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return (
      severityOrder[left.severity] - severityOrder[right.severity] ||
      left.line - right.line
    );
  });

  const summary = {
    critical: findings.filter((finding) => finding.severity === "critical").length,
    high: findings.filter((finding) => finding.severity === "high").length,
    medium: findings.filter((finding) => finding.severity === "medium").length,
    low: findings.filter((finding) => finding.severity === "low").length,
    total: findings.length,
  };
  const score = Math.max(
    0,
    100 -
      findings.reduce(
        (total, finding) => total + severityPenalty[finding.severity],
        0,
      ),
  );

  return {
    schemaVersion: "1.0",
    engineVersion: "rules-0.1.0",
    sourceHash: keccak256(toHex(source)),
    compilerVersion: solc.version(),
    filename,
    score,
    risk: deriveRisk(findings),
    summary,
    findings,
    diagnostics: diagnostics.filter(
      (diagnostic) => diagnostic.severity === "warning",
    ),
  };
}

function compileSource(
  source: string,
  filename: string,
  importResolver?: SolidityImportResolver,
): SolcOutput {
  const input = {
    language: "Solidity",
    sources: {
      [filename]: {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "": ["ast"],
          "*": ["abi"],
        },
      },
    },
  };

  const callbacks =
    importResolver === undefined ? undefined : { import: importResolver };
  return JSON.parse(
    solc.compile(JSON.stringify(input), callbacks),
  ) as SolcOutput;
}

function normalizeDiagnostics(
  source: string,
  diagnostics: SolcDiagnostic[],
): CompilationDiagnostic[] {
  return diagnostics
    .filter(
      (diagnostic) =>
        diagnostic.severity === "error" || diagnostic.severity === "warning",
    )
    .map((diagnostic) => {
      const location = getOffsetLocation(
        source,
        diagnostic.sourceLocation?.start ?? 0,
      );
      return {
        severity: diagnostic.severity as "error" | "warning",
        message:
          diagnostic.formattedMessage?.trim() ??
          diagnostic.message ??
          "Unknown compiler diagnostic",
        line: location.line,
        column: location.column,
      };
    });
}

function collectStateVariableIds(ast: AstNode): Set<number> {
  const ids = new Set<number>();
  visitAst(ast, (node) => {
    if (
      node.nodeType === "VariableDeclaration" &&
      node.stateVariable === true &&
      typeof node.id === "number"
    ) {
      ids.add(node.id);
    }
  });
  return ids;
}

function findFloatingPragma(source: string): AuditFinding[] {
  const match = source.match(/pragma\s+solidity\s+([^;]+);/);
  if (match === null || !/[\^><=*]/.test(match[1])) {
    return [];
  }

  const location = getOffsetLocation(source, match.index ?? 0);
  return [
    createFinding(
      "floating-pragma",
      "low",
      "high",
      "Compiler version is not pinned",
      "The Solidity pragma accepts a range of compiler versions.",
      "Different compiler releases can produce different bytecode or expose version-specific behavior.",
      "Pin the exact compiler version used for deployment and CI.",
      location,
      match[0],
    ),
  ];
}

function findTxOrigin(ast: AstNode, context: RuleContext): AuditFinding[] {
  return collectNodes(ast, (node) => {
    if (
      node.nodeType !== "MemberAccess" ||
      node.memberName !== "origin" ||
      !isIdentifier(node.expression, "tx")
    ) {
      return undefined;
    }

    return findingFromNode(
      context.source,
      node,
      "tx-origin-auth",
      "high",
      "high",
      "Authorization depends on tx.origin",
      "`tx.origin` identifies the transaction initiator, not the immediate caller.",
      "A malicious intermediary contract can cause an authorized user to execute a privileged action.",
      "Use `msg.sender` with explicit roles or an ownership module.",
    );
  });
}

function findSelfDestruct(ast: AstNode, context: RuleContext): AuditFinding[] {
  return collectNodes(ast, (node) => {
    if (
      node.nodeType !== "FunctionCall" ||
      (!isIdentifier(node.expression, "selfdestruct") &&
        !isIdentifier(node.expression, "suicide"))
    ) {
      return undefined;
    }

    return findingFromNode(
      context.source,
      node,
      "selfdestruct",
      "critical",
      "high",
      "Contract can invoke selfdestruct",
      "The contract contains an opcode path that can destroy or radically alter contract behavior.",
      "Funds and integrations may become inaccessible, and behavior differs across EVM upgrades.",
      "Remove selfdestruct and implement an explicit, access-controlled migration path.",
    );
  });
}

function findDelegateCall(ast: AstNode, context: RuleContext): AuditFinding[] {
  return collectNodes(ast, (node) => {
    if (node.nodeType !== "MemberAccess" || node.memberName !== "delegatecall") {
      return undefined;
    }

    return findingFromNode(
      context.source,
      node,
      "delegatecall",
      "high",
      "high",
      "Raw delegatecall changes caller storage",
      "The called code executes inside this contract's storage and authorization context.",
      "An incorrect or user-controlled target can overwrite ownership, balances, or implementation state.",
      "Use a reviewed proxy pattern and strictly allowlist implementation addresses.",
    );
  });
}

function findUncheckedLowLevelCalls(
  ast: AstNode,
  context: RuleContext,
): AuditFinding[] {
  return collectNodes(ast, (node) => {
    if (
      node.nodeType !== "ExpressionStatement" ||
      !containsNode(node, isLowLevelCall)
    ) {
      return undefined;
    }

    return findingFromNode(
      context.source,
      node,
      "unchecked-low-level-call",
      "high",
      "high",
      "Low-level call result is ignored",
      "A low-level call is executed as a standalone expression without checking its boolean result.",
      "The transaction can continue after a failed transfer or external operation.",
      "Capture the return value and revert when the call fails.",
    );
  });
}

function findTransferUsage(ast: AstNode, context: RuleContext): AuditFinding[] {
  return collectNodes(ast, (node) => {
    if (node.nodeType !== "MemberAccess" || node.memberName !== "transfer") {
      return undefined;
    }

    return findingFromNode(
      context.source,
      node,
      "transfer-stipend",
      "low",
      "high",
      "ETH transfer relies on a fixed gas stipend",
      "Solidity `transfer` forwards a fixed gas stipend to the recipient.",
      "Recipient contracts can become unable to receive funds after opcode repricing or when their receive logic needs more gas.",
      "Prefer a checked low-level call and protect the function against reentrancy.",
    );
  });
}

function findWeakRandomness(ast: AstNode, context: RuleContext): AuditFinding[] {
  return collectNodes(ast, (node) => {
    if (
      node.nodeType !== "FunctionCall" ||
      !isIdentifier(node.expression, "keccak256") ||
      !containsNode(node, isManipulableBlockValue)
    ) {
      return undefined;
    }

    return findingFromNode(
      context.source,
      node,
      "weak-randomness",
      "medium",
      "high",
      "Randomness uses manipulable block data",
      "A hash-based value includes timestamp, prevrandao, or blockhash as entropy.",
      "Block producers can influence outcomes, especially when meaningful value is at stake.",
      "Use a commit-reveal design or a verifiable randomness oracle.",
    );
  });
}

function findRiskyLoops(ast: AstNode, context: RuleContext): AuditFinding[] {
  return collectNodes(ast, (node) => {
    if (
      node.nodeType !== "ForStatement" &&
      node.nodeType !== "WhileStatement" &&
      node.nodeType !== "DoWhileStatement"
    ) {
      return undefined;
    }
    if (!containsNode(node.condition, isLengthAccess)) {
      return undefined;
    }
    if (
      !containsNode(node.body, (candidate) =>
        isStateMutation(candidate, context.stateVariableIds),
      ) &&
      !containsNode(node.body, isExternalValueCall)
    ) {
      return undefined;
    }

    return findingFromNode(
      context.source,
      node,
      "unbounded-loop",
      "medium",
      "medium",
      "Loop cost grows with an array length",
      "The loop iterates over a dynamic length while changing state or interacting externally.",
      "The function can exceed the block gas limit as the collection grows.",
      "Use pagination, pull-based processing, or a bounded batch size.",
    );
  });
}

function findMissingAccessControl(
  ast: AstNode,
  context: RuleContext,
): AuditFinding[] {
  return collectNodes(ast, (node) => {
    if (
      node.nodeType !== "FunctionDefinition" ||
      typeof node.name !== "string" ||
      !sensitiveFunctionPattern.test(node.name) ||
      (node.visibility !== "public" && node.visibility !== "external") ||
      node.stateMutability === "view" ||
      node.stateMutability === "pure"
    ) {
      return undefined;
    }

    const modifiers = Array.isArray(node.modifiers) ? node.modifiers : [];
    const hasSenderCheck =
      containsNode(node.body, isMsgSender) ||
      containsNode(node.body, (candidate) => isIdentifier(candidate, "_msgSender"));
    if (modifiers.length > 0 || hasSenderCheck) {
      return undefined;
    }

    return findingFromNode(
      context.source,
      node,
      "sensitive-function-access",
      "medium",
      "medium",
      "Sensitive function has no clear caller guard",
      `The externally callable \`${node.name}\` function has no modifier or direct sender check.`,
      "Unauthorized callers may be able to move funds or change privileged state.",
      "Apply an explicit role/ownership modifier and test unauthorized callers.",
    );
  });
}

function findReentrancyPatterns(
  ast: AstNode,
  context: RuleContext,
): AuditFinding[] {
  const findings: AuditFinding[] = [];

  visitAst(ast, (node) => {
    if (node.nodeType !== "FunctionDefinition") {
      return;
    }

    const body = asNode(node.body);
    const statements = Array.isArray(body?.statements)
      ? (body.statements as AstNode[])
      : [];
    let interaction: AstNode | undefined;

    for (const statement of statements) {
      if (
        interaction === undefined &&
        containsNode(statement, isExternalValueCall)
      ) {
        interaction = statement;
        continue;
      }

      if (
        interaction !== undefined &&
        containsNode(statement, (candidate) =>
          isStateMutation(candidate, context.stateVariableIds),
        )
      ) {
        findings.push(
          findingFromNode(
            context.source,
            interaction,
            "reentrancy-state-after-call",
            "critical",
            "high",
            "State changes after an external value call",
            "The function interacts with an external address before updating contract state.",
            "A recipient can re-enter the function while the old balance or authorization state is still active.",
            "Follow checks-effects-interactions and add a reentrancy guard where appropriate.",
          ),
        );
        break;
      }
    }
  });

  return findings;
}

function createFinding(
  ruleId: string,
  severity: FindingSeverity,
  confidence: "high" | "medium",
  title: string,
  description: string,
  impact: string,
  remediation: string,
  location: { line: number; column: number },
  evidence: string,
): AuditFinding {
  return {
    ruleId,
    severity,
    confidence,
    title,
    description,
    impact,
    remediation,
    line: location.line,
    column: location.column,
    evidence: compactEvidence(evidence),
  };
}

function findingFromNode(
  source: string,
  node: AstNode,
  ruleId: string,
  severity: FindingSeverity,
  confidence: "high" | "medium",
  title: string,
  description: string,
  impact: string,
  remediation: string,
): AuditFinding {
  const sourceSlice = getSourceSlice(source, node.src);
  return createFinding(
    ruleId,
    severity,
    confidence,
    title,
    description,
    impact,
    remediation,
    sourceSlice,
    sourceSlice.evidence,
  );
}

function deduplicateFindings(findings: AuditFinding[]): AuditFinding[] {
  const seen = new Set<string>();
  return findings.filter((finding) => {
    const key = `${finding.ruleId}:${finding.line}:${finding.column}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function deriveRisk(findings: AuditFinding[]): AuditRisk {
  const severities = new Set(findings.map((finding) => finding.severity));
  if (severities.has("critical")) return "critical";
  if (severities.has("high")) return "high";
  if (severities.has("medium")) return "medium";
  if (severities.has("low")) return "low";
  return "pass";
}

function collectNodes(
  root: unknown,
  collector: (node: AstNode) => AuditFinding | undefined,
): AuditFinding[] {
  const findings: AuditFinding[] = [];
  visitAst(root, (node) => {
    const finding = collector(node);
    if (finding !== undefined) {
      findings.push(finding);
    }
  });
  return findings;
}

function visitAst(root: unknown, visitor: (node: AstNode) => void): void {
  if (Array.isArray(root)) {
    for (const item of root) {
      visitAst(item, visitor);
    }
    return;
  }

  const node = asNode(root);
  if (node === undefined) {
    return;
  }

  if (typeof node.nodeType === "string") {
    visitor(node);
  }

  for (const value of Object.values(node)) {
    if (typeof value === "object" && value !== null) {
      visitAst(value, visitor);
    }
  }
}

function containsNode(
  root: unknown,
  predicate: (node: AstNode) => boolean,
): boolean {
  let match = false;
  visitAst(root, (node) => {
    if (!match && predicate(node)) {
      match = true;
    }
  });
  return match;
}

function isLowLevelCall(node: AstNode): boolean {
  return (
    node.nodeType === "MemberAccess" &&
    (node.memberName === "call" ||
      node.memberName === "delegatecall" ||
      node.memberName === "send")
  );
}

function isExternalValueCall(node: AstNode): boolean {
  return (
    node.nodeType === "MemberAccess" &&
    (node.memberName === "call" ||
      node.memberName === "send" ||
      node.memberName === "transfer")
  );
}

function isStateMutation(node: AstNode, stateVariableIds: Set<number>): boolean {
  if (node.nodeType === "Assignment") {
    return containsReferencedDeclaration(node.leftHandSide, stateVariableIds);
  }

  if (
    node.nodeType === "UnaryOperation" &&
    (node.operator === "++" || node.operator === "--")
  ) {
    return containsReferencedDeclaration(node.subExpression, stateVariableIds);
  }

  const expression = asNode(node.expression);
  if (
    node.nodeType === "FunctionCall" &&
    expression?.nodeType === "MemberAccess" &&
    (expression.memberName === "push" || expression.memberName === "pop")
  ) {
    return containsReferencedDeclaration(expression.expression, stateVariableIds);
  }

  return false;
}

function containsReferencedDeclaration(
  root: unknown,
  declarationIds: Set<number>,
): boolean {
  return containsNode(
    root,
    (node) =>
      typeof node.referencedDeclaration === "number" &&
      declarationIds.has(node.referencedDeclaration),
  );
}

function isManipulableBlockValue(node: AstNode): boolean {
  return (
    (node.nodeType === "MemberAccess" &&
      isIdentifier(node.expression, "block") &&
      (node.memberName === "timestamp" || node.memberName === "prevrandao")) ||
    (node.nodeType === "FunctionCall" && isIdentifier(node.expression, "blockhash"))
  );
}

function isLengthAccess(node: AstNode): boolean {
  return node.nodeType === "MemberAccess" && node.memberName === "length";
}

function isMsgSender(node: AstNode): boolean {
  return (
    node.nodeType === "MemberAccess" &&
    node.memberName === "sender" &&
    isIdentifier(node.expression, "msg")
  );
}

function isIdentifier(root: unknown, name: string): boolean {
  const node = asNode(root);
  return node?.nodeType === "Identifier" && node.name === name;
}

function asNode(value: unknown): AstNode | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }
  return value as AstNode;
}

function getSourceSlice(
  source: string,
  src: string | undefined,
): { line: number; column: number; evidence: string } {
  if (src === undefined) {
    return { line: 1, column: 1, evidence: "" };
  }

  const [startValue, lengthValue] = src.split(":");
  const start = Number.parseInt(startValue, 10);
  const length = Number.parseInt(lengthValue, 10);
  const location = getOffsetLocation(source, Number.isNaN(start) ? 0 : start);
  const evidence =
    Number.isNaN(start) || Number.isNaN(length)
      ? ""
      : source.slice(start, start + length);

  return { ...location, evidence };
}

function getOffsetLocation(
  source: string,
  offset: number,
): { line: number; column: number } {
  const prefix = source.slice(0, Math.max(0, offset));
  const lines = prefix.split("\n");
  return {
    line: lines.length,
    column: (lines.at(-1)?.length ?? 0) + 1,
  };
}

function compactEvidence(evidence: string): string {
  return evidence.replace(/\s+/g, " ").trim().slice(0, 180);
}
