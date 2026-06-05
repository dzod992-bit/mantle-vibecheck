"use client";

import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Address,
  type EIP1193Provider,
  type Hex,
} from "viem";
import { mantleSepoliaTestnet } from "viem/chains";

import { auditRegistryAbi } from "@/lib/contracts/audit-registry";

import type { AuditProof } from "./types";

export async function connectBrowserWallet(): Promise<Address> {
  const provider = getProvider();
  const walletClient = createWalletClient({
    chain: mantleSepoliaTestnet,
    transport: custom(provider),
  });
  const [address] = await walletClient.requestAddresses();
  if (address === undefined) {
    throw new Error("The wallet did not return an account.");
  }

  await ensureMantleSepolia(walletClient);
  return address;
}

export async function publishAuditProof(
  proof: AuditProof,
  publisher: Address,
): Promise<Hex> {
  if (proof.chainId !== mantleSepoliaTestnet.id) {
    throw new Error("The proof was not signed for Mantle Sepolia.");
  }

  const provider = getProvider();
  const walletClient = createWalletClient({
    account: publisher,
    chain: mantleSepoliaTestnet,
    transport: custom(provider),
  });
  await ensureMantleSepolia(walletClient);

  const hash = await walletClient.writeContract({
    address: proof.registryAddress,
    abi: auditRegistryAbi,
    functionName: "publishAudit",
    args: [
      {
        ...proof.audit,
        issuedAt: BigInt(proof.audit.issuedAt),
        expiresAt: BigInt(proof.audit.expiresAt),
        nonce: BigInt(proof.audit.nonce),
      },
      proof.signature,
    ],
  });
  const publicClient = createPublicClient({
    chain: mantleSepoliaTestnet,
    transport: http(),
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

function getProvider(): EIP1193Provider {
  if (window.ethereum === undefined) {
    throw new Error("Install MetaMask or Rabby to publish an audit proof.");
  }
  return window.ethereum;
}

async function ensureMantleSepolia(
  walletClient: ReturnType<typeof createWalletClient>,
): Promise<void> {
  try {
    await walletClient.switchChain({ id: mantleSepoliaTestnet.id });
  } catch {
    await walletClient.addChain({ chain: mantleSepoliaTestnet });
    await walletClient.switchChain({ id: mantleSepoliaTestnet.id });
  }
}
