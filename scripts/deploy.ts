import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    const chainId = (await ethers.provider.getNetwork()).chainId
    const chainName = (await ethers.provider.getNetwork()).name
    console.log("Deploying contracts..");
    console.log("Chain ID: ", chainId);
    console.log("Deployer: ", deployer.address);
    const authorizedReporter = '0x767A2D69D7278F200ae1F79a00Ac2CaE299dD784'

    const SaltyForwarderFactory = await ethers.getContractFactory("SaltyForwarder")
    const forwarder = await SaltyForwarderFactory.deploy()
    await forwarder.deployTransaction.wait()
    console.log("SaltyForwarder deployed to:", forwarder.address);
    const ClassicOracleFactory = await ethers.getContractFactory("ClassicOracle")
    const classicOracle = await ClassicOracleFactory.deploy(authorizedReporter, forwarder.address)
    await classicOracle.deployTransaction.wait()
    console.log("ClassicOracle deployed to:", classicOracle.address);

    console.log("Please verify Forwarder & ClassicOracle with:")
    // npx hardhat verify --network <network> <SaltyForwarderAddress>
    console.log("npx hardhat verify --network %s %s", chainName, forwarder.address)
    // npx hardhat verify --network <network> <ClassicOracleAddress> "0x767A2D69D7278F200ae1F79a00Ac2CaE299dD784" "<SaltyForwarderAddress>"
    console.log("npx hardhat verify --network %s %s %s %s", chainName, classicOracle.address, authorizedReporter, forwarder.address)

    // Should only be deployed on source chain
    if(chainId == 134){
        const GenericOracleFactory = await ethers.getContractFactory("GenericOracle")
        const genericOracle = await GenericOracleFactory.deploy("0x3eca1B216A7DF1C7689aEb259fFB83ADFB894E7f")
        await genericOracle.deployTransaction.wait()
        console.log("GenericOracle deployed to:", genericOracle.address);
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
