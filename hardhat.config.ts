import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ethers';
import '@typechain/hardhat';
import '@nomiclabs/hardhat-etherscan';
import { config as dotEnvConfig } from 'dotenv';
import { HardhatUserConfig } from 'hardhat/types';
import 'solidity-coverage';

dotEnvConfig();
const PRIVATE_KEY: string =
  process.env.PRIVATE_KEY ??
  '0x0000000000000000000000000000000000000000000000000000000000000000';
const INFURA_API_KEY: string = process.env.INFURA_API_KEY ?? '';
const ETHERSCAN_API_KEY: string = process.env.ETHERSCAN_API_KEY ?? '';
const POLYSCAN_API_KEY: string = process.env.POLYSCAN_API_KEY ?? '';

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {},
    mainnet: {
      url: 'https://mainnet.infura.io/v3/' + INFURA_API_KEY,
      accounts: [PRIVATE_KEY],
    },
    sepolia: {
      url: 'https://sepolia.infura.io/v3/' + INFURA_API_KEY,
      accounts: [PRIVATE_KEY],
    },
    polygon: {
      url: 'https://polygon-mainnet.infura.io/v3/' + INFURA_API_KEY,
      accounts: [PRIVATE_KEY],
    },
    polygonAmoy: {
      url: 'https://polygon-amoy.infura.io/v3/' + INFURA_API_KEY,
      accounts: [PRIVATE_KEY],
    },
    bellecour: {
      url: 'https://bellecour.iex.ec',
      accounts: [PRIVATE_KEY],
    },
    'dev-native': {
      chainId: 65535,
      gasPrice: 0,
      blockGasLimit: 6_700_000,
      hardfork: 'berlin',
      url: process.env.RPC_URL ?? 'http://localhost:8545',
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
      polygon: POLYSCAN_API_KEY,
      polygonAmoy: POLYSCAN_API_KEY,
      bellecour: 'abc',
    },
    customChains: [
      {
        network: 'bellecour',
        chainId: 134,
        urls: {
          apiURL: 'https://blockscout-bellecour.iex.ec/api',
          browserURL: 'https://blockscout-bellecour.iex.ec',
        },
      },
      {
        network: 'polygonAmoy',
        chainId: 80002,
        urls: {
          apiURL: 'https://api-amoy.polygonscan.com/api',
          browserURL: 'https://amoy.polygonscan.com/',
        },
      },
    ],
  },
  solidity: {
    compilers: [
      {
        version: '0.6.12',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.8.15',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  typechain: {
    outDir: 'typechain',
  },
};

module.exports = config;
