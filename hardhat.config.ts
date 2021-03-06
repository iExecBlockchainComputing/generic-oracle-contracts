import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-etherscan";
import { config as dotEnvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/types";
import "solidity-coverage"

dotEnvConfig();
var PRIVATE_KEY: string = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000"
var INFURA_API_KEY: string = process.env.INFURA_API_KEY || ""
var ETHERSCAN_API_KEY: string = process.env.ETHERSCAN_API_KEY || ""


const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
    },
    goerli: {
      url: 'https://goerli.infura.io/v3/' + INFURA_API_KEY,
      accounts: [PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  solidity: {
    compilers: [
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      }
    ],
  },
  typechain: {
    outDir: 'typechain'
  },
};

module.exports = config;
