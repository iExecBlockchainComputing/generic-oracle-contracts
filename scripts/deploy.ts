import { ethers } from 'hardhat';
import { exit } from 'process';

const iexecHubAddress = '0x3eca1B216A7DF1C7689aEb259fFB83ADFB894E7f';
// Dev environment: Goerli, Mumbai
//const authorizedReporter = '0x767A2D69D7278F200ae1F79a00Ac2CaE299dD784'
// Prod environment: Mainnet, Polygon, Goerli, Mumbai
const authorizedReporter = '0xa1135C5f1309eF9836679d31d7bea9846827f699';

async function main() {
  const [deployer] = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId;
  const chainName = (await ethers.provider.getNetwork()).name;
  console.log('Deploying contracts..');
  console.log('Chain ID: ', chainId);
  console.log('Deployer: ', deployer.address);

  // Should only be deployed on source chain
  if (chainId == 134) {
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
    exit(0);
  }

  //Just a safety net to ensure reporter is properly set for deployments
  // on mainnet networks (Mainnet, Polygon)
  if (
    (chainId == 1 || chainId == 137) &&
    authorizedReporter.toLowerCase() !=
      '0xa1135C5f1309eF9836679d31d7bea9846827f699'.toLowerCase()
  ) {
    console.log(
      'Do you really want to deploy SingleReporterOracle on network:%s with reporter:%s?',
      chainId,
      authorizedReporter
    );
    exit(1);
  }

  const SaltyForwarderFactory = await ethers.getContractFactory(
    'SaltyForwarder'
  );
  const forwarder = await SaltyForwarderFactory.deploy();
  await forwarder.deployTransaction.wait();
  console.log(
    'SaltyForwarder: %s [tx:%s]',
    forwarder.address,
    forwarder.deployTransaction.hash
  );
  const SingleReporterOracleFactory = await ethers.getContractFactory(
    'SingleReporterOracle'
  );
  const singleReporterOracle = await SingleReporterOracleFactory.deploy(
    authorizedReporter,
    forwarder.address
  );
  await singleReporterOracle.deployTransaction.wait();
  console.log(
    'SingleReporterOracle: %s [tx:%s]',
    singleReporterOracle.address,
    singleReporterOracle.deployTransaction.hash
  );

  console.log('Please verify Forwarder & SingleReporterOracle with:');
  // Replace chain ID by network name in --network <network> option
  // npx hardhat verify --network <network> <SaltyForwarderAddress>
  console.log('npx hardhat verify --network %s %s', chainId, forwarder.address);
  // npx hardhat verify --network <network> <SingleReporterOracleAddress> "0x767A2D69D7278F200ae1F79a00Ac2CaE299dD784" "<SaltyForwarderAddress>"
  console.log(
    'npx hardhat verify --network %s %s %s %s',
    chainId,
    singleReporterOracle.address,
    authorizedReporter,
    forwarder.address
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
