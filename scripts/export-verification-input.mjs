import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { encodeAbiParameters } from "viem";

const buildInfoDirectory = resolve("artifacts", "build-info");
const files = (await readdir(buildInfoDirectory))
  .filter(
    (file) => file.endsWith(".json") && !file.endsWith(".output.json"),
  )
  .map((file) => resolve(buildInfoDirectory, file));

if (files.length === 0) {
  throw new Error("No Hardhat build info found. Run npm run contracts:compile.");
}

const filesWithStats = await Promise.all(
  files.map(async (file) => ({ file, modifiedAt: (await stat(file)).mtimeMs })),
);
filesWithStats.sort((left, right) => right.modifiedAt - left.modifiedAt);

const buildInfo = JSON.parse(
  await readFile(filesWithStats[0].file, "utf8"),
);
if (buildInfo.input === undefined) {
  throw new Error("The latest Hardhat build info has no standard JSON input.");
}

const outputPath = resolve("AuditRegistry.standard-input.json");
await writeFile(outputPath, `${JSON.stringify(buildInfo.input, null, 2)}\n`);
console.log(`Verification input written to ${outputPath}`);

const deploymentPath = resolve("deployments", "mantleSepolia.json");
try {
  const deployment = JSON.parse(await readFile(deploymentPath, "utf8"));
  const constructorArguments = encodeAbiParameters(
    [{ type: "address" }, { type: "address" }],
    [deployment.trustedSigner, deployment.owner],
  ).slice(2);
  const argumentsPath = resolve("AuditRegistry.constructor-args.txt");
  await writeFile(argumentsPath, `${constructorArguments}\n`);
  console.log(`Constructor arguments written to ${argumentsPath}`);
} catch (error) {
  if (error?.code !== "ENOENT") {
    throw error;
  }
  console.log(
    "Constructor arguments skipped: deploy to Mantle Sepolia first.",
  );
}
