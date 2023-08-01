import { ethers } from 'hardhat';
import { exit } from 'process';
import { saveDeployed } from './utils/utils';

const iexecHubAddress =
  process.env.IEXEC_HUB_ADDRESS || '0x3eca1B216A7DF1C7689aEb259fFB83ADFB894E7f';

async function main() {
  const [deployer] = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId;
  console.log('Deploying contracts..');
  console.log('Chain ID: ', chainId);
  console.log('Deployer: ', deployer.address);

  const VerifiedResultOracleFactory = await ethers.getContractFactory(
    'VerifiedResultOracle'
  );
  // All submitted results will be verified against an existing iExec Hub
  const verifiedResultOracle = await VerifiedResultOracleFactory.deploy(
    iexecHubAddress
  );
  await verifiedResultOracle.deployTransaction.wait();
  console.log(
    'VerifiedResultOracle:%s [tx:%s]',
    verifiedResultOracle.address,
    verifiedResultOracle.deployTransaction.hash
  );
  await saveDeployed({
    contractName: 'VerifiedResultOracle',
    chainId,
    address: verifiedResultOracle.address,
    constructorArgs: [iexecHubAddress],
  });
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
