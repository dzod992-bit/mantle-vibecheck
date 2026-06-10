// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

contract WeakLottery {
    function draw(address[] calldata players) external view returns (address) {
        uint256 winner = uint256(
            keccak256(abi.encode(block.timestamp, block.prevrandao))
        ) % players.length;
        return players[winner];
    }
}
