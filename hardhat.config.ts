import "dotenv/config";

import hardhatNetworkHelpers from "@nomicfoundation/hardhat-network-helpers";
import hardhatNodeTestRunner from "@nomicfoundation/hardhat-node-test-runner";
import hardhatViem from "@nomicfoundation/hardhat-viem";
import hardhatViemAssertions from "@nomicfoundation/hardhat-viem-assertions";
import { defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [
    hardhatNetworkHelpers,
    hardhatNodeTestRunner,
    hardhatViem,
    hardhatViemAssertions,
  ],
  solidity: {
    profiles: {
      default: {
        version: "0.8.23",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      production: {
        version: "0.8.23",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    mantleSepolia: {
      type: "http",
      chainType: "generic",
      url:
        process.env.MANTLE_RPC_URL ?? "https://rpc.sepolia.mantle.xyz",
      accounts: process.env.MANTLE_DEPLOYER_PRIVATE_KEY
        ? [process.env.MANTLE_DEPLOYER_PRIVATE_KEY]
        : [],
    },
  },
});
