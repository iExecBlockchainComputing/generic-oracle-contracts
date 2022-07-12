import { expect } from "chai";
import { ethers } from "hardhat";
import { ClassicOracle, SaltyForwarder } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { generateDate, buildCallback } from "./utils/utils";

describe("SaltyForwarder", function () {
    let sponsorAccount: SignerWithAddress
    let reporterAccount: SignerWithAddress
    let forwarder: SaltyForwarder
    let classicOracle: ClassicOracle
    const oracleId = ethers.utils.keccak256(new TextEncoder().encode("oracleId"))
    const date: BigInt = generateDate();
    const value: string = 'abcd';
    const callback: string = buildCallback(oracleId, date, ethers.utils.defaultAbiCoder.encode(['string'], [value]));
    console.log("oracleId: " + oracleId);
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
        forwarder = await SaltyForwarderFactory.deploy()
        const ClassicOracleFactory = await ethers.getContractFactory("ClassicOracle")
        classicOracle = await ClassicOracleFactory.deploy(reporterAccount.address, forwarder.address)
        domain = {
            name: "SaltyForwarder",
            version: "0.0.1",
            chainId: ethers.provider.network.chainId,
            verifyingContract: forwarder.address,
        };
    });

    it('should foward with salt', async () => {
        const data = classicOracle.interface.encodeFunctionData("receiveResult", [oracleId, callback])
        const salt = ethers.utils.keccak256(new TextEncoder().encode("random"))
        const forwardRequest: SaltyForwarder.ForwardRequestStruct = {
            from: reporterAccount.address,
            to: classicOracle.address,
            value: 0,
            gas: await classicOracle.connect(reporterAccount).estimateGas.receiveResult(oracleId, callback),
            salt: salt,
            data: data
        }
        const signedRequest = await reporterAccount._signTypedData(domain, types, forwardRequest)

        expect(await forwarder.verify(forwardRequest, signedRequest)).is.true
        await expect(forwarder.execute(forwardRequest, signedRequest))
            .to.emit(classicOracle, 'ValueUpdated');
        const { date: foundDate, stringValue: foundValue } = await classicOracle.getString(oracleId);
        expect(date).equal(foundDate);
        expect(value).equal(foundValue);
        expect(await forwarder.isFreeSalt(reporterAccount.address, salt)).is.false;
    });

    it('should not foward since replay attack', async () => {
        const data = classicOracle.interface.encodeFunctionData("receiveResult", [oracleId, callback])
        const salt = ethers.utils.keccak256(new TextEncoder().encode("random"))
        const forwardRequest: SaltyForwarder.ForwardRequestStruct = {
            from: reporterAccount.address,
            to: classicOracle.address,
            value: 0,
            gas: await classicOracle.connect(reporterAccount).estimateGas.receiveResult(oracleId, callback),
            salt: salt,
            data: data
        }
        const signedRequest = await reporterAccount._signTypedData(domain, types, forwardRequest)

        expect(await forwarder.connect(sponsorAccount) //explicitly asking for sponsor account (already default)
            .verify(forwardRequest, signedRequest)).is.true
        await expect(forwarder.connect(sponsorAccount)
            .execute(forwardRequest, signedRequest))
            .to.emit(classicOracle, 'ValueUpdated');
        //verify cannot replay
        expect(await forwarder.verify(forwardRequest, signedRequest)).is.false
        await expect(forwarder.execute(forwardRequest, signedRequest))
            .to.be.revertedWith("SaltyForwarder: signature is invalid or replay attack");
    });

});
