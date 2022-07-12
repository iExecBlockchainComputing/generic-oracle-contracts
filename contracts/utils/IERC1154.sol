// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

/**
 * @title EIP1154 interface
 * @dev see https://eips.ethereum.org/EIPS/eip-1154
 */
interface IOracleConsumer {
    function receiveResult(bytes32, bytes calldata) external;
}

interface IOracle {
    function resultFor(bytes32) external view returns (bytes memory);
}
