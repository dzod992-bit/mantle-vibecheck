import {
  encodeAbiParameters,
  getAddress,
  keccak256,
  parseAbi,
  type Address,
  type Hex,
} from "viem";

export const auditRegistryAbi = parseAbi([
  "function getAudit(bytes32 auditId) view returns ((bytes32 codeHash, bytes32 reportHash, bytes32 modelHash, address publisher, uint16 score, uint16 criticalCount, uint16 highCount, uint16 mediumCount, uint64 issuedAt, uint64 publishedAt))",
  "function getAuditCount(bytes32 codeHash) view returns (uint256)",
  "function getAuditIdAt(bytes32 codeHash, uint256 index) view returns (bytes32)",
  "function trustedSigner() view returns (address)",
  "function usedNonces(address publisher, uint256 nonce) view returns (bool)",
  "function setTrustedSigner(address newSigner)",
  "function publishAudit((bytes32 codeHash, bytes32 reportHash, bytes32 modelHash, address publisher, uint16 score, uint16 criticalCount, uint16 highCount, uint16 mediumCount, uint64 issuedAt, uint64 expiresAt, uint256 nonce) audit, bytes signature) returns (bytes32 auditId)",
  "event AuditPublished(bytes32 indexed auditId, bytes32 indexed codeHash, address indexed publisher, bytes32 reportHash, uint16 score)",
  "event TrustedSignerUpdated(address indexed previousSigner, address indexed newSigner)",
]);

export const auditTypedData = {
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

export type SignedAudit = {
  codeHash: Hex;
  reportHash: Hex;
  modelHash: Hex;
  publisher: Address;
  score: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  issuedAt: bigint;
  expiresAt: bigint;
  nonce: bigint;
};

export function createAuditDomain(chainId: number, registryAddress: Address) {
  return {
    name: "Mantle VibeCheck",
    version: "1",
    chainId,
    verifyingContract: getAddress(registryAddress),
  } as const;
}

export function deriveAuditId(audit: SignedAudit): Hex {
  return keccak256(
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
}
