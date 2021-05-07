// SPDX-License-Identifier: Apache-2.0

/******************************************************************************
 * Copyright 2021 IEXEC BLOCKCHAIN TECH                                       *
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

pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@iexec/solidity/contracts/ERC1154/IERC1154.sol";
import "@iexec/doracle/contracts/IexecDoracle.sol";

contract GenericOracle is IexecDoracle, Ownable, IOracleConsumer {
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

    // Use _iexecHubAddr to force use of custom iexechub, leave 0x0 for autodetect
    constructor(address _iexecHubAddr) public IexecDoracle(_iexecHubAddr) {}

    function updateEnv(
        address _authorizedApp,
        address _authorizedDataset,
        address _authorizedWorkerpool,
        bytes32 _requiredtag,
        uint256 _requiredtrust
    ) public onlyOwner {
        _iexecDoracleUpdateSettings(
            _authorizedApp,
            _authorizedDataset,
            _authorizedWorkerpool,
            _requiredtag,
            _requiredtrust
        );
    }

    // ERC1154 - Callback processing
    function receiveResult(bytes32 _callID, bytes calldata) external override {
        // Parse results
        (bytes32 id, bytes memory value) =
            abi.decode(
                _iexecDoracleGetVerifiedResult(_callID),
                (bytes32, bytes)
            );

        values[id].date = now;
        values[id].value = value;

        emit ValueUpdated(id, _callID, now, value);
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
