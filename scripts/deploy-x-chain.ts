import { ethers } from 'hardhat';
import { exit } from 'process';
import { saveDeployed } from './utils/utils';

const authorizedReporter =
  process.env.AUTHORIZED_REPORTER ??
  '0xa1135C5f1309eF9836679d31d7bea9846827f699';

async function main() {
  const [deployer] = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId;
  console.log('Deploying contracts...');
  console.log('Chain ID: ', chainId);
  console.log('Deployer: ', deployer.address);

  const SaltyForwarderFactory = await ethers.getContractFactory(
    'SaltyForwarder'
  );
  const forwarder = await SaltyForwarderFactory.deploy();
  await forwarder.deployTransaction.wait();
  console.log(
    `SaltyForwarder: ${forwarder.address} [tx:${forwarder.deployTransaction.hash}]`
  );
  await saveDeployed({
    contractName: 'SaltyForwarder',
    chainId,
    address: forwarder.address,
    constructorArgs: [],
  });

  const SingleReporterOracleFactory = await ethers.getContractFactory(
    'SingleReporterOracle'
  );
  const singleReporterOracle = await SingleReporterOracleFactory.deploy(
    authorizedReporter,
    forwarder.address
  );
  await singleReporterOracle.deployTransaction.wait();
  console.log(
    `SingleReporterOracle: ${singleReporterOracle.address} [tx:${singleReporterOracle.deployTransaction.hash}]`
  );
  await saveDeployed({
    contractName: 'SingleReporterOracle',
    chainId,
    address: singleReporterOracle.address,
    constructorArgs: [authorizedReporter, forwarder.address],
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
