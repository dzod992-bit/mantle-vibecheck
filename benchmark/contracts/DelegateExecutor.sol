// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

contract DelegateExecutor {
    function execute(address implementation, bytes calldata data) external {
        implementation.delegatecall(data);
    }
}
