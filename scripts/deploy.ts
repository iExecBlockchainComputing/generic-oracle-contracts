import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const ClassicOracle = await ethers.getContractFactory("ClassicOracle");
    const authorizedReporter = '0x767A2D69D7278F200ae1F79a00Ac2CaE299dD784'
    const classicOracle = await ClassicOracle.deploy(authorizedReporter);
    await classicOracle.deployed();
    console.log("ClassicOracle deployed to:", classicOracle.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
