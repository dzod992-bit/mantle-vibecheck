export const vulnerableSample = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract VibeVault {
    address public owner;
    mapping(address => uint256) public balances;

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount);

        (bool sent,) = msg.sender.call{value: amount}("");
        require(sent);

        balances[msg.sender] -= amount;
    }

    function emergencySweep(address payable recipient) external {
        require(tx.origin == owner);
        recipient.transfer(address(this).balance);
    }
}`;

export const safeSample = `// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract SaferVault {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        uint256 balance = balances[msg.sender];
        require(balance >= amount, "insufficient balance");

        balances[msg.sender] = balance - amount;

        (bool sent,) = msg.sender.call{value: amount}("");
        require(sent, "transfer failed");
    }
}`;
