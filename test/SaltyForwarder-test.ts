import { expect } from "chai";
import { ethers } from "hardhat";
import { SingleReporterOracle, SaltyForwarder } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { generateDate, buildCallback } from "./utils/utils";

describe("SaltyForwarder", function () {
    let sponsorAccount: SignerWithAddress
    let reporterAccount: SignerWithAddress
    let forwarderContract: SaltyForwarder
    let singleReporterOracle: SingleReporterOracle
    const types = {
        ForwardRequest: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'gas', type: 'uint256' },
            { name: 'salt', type: 'bytes32' },
            { name: 'data', type: 'bytes' },
        ],
    };
    let domain: any;

    beforeEach("Fresh contract & accounts", async () => {
        [sponsorAccount, reporterAccount] = await ethers.getSigners();
        const SaltyForwarderFactory = await ethers.getContractFactory("SaltyForwarder")
        forwarderContract = await SaltyForwarderFactory.deploy()
        const SingleReporterOracleFactory = await ethers.getContractFactory("SingleReporterOracle")
        singleReporterOracle = await SingleReporterOracleFactory.deploy(reporterAccount.address, forwarderContract.address)
        domain = {
            name: "SaltyForwarder",
            version: "0.0.1",
            chainId: ethers.provider.network.chainId,
            verifyingContract: forwarderContract.address,
        };
    });

    it('should forward with salt', async () => {
        const oracleId = buildOracleId(0);
        const date: BigInt = generateDate();
        const value: string = 'abcd';
        const callback: string = buildStringCallback(oracleId, date, value);
        const forwardRequest: SaltyForwarder.ForwardRequestStruct = await buildForwardRequest(oracleId, callback)
        const signedRequest = await signForwardRequest(forwardRequest)

        expect(await forwarderContract.verify(forwardRequest, signedRequest)).is.true
        await expect(forwarderContract.execute(forwardRequest, signedRequest))
            .to.emit(singleReporterOracle, 'ValueUpdated');
        const { date: foundDate, stringValue: foundValue } = await singleReporterOracle.getString(oracleId);
        expect(date).equal(foundDate);
        expect(value).equal(foundValue);
        expect(await forwarderContract.isConsumedSalt(reporterAccount.address, forwardRequest.salt)).is.true;
    });

    it('should not forward since replay attack', async () => {
        const oracleId = buildOracleId(0);
        const date: BigInt = generateDate();
        const value: string = 'abcd';
        const callback: string = buildCallback(oracleId, date, ethers.utils.defaultAbiCoder.encode(['string'], [value]));
        const forwardRequest: SaltyForwarder.ForwardRequestStruct = await buildForwardRequest(oracleId, callback);
        const signedRequest = await signForwardRequest(forwardRequest)

        expect(await forwarderContract.connect(sponsorAccount) //explicitly asking for sponsor account (already default)
            .verify(forwardRequest, signedRequest)).is.true
        await expect(forwarderContract.connect(sponsorAccount)
            .execute(forwardRequest, signedRequest))
            .to.emit(singleReporterOracle, 'ValueUpdated');
        //verify cannot replay
        expect(await forwarderContract.verify(forwardRequest, signedRequest)).is.false
        await expect(forwarderContract.execute(forwardRequest, signedRequest))
            .to.be.revertedWith("SaltyForwarder: invalid signature or salt");
    });

    it('should sign metatxs for different oracles and forward them later', async () => {
        const n = 10;
        const requestAndSignatureMap = new Map();
        //Sign metatxs. Using same payload for simplicity (same date and value)
        const date: BigInt = generateDate();
        const value: string = 'abcd';
        for (let i = 0; i < n; i++) {
            const oracleId = buildOracleId(i)
            const callback: string = buildStringCallback(oracleId, date, value);
            const forwardRequest: SaltyForwarder.ForwardRequestStruct = await buildForwardRequest(oracleId, callback)
            const signedRequest = await signForwardRequest(forwardRequest)
            requestAndSignatureMap.set(i, [forwardRequest, signedRequest])
            console.log("Signed metatx:                 %s->%s", i, oracleId)
        }
        //Forward metatxs on-chain later (using queue instead of batching for simplicity)
        //Note: With a same oracleID, some logic must be added to ensure ordering
        for (let i = 0; i < n; i++) {
            const oracleId = buildOracleId(i)
            const requestAndSignature = requestAndSignatureMap.get(i);
            const tx = forwarderContract.execute(requestAndSignature[0], requestAndSignature[1]);
            await expect(tx)
                .to.emit(singleReporterOracle, 'ValueUpdated')
            const { date: foundDate, stringValue: foundValue } = await singleReporterOracle.getString(oracleId);
            expect(date).equal(foundDate);
            expect(value).equal(foundValue);
            console.log("Submited metatx (now mined):   %s->%s", i, oracleId)
        }

    });

    function buildOracleId(i: number): string {
        return ethers.utils.keccak256(ethers.utils.toUtf8Bytes("oracleId" + i));
    }

    function buildStringCallback(oracleId: string, date: BigInt, value: string): string {
        return buildCallback(oracleId, date, ethers.utils.defaultAbiCoder.encode(['string'], [value]));
    }

    async function buildForwardRequest(oracleId: string, callback: string): Promise<SaltyForwarder.ForwardRequestStruct> {
        const gas = await singleReporterOracle.connect(reporterAccount).estimateGas.receiveResult(oracleId, callback);
        return {
            from: reporterAccount.address,
            to: singleReporterOracle.address,
            value: 0,
            gas: gas,
            salt: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(Math.random().toString())),
            data: singleReporterOracle.interface.encodeFunctionData("receiveResult", [oracleId, callback])
        };
    }

    async function signForwardRequest(forwardRequest: SaltyForwarder.ForwardRequestStruct) {
        return await reporterAccount._signTypedData(domain, types, forwardRequest);
    }

});
