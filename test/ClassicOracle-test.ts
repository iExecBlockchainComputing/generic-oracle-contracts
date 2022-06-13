import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { ClassicOracle, ClassicOracle__factory } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";


describe("ClassicOracle", function () {
    let accountOne: SignerWithAddress
    let accountTwo: SignerWithAddress
    let classicOracle: ClassicOracle
    const oracleId = ethers.utils.keccak256(new TextEncoder().encode("oracleId"))
    console.log("oracleId: " + oracleId);

    beforeEach("Fresh contract & accounts", async () => {
        [accountOne, accountTwo] = await ethers.getSigners();

        const ClassicOracleFactory = await ethers.getContractFactory("ClassicOracle")
        classicOracle = await ClassicOracleFactory.deploy(accountTwo.address)
    });

    it('should construct with owner address as authorized reporter', async () => {
        const ClassicOracleFactory = await ethers.getContractFactory("ClassicOracle")
        classicOracle = await ClassicOracleFactory.deploy(ethers.constants.AddressZero)
        expect(await classicOracle.authorizedReporter()).equal(accountOne.address)
    });

    it('should construct with custom address as authorized reporter', async () => {
        expect(await classicOracle.authorizedReporter()).equal(accountTwo.address)
    });

    it('should not receive since reporter not authorized', async () => {
        const date: BigInt = generateDate();
        const value: string = 'abcd';
        const callback: string = buildCallback(oracleId, date, ethers.utils.defaultAbiCoder.encode(['string'], [value]));

        await expect(classicOracle.connect(accountOne).receiveResult(oracleId, callback))
            .to.be.revertedWith("Reporter is not authorized");
    });

    it('should receive and get timed string value', async () => {
        const date: BigInt = generateDate();
        const value: string = 'abcd';
        const callback: string = buildCallback(oracleId, date, ethers.utils.defaultAbiCoder.encode(['string'], [value]));

        await expect(classicOracle.connect(accountTwo).receiveResult(oracleId, callback))
            .to.emit(classicOracle, 'ValueUpdated');

        const { date: foundDate, stringValue: foundValue } = await classicOracle.getString(oracleId);
        expect(date).equal(foundDate);
        expect(value).equal(foundValue);
    });

    it('should get timed int value', async () => {
        const date: BigInt = generateDate();
        const value: Number = 123456789;
        const callback: string = buildCallback(oracleId, date, ethers.utils.defaultAbiCoder.encode(['int'], [value]));
        await classicOracle.connect(accountTwo).receiveResult(oracleId, callback)

        const { date: foundDate, intValue: foundValue } = await classicOracle.getInt(oracleId);
        expect(date).equal(foundDate);
        expect(value).equal(foundValue);
    });

    it('should get timed bool value', async () => {
        const date: BigInt = generateDate();
        const value: boolean = true;
        const callback: string = buildCallback(oracleId, date, ethers.utils.defaultAbiCoder.encode(['bool'], [value]));
        await classicOracle.connect(accountTwo).receiveResult(oracleId, callback)

        const { date: foundDate, boolValue: foundValue } = await classicOracle.getBool(oracleId);
        expect(date).equal(foundDate);
        expect(foundValue).to.be.true;
    });

    it('should get timed bytes value', async () => {
        const date: BigInt = generateDate();
        const value: string = "0xaaaabbbbccccddddeeeeffff0000111122223333444455556666777788889999"
        const callback: string = buildCallback(oracleId, date, ethers.utils.defaultAbiCoder.encode(['bytes32'], [value]));
        await classicOracle.connect(accountTwo).receiveResult(oracleId, callback)

        const { date: foundDate, bytesValue: foundValue } = await classicOracle.getRaw(oracleId);
        expect(date).equal(foundDate);
        expect(value).equal(foundValue);
    });

});

function generateDate(): BigInt {
    return BigInt(new Date().getTime());
}

function buildCallback(oracleId: string, date: BigInt, encodedTypedValue: string): string {
    return ethers.utils.defaultAbiCoder.encode(['bytes32', 'uint256', 'bytes'], [oracleId, date, encodedTypedValue]);
}