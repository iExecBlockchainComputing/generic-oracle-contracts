import { ethers, network } from 'hardhat';
import { exit } from 'process';

async function main() {
  const [owner] = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId;
  let oracleAddress = process.env.ORACLE_ADDRESS ?? '';
  const authorizedApp = process.env.AUTHORIZED_APP ?? '';
  const authorizedDataset = ethers.constants.AddressZero; // any dataset can be used
  const authorizedWorkerpool = process.env.AUTHORIZED_WORKERPOOL ?? '';
  const requiredTag = process.env.REQUIRED_TAG ?? '';
  const requiredTrust = '0'; // no trust is required when using TEE

  if (!oracleAddress) {
    if (network.name === 'hardhat') {
      // on hardhat only create prerequisites
      console.log('deploying stub contract for iexec');
      const StubFactory = await ethers.getContractFactory('Stub');
      const stub = await StubFactory.connect(owner).deploy();
      console.log(`Stub:${stub.address} [tx:${stub.deployTransaction.hash}]`);
      await stub.deployTransaction.wait();
      console.log('deploying VerifiedResultOracle contract');
      const VerifiedResultOracleFactory = await ethers.getContractFactory(
        'VerifiedResultOracle'
      );
      const verifiedResultOracle = await VerifiedResultOracleFactory.connect(
        owner
      ).deploy(stub.address);
      await verifiedResultOracle.deployTransaction.wait();
      console.log(
        `VerifiedResultOracle:${verifiedResultOracle.address} [tx:${verifiedResultOracle.deployTransaction.hash}]`
      );
      oracleAddress = verifiedResultOracle.address;
    } else {
      throw Error('missing ORACLE_ADDRESS');
    }
  }

  console.log('VerifiedResultOracle contract:', oracleAddress);
  console.log('Chain ID:', chainId);
  console.log('Owner:', owner.address);
  console.log(
    `New env:\n${Object.entries({
      authorizedApp,
      authorizedDataset,
      authorizedWorkerpool,
      requiredTag,
      requiredTrust,
    })
      .map(([k, v]) => `- ${k}: ${v}`)
      .join('\n')}`
  );

  const VerifiedResultOracleFactory = await ethers.getContractFactory(
    'VerifiedResultOracle'
  );
  const verifiedResultOracle =
    VerifiedResultOracleFactory.attach(oracleAddress);
  const updateEnvTx = await verifiedResultOracle.updateEnv(
    authorizedApp,
    authorizedDataset,
    authorizedWorkerpool,
    requiredTag,
    requiredTrust
  );
  await updateEnvTx.wait();
  console.log(`VerifiedResultOracle env updated [tx:${updateEnvTx.hash}]`);
  exit(0);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
