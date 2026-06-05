import { defineChain } from "viem";

export const mantleSepolia = defineChain({
  id: 5003,
  name: "Mantle Sepolia",
  nativeCurrency: {
    name: "Mantle",
    symbol: "MNT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.sepolia.mantle.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "MantleScan Sepolia",
      url: "https://sepolia.mantlescan.xyz",
      apiUrl: "https://api-sepolia.mantlescan.xyz/api",
    },
  },
  testnet: true,
});

export const mantleSepoliaExplorerUrl =
  mantleSepolia.blockExplorers.default.url;
