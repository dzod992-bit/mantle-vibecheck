import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { network } from "hardhat";
import { formatEther, getAddress, isAddress, parseEther } from "viem";
import {
  generatePrivateKey,
  privateKeyToAccount,
} from "viem/accounts";

type Deployment = {
  address: string;
  owner: string;
  ownerRotation?: {
    previousOwner: string;
    fundingTransactionHash: string;
    transactionHash: string;
    rotatedAt: string;
  };
};

const connection = await network.create();
const { viem } = connection;
const walletClients = await viem.getWalletClients();
const previousOwner = walletClients[0];
if (previousOwner === undefined) {
  throw new Error(
    "No owner account configured. Set MANTLE_DEPLOYER_PRIVATE_KEY locally.",
  );
}

const deploymentPath = resolve(
  "deployments",
  `${connection.networkName}.json`,
);
const deployment = JSON.parse(
  await readFile(deploymentPath, "utf8"),
) as Deployment;
if (!isAddress(deployment.address) || !isAddress(deployment.owner)) {
  throw new Error(`Invalid deployment metadata in ${deploymentPath}`);
}
if (
  getAddress(deployment.owner) !== getAddress(previousOwner.account.address)
) {
  throw new Error("Configured deployer is not the current deployment owner");
}

const publicClient = await viem.getPublicClient();
const newOwnerPrivateKey = generatePrivateKey();
const newOwner = privateKeyToAccount(newOwnerPrivateKey);
const fundingValue = parseEther("0.5");

const fundingTransactionHash = await previousOwner.sendTransaction({
  to: newOwner.address,
  value: fundingValue,
});
await publicClient.waitForTransactionReceipt({
  hash: fundingTransactionHash,
});

const registry = await viem.getContractAt(
  "AuditRegistry",
  getAddress(deployment.address),
  { client: { wallet: previousOwner } },
);
const transactionHash = await registry.write.transferOwnership([
  newOwner.address,
]);
await publicClient.waitForTransactionReceipt({ hash: transactionHash });

const envPath = resolve(".env");
let env = await readFile(envPath, "utf8");
const deployerPattern = /^MANTLE_DEPLOYER_PRIVATE_KEY=.*$/m;
if (!deployerPattern.test(env)) {
  throw new Error("MANTLE_DEPLOYER_PRIVATE_KEY is missing from .env");
}
env = env.replace(
  deployerPattern,
  `MANTLE_DEPLOYER_PRIVATE_KEY=${newOwnerPrivateKey}`,
);
await writeFile(envPath, env, "utf8");

deployment.owner = newOwner.address;
deployment.ownerRotation = {
  previousOwner: previousOwner.account.address,
  fundingTransactionHash,
  transactionHash,
  rotatedAt: new Date().toISOString(),
};
await writeFile(
  deploymentPath,
  `${JSON.stringify(deployment, null, 2)}\n`,
  "utf8",
);

console.log(`Ownership transferred to ${newOwner.address}`);
console.log(`Funded new owner with ${formatEther(fundingValue)} MNT`);
console.log(`Funding transaction: ${fundingTransactionHash}`);
console.log(`Ownership transaction: ${transactionHash}`);
