import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SingleReporterOracle, MinimalForwarder } from '../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { generateDate, buildCallback } from './utils/utils';

describe('MinimalForwarder', function () {
  let sponsorAccount: SignerWithAddress;
  let reporterAccount: SignerWithAddress;
  let forwarderContract: MinimalForwarder;
  let singleReporterOracle: SingleReporterOracle;
  const oracleId = ethers.utils.keccak256(new TextEncoder().encode('oracleId'));
  const date: BigInt = generateDate();
  const value: string = 'abcd';
  const callback: string = buildCallback(
    oracleId,
    date,
    ethers.utils.defaultAbiCoder.encode(['string'], [value])
  );
  console.log('oracleId: ' + oracleId);

  beforeEach('Fresh contract & accounts', async () => {
    [sponsorAccount, reporterAccount] = await ethers.getSigners();
    const MinimalForwarderFactory = await ethers.getContractFactory(
      'MinimalForwarder'
    );
    forwarderContract = await MinimalForwarderFactory.deploy();
    const SingleReporterOracleFactory = await ethers.getContractFactory(
      'SingleReporterOracle'
    );
    singleReporterOracle = await SingleReporterOracleFactory.deploy(
      reporterAccount.address,
      forwarderContract.address
    );
  });

  it('should forward with nonce', async () => {
    const data = singleReporterOracle.interface.encodeFunctionData(
      'receiveResult',
      [oracleId, callback]
    );
    const forwardRequest: MinimalForwarder.ForwardRequestStruct = {
      from: reporterAccount.address,
      to: singleReporterOracle.address,
      value: 0,
      gas: await singleReporterOracle
        .connect(reporterAccount)
        .estimateGas.receiveResult(oracleId, callback),
      nonce: 0,
      data: data,
    };
    const domain = {
      name: 'MinimalForwarder',
      version: '0.0.1',
      chainId: ethers.provider.network.chainId,
      verifyingContract: forwarderContract.address,
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
    const signedRequest = await reporterAccount._signTypedData(
      domain,
      types,
      forwardRequest
    );

    expect(
      await forwarderContract
        .connect(sponsorAccount) //explicitly asking for sponsor account (already default)
        .verify(forwardRequest, signedRequest)
    ).is.true;
    await expect(
      forwarderContract
        .connect(sponsorAccount)
        .execute(forwardRequest, signedRequest)
    ).to.emit(singleReporterOracle, 'ValueUpdated');
    const { date: foundDate, stringValue: foundValue } =
      await singleReporterOracle.getString(oracleId);
    expect(date).equal(foundDate);
    expect(value).equal(foundValue);
  });
});
