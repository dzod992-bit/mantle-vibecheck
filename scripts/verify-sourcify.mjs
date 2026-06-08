import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const SOURCIFY_SERVER = "https://sourcify.dev/server";
const COMPILER_VERSION = "0.8.23+commit.f704f362";
const CONTRACT_IDENTIFIER =
  "project/contracts/AuditRegistry.sol:AuditRegistry";
const MAX_POLLS = 30;
const POLL_INTERVAL_MS = 2_000;

const deployment = JSON.parse(
  await readFile(resolve("deployments", "mantleSepolia.json"), "utf8"),
);
const stdJsonInput = JSON.parse(
  await readFile(resolve("AuditRegistry.standard-input.json"), "utf8"),
);

const contractUrl =
  `${SOURCIFY_SERVER}/v2/contract/${deployment.chainId}/` +
  `${deployment.address}?fields=all`;

function containsValue(value, expected) {
  if (value === expected) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.some((item) => containsValue(item, expected));
  }
  if (value !== null && typeof value === "object") {
    return Object.values(value).some((item) =>
      containsValue(item, expected),
    );
  }
  return false;
}

async function readJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Sourcify returned HTTP ${response.status}: ${text.slice(0, 500)}`,
    );
  }
}

async function lookupExactMatch() {
  const response = await fetch(contractUrl);
  if (response.status === 404) {
    return false;
  }
  const result = await readJson(response);
  if (!response.ok) {
    throw new Error(`Sourcify lookup failed: ${JSON.stringify(result)}`);
  }
  return containsValue(result, "exact_match");
}

if (await lookupExactMatch()) {
  console.log(`Sourcify exact match confirmed: ${contractUrl}`);
  process.exit(0);
}

const verificationResponse = await fetch(
  `${SOURCIFY_SERVER}/v2/verify/${deployment.chainId}/${deployment.address}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      stdJsonInput,
      compilerVersion: COMPILER_VERSION,
      contractIdentifier: CONTRACT_IDENTIFIER,
      creationTransactionHash: deployment.transactionHash,
    }),
  },
);
const verificationResult = await readJson(verificationResponse);

if (!verificationResponse.ok) {
  throw new Error(
    `Sourcify verification failed: ${JSON.stringify(verificationResult)}`,
  );
}

if (containsValue(verificationResult, "exact_match")) {
  console.log(`Sourcify exact match confirmed: ${contractUrl}`);
  process.exit(0);
}

const verificationId = verificationResult.verificationId;
if (!verificationId) {
  throw new Error(
    `Sourcify did not return a verification ID: ` +
      JSON.stringify(verificationResult),
  );
}

const statusUrl = `${SOURCIFY_SERVER}/v2/verify/${verificationId}`;
for (let attempt = 1; attempt <= MAX_POLLS; attempt += 1) {
  await new Promise((resolvePromise) =>
    setTimeout(resolvePromise, POLL_INTERVAL_MS),
  );

  const statusResponse = await fetch(statusUrl);
  const statusResult = await readJson(statusResponse);
  if (!statusResponse.ok) {
    throw new Error(
      `Sourcify status lookup failed: ${JSON.stringify(statusResult)}`,
    );
  }
  if (containsValue(statusResult, "exact_match")) {
    console.log(`Sourcify exact match confirmed: ${contractUrl}`);
    process.exit(0);
  }
  if (
    containsValue(statusResult, "failed") ||
    containsValue(statusResult, "error")
  ) {
    throw new Error(
      `Sourcify verification job failed: ${JSON.stringify(statusResult)}`,
    );
  }
}

throw new Error(
  `Sourcify verification did not finish within ` +
    `${(MAX_POLLS * POLL_INTERVAL_MS) / 1_000} seconds. Check ${statusUrl}`,
);
