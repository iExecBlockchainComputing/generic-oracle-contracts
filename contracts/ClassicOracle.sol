// SPDX-License-Identifier: Apache-2.0

/******************************************************************************
 * Copyright 2022 IEXEC BLOCKCHAIN TECH                                       *
 *                                                                            *
 * Licensed under the Apache License, Version 2.0 (the "License");            *
 * you may not use this file except in compliance with the License.           *
 * You may obtain a copy of the License at                                    *
 *                                                                            *
 *     http://www.apache.org/licenses/LICENSE-2.0                             *
 *                                                                            *
 * Unless required by applicable law or agreed to in writing, software        *
 * distributed under the License is distributed on an "AS IS" BASIS,          *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   *
 * See the License for the specific language governing permissions and        *
 * limitations under the License.                                             *
 ******************************************************************************/

pragma solidity ^0.8.0;

import "openzeppelin-contracts-latest/access/Ownable.sol";
import "openzeppelin-contracts-latest/metatx/ERC2771Context.sol";
import "./utils/IERC1154.sol";
//import "@iexec/solidity/contracts/ERC1154/IERC1154.sol";

import "hardhat/console.sol";

contract ClassicOracle is ERC2771Context, IOracleConsumer {
    // Authorized address to report result
    address public authorizedReporter;

    // Data storage
    struct TimedRawValue {
        bytes value;
        uint256 date;
    }

    mapping(bytes32 => TimedRawValue) public values;

    // Event
    event ValueUpdated(
        bytes32 indexed id,
        bytes32 indexed oracleCallID,
        uint256 date,
        bytes value
    );

    constructor(address _authorizedReporter, address _trustedForwarder)
        ERC2771Context(_trustedForwarder)
    {
        //might be deployed without forwarder, but reporter is required
        require(_authorizedReporter != address(0));
        authorizedReporter = _authorizedReporter;
        console.log("Authorized reporter (custom): %s", authorizedReporter);
    }

    modifier onlyAuthorizedReporter() {
        require(
            _msgSender() == authorizedReporter,
            "Reporter is not authorized"
        );
        _;
    }

    // ERC1154 - Callback processing
    function receiveResult(bytes32 _callID, bytes memory callback)
        external
        override
        onlyAuthorizedReporter
    {
        // Parse results
        (bytes32 id, uint256 date, bytes memory value) = abi.decode(
            callback,
            (bytes32, uint256, bytes)
        );

        values[id].date = date; //What if date is older?
        values[id].value = value;
        emit ValueUpdated(id, _callID, date, value);
    }

    function getString(bytes32 _oracleId)
        public
        view
        returns (string memory stringValue, uint256 date)
    {
        bytes memory value = values[_oracleId].value;
        return (abi.decode(value, (string)), values[_oracleId].date);
    }

    function getRaw(bytes32 _oracleId)
        public
        view
        returns (bytes memory bytesValue, uint256 date)
    {
        bytes memory value = values[_oracleId].value;
        return (value, values[_oracleId].date);
    }

    function getInt(bytes32 _oracleId)
        public
        view
        returns (int256 intValue, uint256 date)
    {
        bytes memory value = values[_oracleId].value;
        return (abi.decode(value, (int256)), values[_oracleId].date);
    }

    function getBool(bytes32 _oracleId)
        public
        view
        returns (bool boolValue, uint256 date)
    {
        bytes memory value = values[_oracleId].value;
        return (abi.decode(value, (bool)), values[_oracleId].date);
    }
}
