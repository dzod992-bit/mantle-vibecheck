// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/// @title Mantle VibeCheck Audit Registry
/// @notice Records signed AI-assisted Solidity audit results as verifiable proofs.
contract AuditRegistry is EIP712, Ownable {
    using ECDSA for bytes32;

    uint64 public constant MAX_CLOCK_SKEW = 5 minutes;

    bytes32 public constant AUDIT_TYPEHASH = keccak256(
        "Audit(bytes32 codeHash,bytes32 reportHash,bytes32 modelHash,address publisher,uint16 score,uint16 criticalCount,uint16 highCount,uint16 mediumCount,uint64 issuedAt,uint64 expiresAt,uint256 nonce)"
    );

    struct Audit {
        bytes32 codeHash;
        bytes32 reportHash;
        bytes32 modelHash;
        address publisher;
        uint16 score;
        uint16 criticalCount;
        uint16 highCount;
        uint16 mediumCount;
        uint64 issuedAt;
        uint64 expiresAt;
        uint256 nonce;
    }

    struct AuditRecord {
        bytes32 codeHash;
        bytes32 reportHash;
        bytes32 modelHash;
        address publisher;
        uint16 score;
        uint16 criticalCount;
        uint16 highCount;
        uint16 mediumCount;
        uint64 issuedAt;
        uint64 publishedAt;
    }

    error AuditAlreadyPublished(bytes32 auditId);
    error AuditExpired(uint64 expiresAt);
    error AuditIssuedInFuture(uint64 issuedAt);
    error InvalidAuditHash();
    error InvalidPublisher(address expected, address actual);
    error InvalidScore(uint16 score);
    error InvalidSignature(address recovered, address expected);
    error InvalidSigner();
    error NonceAlreadyUsed(address publisher, uint256 nonce);

    event AuditPublished(
        bytes32 indexed auditId,
        bytes32 indexed codeHash,
        address indexed publisher,
        bytes32 reportHash,
        uint16 score
    );
    event TrustedSignerUpdated(address indexed previousSigner, address indexed newSigner);

    address public trustedSigner;

    mapping(bytes32 auditId => AuditRecord record) private _audits;
    mapping(address publisher => mapping(uint256 nonce => bool used)) public usedNonces;
    mapping(bytes32 codeHash => bytes32[] auditIds) private _auditIdsByCodeHash;

    constructor(address initialSigner, address initialOwner)
        EIP712("Mantle VibeCheck", "1")
        Ownable(initialOwner)
    {
        if (initialSigner == address(0)) revert InvalidSigner();
        trustedSigner = initialSigner;
    }

    function publishAudit(Audit calldata audit, bytes calldata signature)
        external
        returns (bytes32 auditId)
    {
        if (audit.codeHash == bytes32(0) || audit.reportHash == bytes32(0)) {
            revert InvalidAuditHash();
        }
        if (audit.score > 100) revert InvalidScore(audit.score);
        if (audit.publisher != msg.sender) {
            revert InvalidPublisher(audit.publisher, msg.sender);
        }
        if (audit.issuedAt > block.timestamp + MAX_CLOCK_SKEW) {
            revert AuditIssuedInFuture(audit.issuedAt);
        }
        if (audit.expiresAt <= audit.issuedAt || audit.expiresAt <= block.timestamp) {
            revert AuditExpired(audit.expiresAt);
        }
        if (usedNonces[audit.publisher][audit.nonce]) {
            revert NonceAlreadyUsed(audit.publisher, audit.nonce);
        }

        address recovered = _hashTypedDataV4(_hashAudit(audit)).recover(signature);
        if (recovered != trustedSigner) {
            revert InvalidSignature(recovered, trustedSigner);
        }

        auditId = keccak256(
            abi.encode(audit.codeHash, audit.reportHash, audit.publisher, audit.nonce)
        );
        if (_audits[auditId].publishedAt != 0) {
            revert AuditAlreadyPublished(auditId);
        }

        usedNonces[audit.publisher][audit.nonce] = true;
        _audits[auditId] = AuditRecord({
            codeHash: audit.codeHash,
            reportHash: audit.reportHash,
            modelHash: audit.modelHash,
            publisher: audit.publisher,
            score: audit.score,
            criticalCount: audit.criticalCount,
            highCount: audit.highCount,
            mediumCount: audit.mediumCount,
            issuedAt: audit.issuedAt,
            publishedAt: uint64(block.timestamp)
        });
        _auditIdsByCodeHash[audit.codeHash].push(auditId);

        emit AuditPublished(
            auditId,
            audit.codeHash,
            audit.publisher,
            audit.reportHash,
            audit.score
        );
    }

    function getAudit(bytes32 auditId) external view returns (AuditRecord memory) {
        return _audits[auditId];
    }

    function getAuditCount(bytes32 codeHash) external view returns (uint256) {
        return _auditIdsByCodeHash[codeHash].length;
    }

    function getAuditIdAt(bytes32 codeHash, uint256 index)
        external
        view
        returns (bytes32)
    {
        return _auditIdsByCodeHash[codeHash][index];
    }

    function hashAudit(Audit calldata audit) external view returns (bytes32) {
        return _hashTypedDataV4(_hashAudit(audit));
    }

    function setTrustedSigner(address newSigner) external onlyOwner {
        if (newSigner == address(0)) revert InvalidSigner();

        address previousSigner = trustedSigner;
        trustedSigner = newSigner;
        emit TrustedSignerUpdated(previousSigner, newSigner);
    }

    function _hashAudit(Audit calldata audit) private pure returns (bytes32) {
        return keccak256(
            abi.encode(
                AUDIT_TYPEHASH,
                audit.codeHash,
                audit.reportHash,
                audit.modelHash,
                audit.publisher,
                audit.score,
                audit.criticalCount,
                audit.highCount,
                audit.mediumCount,
                audit.issuedAt,
                audit.expiresAt,
                audit.nonce
            )
        );
    }
}
