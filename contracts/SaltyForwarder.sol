// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (metatx/MinimalForwarder.sol)

pragma solidity ^0.8.0;

import "openzeppelin-contracts/utils/cryptography/ECDSA.sol";
import "openzeppelin-contracts/utils/cryptography/draft-EIP712.sol";

/*
 * This SaltyForwarder contract is based on OpenZeppelin's MinimalForwarder:
 * https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.4.2/contracts/metatx/MinimalForwarder.sol
 *
 * This forwarder use salts (instead of nonces) which still protect against replay attacks
 * but is compatible with contracts that does not require transaction ordering
 *
 * Original note from the OpenZeppelin team:
 * @dev Simple minimal forwarder to be used together with an ERC2771 compatible contract. See {ERC2771Context}.
 */
contract SaltyForwarder is EIP712 {
    using ECDSA for bytes32;

    struct ForwardRequest {
        address from;
        address to;
        uint256 value;
        uint256 gas;
        bytes32 salt;
        bytes data;
    }

    bytes32 private constant TYPEHASH =
        keccak256(
            "ForwardRequest(address from,address to,uint256 value,uint256 gas,bytes32 salt,bytes data)"
        );

    mapping(address => mapping(bytes32 => bool)) private _consumedSalts;

    constructor() EIP712("SaltyForwarder", "0.0.1") {}

    function isFreeSalt(address from, bytes32 salt) public view returns (bool) {
        return !_consumedSalts[from][salt];
    }

    function verify(ForwardRequest calldata req, bytes calldata signature)
        public
        view
        returns (bool)
    {
        address signer = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    TYPEHASH,
                    req.from,
                    req.to,
                    req.value,
                    req.gas,
                    req.salt,
                    keccak256(req.data)
                )
            )
        ).recover(signature);
        return isFreeSalt(req.from, req.salt) && signer == req.from;
    }

    function execute(ForwardRequest calldata req, bytes calldata signature)
        public
        payable
        returns (bool, bytes memory)
    {
        require(
            verify(req, signature),
            "SaltyForwarder: signature is invalid or replay attack"
        );
        _consumedSalts[req.from][req.salt] = true;

        (bool success, bytes memory returndata) = req.to.call{
            gas: req.gas,
            value: req.value
        }(abi.encodePacked(req.data, req.from));
        // Validate that the relayer has sent enough gas for the call.
        // See https://ronan.eth.link/blog/ethereum-gas-dangers/
        assert(gasleft() > req.gas / 63);

        return (success, returndata);
    }
}
