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

pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@iexec/solidity/contracts/ERC1154/IERC1154.sol";
import "@iexec/doracle/contracts/IexecDoracle.sol";
import "./OracleStorage.sol";

contract GenericOracle is IexecDoracle, Ownable, IOracleConsumer, OracleStorage {

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
        (bytes32 id, uint date, bytes memory value) =
            abi.decode(
                _iexecDoracleGetVerifiedResult(_callID),
                (bytes32, uint, bytes)
            );

        require(updateValue(id, _callID, date, value), "Failed to update value");
    }

}
