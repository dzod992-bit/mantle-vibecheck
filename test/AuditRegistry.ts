import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import {
  encodeAbiParameters,
  getAddress,
  keccak256,
  stringToHex,
} from "viem";

const auditTypes = {
  Audit: [
    { name: "codeHash", type: "bytes32" },
    { name: "reportHash", type: "bytes32" },
    { name: "modelHash", type: "bytes32" },
    { name: "publisher", type: "address" },
    { name: "score", type: "uint16" },
    { name: "criticalCount", type: "uint16" },
    { name: "highCount", type: "uint16" },
    { name: "mediumCount", type: "uint16" },
    { name: "issuedAt", type: "uint64" },
    { name: "expiresAt", type: "uint64" },
    { name: "nonce", type: "uint256" },
  ],
} as const;

describe("AuditRegistry", async function () {
  const { viem } = await network.create({ network: "hardhatOp" });
  const publicClient = await viem.getPublicClient();

  async function deployFixture() {
    const [owner, signer, publisher, outsider] = await viem.getWalletClients();
    const registry = await viem.deployContract("AuditRegistry", [
      signer.account.address,
      owner.account.address,
    ]);
    const publisherRegistry = await viem.getContractAt(
      "AuditRegistry",
      registry.address,
      { client: { wallet: publisher } },
    );

    const chainId = await publicClient.getChainId();
    const latestBlock = await publicClient.getBlock();
    const audit = {
      codeHash: keccak256(stringToHex("contract source")),
      reportHash: keccak256(stringToHex("canonical report")),
      modelHash: keccak256(stringToHex("vibecheck-rules+model-v1")),
      publisher: publisher.account.address,
      score: 86,
      criticalCount: 0,
      highCount: 1,
      mediumCount: 2,
      issuedAt: latestBlock.timestamp,
      expiresAt: latestBlock.timestamp + 3_600n,
      nonce: 1n,
    } as const;
    const domain = {
      name: "Mantle VibeCheck",
      version: "1",
      chainId,
      verifyingContract: registry.address,
    } as const;

    return {
      audit,
      domain,
      outsider,
      owner,
      publisher,
      publisherRegistry,
      registry,
      signer,
    };
  }

  it("publishes a valid signed audit and indexes it by code hash", async function () {
    const { audit, domain, publisherRegistry, registry, signer } =
      await deployFixture();
    const signature = await signer.signTypedData({
      account: signer.account,
      domain,
      types: auditTypes,
      primaryType: "Audit",
      message: audit,
    });
    const expectedAuditId = keccak256(
      encodeAbiParameters(
        [
          { type: "bytes32" },
          { type: "bytes32" },
          { type: "address" },
          { type: "uint256" },
        ],
        [audit.codeHash, audit.reportHash, audit.publisher, audit.nonce],
      ),
    );

    await viem.assertions.emitWithArgs(
      publisherRegistry.write.publishAudit([audit, signature]),
      registry,
      "AuditPublished",
      [
        expectedAuditId,
        audit.codeHash,
        getAddress(audit.publisher),
        audit.reportHash,
        audit.score,
      ],
    );

    assert.equal(await registry.read.getAuditCount([audit.codeHash]), 1n);
    const auditId = await registry.read.getAuditIdAt([audit.codeHash, 0n]);
    const record = await registry.read.getAudit([auditId]);

    assert.equal(record.publisher, getAddress(audit.publisher));
    assert.equal(record.reportHash, audit.reportHash);
    assert.equal(record.score, audit.score);
    assert.ok(record.publishedAt > 0n);
  });

  it("rejects a replayed publisher nonce", async function () {
    const { audit, domain, publisherRegistry, registry, signer } =
      await deployFixture();
    const signature = await signer.signTypedData({
      account: signer.account,
      domain,
      types: auditTypes,
      primaryType: "Audit",
      message: audit,
    });

    await publisherRegistry.write.publishAudit([audit, signature]);

    await viem.assertions.revertWithCustomError(
      publisherRegistry.write.publishAudit([audit, signature]),
      registry,
      "NonceAlreadyUsed",
    );
  });

  it("rejects reports signed by an untrusted signer", async function () {
    const {
      audit,
      domain,
      outsider,
      publisherRegistry,
      registry,
    } = await deployFixture();
    const signature = await outsider.signTypedData({
      account: outsider.account,
      domain,
      types: auditTypes,
      primaryType: "Audit",
      message: audit,
    });

    await viem.assertions.revertWithCustomError(
      publisherRegistry.write.publishAudit([audit, signature]),
      registry,
      "InvalidSignature",
    );
  });

  it("rejects reports submitted by a different publisher", async function () {
    const { audit, domain, outsider, registry, signer } = await deployFixture();
    const outsiderRegistry = await viem.getContractAt(
      "AuditRegistry",
      registry.address,
      { client: { wallet: outsider } },
    );
    const signature = await signer.signTypedData({
      account: signer.account,
      domain,
      types: auditTypes,
      primaryType: "Audit",
      message: audit,
    });

    await viem.assertions.revertWithCustomError(
      outsiderRegistry.write.publishAudit([audit, signature]),
      registry,
      "InvalidPublisher",
    );
  });

  it("allows only the owner to rotate the trusted signer", async function () {
    const { outsider, owner, registry } = await deployFixture();
    const outsiderRegistry = await viem.getContractAt(
      "AuditRegistry",
      registry.address,
      { client: { wallet: outsider } },
    );
    const ownerRegistry = await viem.getContractAt(
      "AuditRegistry",
      registry.address,
      { client: { wallet: owner } },
    );

    await viem.assertions.revertWithCustomError(
      outsiderRegistry.write.setTrustedSigner([outsider.account.address]),
      registry,
      "OwnableUnauthorizedAccount",
    );

    await ownerRegistry.write.setTrustedSigner([outsider.account.address]);
    assert.equal(
      await registry.read.trustedSigner(),
      getAddress(outsider.account.address),
    );
  });
});
