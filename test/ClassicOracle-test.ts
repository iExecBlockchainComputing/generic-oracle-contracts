import { expect } from "chai";
import { ethers } from "hardhat";
import { ClassicOracle } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { generateDate, buildCallback } from "./utils/utils";


describe("ClassicOracle", function () {
    let defaultAccount: SignerWithAddress
    let reporterAccount: SignerWithAddress
    let forwarder = ethers.constants.AddressZero
    let classicOracle: ClassicOracle
    const oracleId = ethers.utils.keccak256(new TextEncoder().encode("oracleId"))
    console.log("oracleId: " + oracleId);

    beforeEach("Fresh contract & accounts", async () => {
        [defaultAccount, reporterAccount] = await ethers.getSigners();

        const ClassicOracleFactory = await ethers.getContractFactory("ClassicOracle")
        classicOracle = await ClassicOracleFactory.deploy(reporterAccount.address, forwarder)
    });

    it('should not construct when authorized reporter is 0x0', async () => {
        const ClassicOracleFactory = await ethers.getContractFactory("ClassicOracle")
        await expect(ClassicOracleFactory.deploy(ethers.constants.AddressZero, forwarder))
            .to.be.reverted;
    });

    it('should construct with custom address as authorized reporter', async () => {
        expect(await classicOracle.authorizedReporter()).equal(reporterAccount.address)
    });

    it('should not receive since reporter not authorized', async () => {
        const date: BigInt = generateDate();
        const value: string = 'abcd';
        const callback: string = buildCallback(oracleId, date, ethers.utils.defaultAbiCoder.encode(['string'], [value]));

        await expect(classicOracle.connect(defaultAccount).receiveResult(oracleId, callback))
            .to.be.revertedWith("Reporter is not authorized");
    });

    it('should receive and get timed string value', async () => {
        const date: BigInt = generateDate();
        const value: string = 'abcd';
        const callback: string = buildCallback(oracleId, date, ethers.utils.defaultAbiCoder.encode(['string'], [value]));

        await expect(classicOracle.connect(reporterAccount).receiveResult(oracleId, callback))
            .to.emit(classicOracle, 'ValueUpdated');

        const { date: foundDate, stringValue: foundValue } = await classicOracle.getString(oracleId);
        expect(date).equal(foundDate);
        expect(value).equal(foundValue);
    });

    it('should get timed int value', async () => {
        const date: BigInt = generateDate();
        const value: Number = 123456789;
        const callback: string = buildCallback(oracleId, date, ethers.utils.defaultAbiCoder.encode(['int'], [value]));
        await classicOracle.connect(reporterAccount).receiveResult(oracleId, callback)

        const { date: foundDate, intValue: foundValue } = await classicOracle.getInt(oracleId);
        expect(date).equal(foundDate);
        expect(value).equal(foundValue);
    });

    it('should get timed bool value', async () => {
        const date: BigInt = generateDate();
        const value: boolean = true;
        const callback: string = buildCallback(oracleId, date, ethers.utils.defaultAbiCoder.encode(['bool'], [value]));
        await classicOracle.connect(reporterAccount).receiveResult(oracleId, callback)

        const { date: foundDate, boolValue: foundValue } = await classicOracle.getBool(oracleId);
        expect(date).equal(foundDate);
        expect(foundValue).to.be.true;
    });

    it('should get timed bytes value', async () => {
        const date: BigInt = generateDate();
        const value: string = "0xaaaabbbbccccddddeeeeffff0000111122223333444455556666777788889999"
        const callback: string = buildCallback(oracleId, date, ethers.utils.defaultAbiCoder.encode(['bytes32'], [value]));
        await classicOracle.connect(reporterAccount).receiveResult(oracleId, callback)

        const { date: foundDate, bytesValue: foundValue } = await classicOracle.getRaw(oracleId);
        expect(date).equal(foundDate);
        expect(value).equal(foundValue);
    });

});
