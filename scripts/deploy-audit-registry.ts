import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { network } from "hardhat";
import { getAddress, isAddress } from "viem";

const connection = await network.create();
const { viem } = connection;
const [deployer] = await viem.getWalletClients();

const configuredSigner = process.env.AUDIT_TRUSTED_SIGNER;
if (configuredSigner !== undefined && !isAddress(configuredSigner)) {
  throw new Error("AUDIT_TRUSTED_SIGNER must be a valid Ethereum address");
}

const trustedSigner = configuredSigner
  ? getAddress(configuredSigner)
  : deployer.account.address;

console.log(`Deploying AuditRegistry to ${connection.networkName}`);
console.log(`Owner: ${deployer.account.address}`);
console.log(`Trusted signer: ${trustedSigner}`);

const registry = await viem.deployContract(
  "AuditRegistry",
  [trustedSigner, deployer.account.address],
  { confirmations: 1 },
);

const publicClient = await viem.getPublicClient();
const chainId = await publicClient.getChainId();
const deployment = {
  network: connection.networkName,
  chainId,
  address: registry.address,
  owner: deployer.account.address,
  trustedSigner,
  deployedAt: new Date().toISOString(),
};

const deploymentsDirectory = resolve("deployments");
await mkdir(deploymentsDirectory, { recursive: true });
await writeFile(
  resolve(deploymentsDirectory, `${connection.networkName}.json`),
  `${JSON.stringify(deployment, null, 2)}\n`,
  "utf8",
);

console.log(`AuditRegistry deployed at ${registry.address}`);
