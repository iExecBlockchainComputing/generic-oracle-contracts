import { expect } from "chai";
import { ethers } from "hardhat";
import { ClassicOracle, MinimalForwarder } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("MinimalForwarder", function () {
    let defaultAccount: SignerWithAddress
    let reporterAccount: SignerWithAddress
    let forwarder: MinimalForwarder
    let classicOracle: ClassicOracle
    const oracleId = ethers.utils.keccak256(new TextEncoder().encode("oracleId"))
    const date: BigInt = generateDate();
    const value: string = 'abcd';
    const callback: string = buildCallback(oracleId, date, ethers.utils.defaultAbiCoder.encode(['string'], [value]));
    console.log("oracleId: " + oracleId);

    beforeEach("Fresh contract & accounts", async () => {
        [defaultAccount, reporterAccount] = await ethers.getSigners();

        const MinimalForwarderFactory = await ethers.getContractFactory("MinimalForwarder")
        forwarder = await MinimalForwarderFactory.deploy()
        const ClassicOracleFactory = await ethers.getContractFactory("ClassicOracle")
        classicOracle = await ClassicOracleFactory.deploy(reporterAccount.address, forwarder.address)
    });

    it('should', async () => {
        const data = classicOracle.interface.encodeFunctionData("receiveResult", [oracleId, callback])

        const forwardRequest: MinimalForwarder.ForwardRequestStruct = {
            from: reporterAccount.address,
            to: classicOracle.address,
            value: 0,
            gas: await classicOracle.connect(reporterAccount).estimateGas.receiveResult(oracleId, callback),
            nonce: 0, //TODO: replace nonce with salt
            data: data
        }

        const domain = {
            name: "MinimalForwarder",
            version: "0.0.1",
            chainId: ethers.provider.network.chainId,
            verifyingContract: forwarder.address,
        };
        const types = {
            ForwardRequest: [
                { name: 'from', type: 'address' },
                { name: 'to', type: 'address' },
                { name: 'value', type: 'uint256' },
                { name: 'gas', type: 'uint256' },
                { name: 'nonce', type: 'uint256' },
                { name: 'data', type: 'bytes' },
            ],
        };

        const signedRequest = await reporterAccount._signTypedData(domain, types, forwardRequest)

        expect(await forwarder.verify(forwardRequest, signedRequest)).is.true

        await expect(forwarder.execute(forwardRequest, signedRequest))
            .to.emit(classicOracle, 'ValueUpdated');

        const { date: foundDate, stringValue: foundValue } = await classicOracle.getString(oracleId);
        expect(date).equal(foundDate);
        expect(value).equal(foundValue);

        //console.log(await forwarder.getNonce(reporterAccount.address))
    });


});

function generateDate(): BigInt {
    return BigInt(new Date().getTime());
}

function buildCallback(oracleId: string, date: BigInt, encodedTypedValue: string): string {
    return ethers.utils.defaultAbiCoder.encode(['bytes32', 'uint256', 'bytes'], [oracleId, date, encodedTypedValue]);
}
