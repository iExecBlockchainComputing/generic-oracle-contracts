# Generic Oracle Contracts

## Overview

```
 +-----------------------------+ +----------------------------+
 |                             | |                            |
 |        Target chain 1       | |       Target chain 2       |
 |  +------------------------+ | | +------------------------+ |
 |  |                        | | | |                        | |
 |  | +--------------------+ | | | | +--------------------+ | |
 |  | |                    | | | | | |                    | | |4t.Read value
 |  | |   GenericOracle    | | | | | |   GenericOracle    <-+-+-----
 |  | |                    | | | | | |                    | | |
 |  | +--------------------+ | | | | +--------------------+ | |
 |  |                        | | | |                        | |
 |  |  SingleReporterOracle  | | | |  SingleReporterOracle  | |
 |  |                        | | | |                        | |
 |  | +--------------------+ | | | | +--------------------+ | |
 |  | |                    | | | | | |                    | | |
 |  | |   IOracleConsumer  | | | | | |   IOracleConsumer  | | |
 |  | |                    | | | | | |                    | | |
 |  | +---------^----------+ | | | | +---------^----------+ | |
 |  |           |            | | | |           |            | |
 |  +-----------+------------+ | | +-----------+------------+ |
 |              |              | |             |              |
 |  +-----------+------------+ | | +-----------+------------+ |
 |  |                        | | | |                        | |
 |  |      SaltyForwarder    | | | |      SaltyForwarder    | |
 |  |                        | | | |                        | |
 |  +------------------^-----+ | | +------^-----------------+ |
 |           on-chain  |       | |        | on-chain          |
 +---------------------+-------+ +--------+-------------------+
                       |                  |
                       +--------+---------+
                      3t.Publish|value
          +---------------------+-----------------------+
          |                     |                       |
          |           +---------+----------+            |
1.Request |           |                    |            |
  update  |           |   2.off-chain      |            |
      ----+----------->      Compute       |            |
          |           |                    |            |
          |           +---------+----------+  off-chain |
          +-- -- -- --3s.Publish|value      -- -- -- -- |
          |                     |              on-chain |
          |         +-----------+------------+          |
          |         |           |            |          |
          |         | +---------v----------+ |          |
          |         | |                    | |          |
          |         | |   IOracleConsumer  | |          |
          |         | |                    | |          |
          |         | +--------------------+ |          |
          |         |                        |          |
          |         |  VerifiedResultOracle  |          |
          |         |                        |          |
          |         | +--------------------+ |          |
          |         | |                    | |          |4s.Read value
          |         | |    GenericOracle   <-+----------+------
          |         | |                    | |          |
          |         | +--------------------+ |          |
          |         |                        |          |
          |         +------------------------+          |
          |                   Source                    |
          +---------------------------------------------+
```

## Build

```sh
npm ci
npm run compile
```

## Test

```sh
npm run test
# OR with coverage
npm run coverage
```

## Scripts

Each deployment require configuration environment variables that can be loaded from a `.env` file (see `.env.template`)

### Deploy native oracle (VerifiedResultOracle)

specific environments:

- `IEXEC_HUB_ADDRESS`: \[optional\] iExec contract address used for oracle updates (default to official deployment or stub contract on "hardhat" network)
- `TARGET_OWNER`: \[optional\] address to transfer the contract ownership to

```sh
npm run deploy-native
# OR
npm run deploy-native -- --network bellecour
```

#### Contract verification

deployment details are saved in the `deployed/<network>/<contract>` folder and can be used to run the verification script

```sh
# ex: contract verification on bellecour
npm run verify -- verify --network bellecour $(cat deployed/bellecour/VerifiedResultOracle/address) $(cat deployed/bellecour/VerifiedResultOracle/constructorArgs)
```

### Deploy x-chain oracle (SaltyForwarder + SingleReporterOracle)

specific environments:

- `AUTHORIZED_REPORTER`: Authorized reporter address for the contract SingleReporterOracle

```sh
npm run deploy-x-chain
# OR
npm run deploy-x-chain -- --network mainnet
```

#### Contract verification

deployment details are saved in the `deployed/<network>/<contract>` folder and can be used to run the verification script

```sh
# ex: contract verification on mainnet
npm run verify -- --network mainnet $(cat deployed/mainnet/SaltyForwarder/address) $(cat deployed/mainnet/SaltyForwarder/constructorArgs)
npm run verify -- --network mainnet $(cat deployed/mainnet/SingleReporterOracle/address) $(cat deployed/mainnet/SingleReporterOracle/constructorArgs)
```

### update env native oracle (VerifiedResultOracle)

specific environments:

- `ORACLE_ADDRESS`: VerifiedResultOracle contract address
- `AUTHORIZED_APP`: task must run with specified app to update the oracle
- `AUTHORIZED_WORKERPOOL`: task must run on specified workerpool to update the oracle
- `REQUIRED_TAG`: task must run with tag to update the oracle

```sh
npm run update-env-native
# OR
npm run update-env-native -- --network bellecour
```

## Dev deployments

- Polygon testnet Amoy

```
SaltyForwarder deployed to: TODO
SingleReporterOracle deployed to: TODO
```

- Ethereum testnet Sepolia

```
SaltyForwarder deployed to: TODO
SingleReporterOracle deployed to: TODO
```

- Bellecour

```
VerifiedResultOracle deployed to: 0x0132DaF5c7C177499c256b5eaC30E7201A9b75e2
```

## Production deployments

- Polygon testnet Amoy

```
SaltyForwarder deployed to: TODO
SingleReporterOracle deployed to: TODO
```

- Polygon Mainnet

```
SaltyForwarder deployed to: 0xc684E8645c8414812f22918146d72d1071E722AE
SingleReporterOracle deployed to: 0x36dA71ccAd7A67053f0a4d9D5f55b725C9A25A3E
```

- Ethereum testnet Sepolia

```
SaltyForwarder deployed to: TODO
SingleReporterOracle deployed to: TODO
```

- Bellecour

```
VerifiedResultOracle deployed to: 0x36dA71ccAd7A67053f0a4d9D5f55b725C9A25A3E
```
