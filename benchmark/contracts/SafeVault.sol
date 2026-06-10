// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

contract SafeVault {
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
}
