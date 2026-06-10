// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VulnerableVault {
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
}
