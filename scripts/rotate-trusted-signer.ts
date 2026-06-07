import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { network } from "hardhat";
import { getAddress, isAddress } from "viem";

type Deployment = {
  address: string;
  trustedSigner: string;
  signerRotation?: {
    previousSigner: string;
    transactionHash: string;
    rotatedAt: string;
  };
};

const connection = await network.create();
const { viem } = connection;
const walletClients = await viem.getWalletClients();
const owner = walletClients[0];
if (owner === undefined) {
  throw new Error(
    "No owner account configured. Set MANTLE_DEPLOYER_PRIVATE_KEY locally.",
  );
}

const configuredSigner = process.env.AUDIT_TRUSTED_SIGNER;
if (configuredSigner === undefined || !isAddress(configuredSigner)) {
  throw new Error("AUDIT_TRUSTED_SIGNER must be a valid Ethereum address");
}

const deploymentPath = resolve(
  "deployments",
  `${connection.networkName}.json`,
);
const deployment = JSON.parse(
  await readFile(deploymentPath, "utf8"),
) as Deployment;
if (!isAddress(deployment.address) || !isAddress(deployment.trustedSigner)) {
  throw new Error(`Invalid deployment metadata in ${deploymentPath}`);
}

const newSigner = getAddress(configuredSigner);
const previousSigner = getAddress(deployment.trustedSigner);
if (newSigner === previousSigner) {
  console.log(`Trusted signer is already ${newSigner}`);
  process.exit(0);
}

const registry = await viem.getContractAt(
  "AuditRegistry",
  getAddress(deployment.address),
  { client: { wallet: owner } },
);
const transactionHash = await registry.write.setTrustedSigner([newSigner]);
const publicClient = await viem.getPublicClient();
await publicClient.waitForTransactionReceipt({ hash: transactionHash });

deployment.trustedSigner = newSigner;
deployment.signerRotation = {
  previousSigner,
  transactionHash,
  rotatedAt: new Date().toISOString(),
};
await writeFile(
  deploymentPath,
  `${JSON.stringify(deployment, null, 2)}\n`,
  "utf8",
);

console.log(`Trusted signer rotated to ${newSigner}`);
console.log(`Transaction: ${transactionHash}`);
