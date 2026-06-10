// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

contract UnboundedDistributor {
    mapping(address => uint256) public rewards;

    function distribute(address[] calldata recipients, uint256 amount) external {
        for (uint256 index = 0; index < recipients.length; index++) {
            rewards[recipients[index]] += amount;
        }
    }
}
