// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

contract UnsafeCalls {
    function ping(address target) external {
        target.call("");
    }

    function destroy(address payable recipient) external {
        selfdestruct(recipient);
    }
}
