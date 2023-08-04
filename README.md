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
npm run deploy-x-chain -- --network goerli
```

#### Contract verification

deployment details are saved in the `deployed/<network>/<contract>` folder and can be used to run the verification script

```sh
# ex: contract verification on goerli
npm run verify -- --network goerli $(cat deployed/goerli/SaltyForwarder/address) $(cat deployed/goerli/SaltyForwarder/constructorArgs)
npm run verify -- --network goerli $(cat deployed/goerli/SingleReporterOracle/address) $(cat deployed/goerli/SingleReporterOracle/constructorArgs)

```

## Dev deployments

- Polygon Mumbai

```
SaltyForwarder deployed to: 0xa715674ecf9D14141421190b6f8Acf20686b54d7
SingleReporterOracle deployed to: 0x330031CF7e6E2C318Dba230fe25A7f39fD3644EA
```

- Goerli

```
SaltyForwarder deployed to: 0x2aD6aD4F35cf7354fE703da74F459690dBcC12bf
SingleReporterOracle deployed to: 0x8dFf608952ADCDa4cF7320324Db1ef44001BE79b
```

- Bellecour

```
VerifiedResultOracle deployed to: 0x0132DaF5c7C177499c256b5eaC30E7201A9b75e2
```

## Production deployments

- Polygon Mumbai

```
SaltyForwarder deployed to: 0xc684E8645c8414812f22918146d72d1071E722AE
SingleReporterOracle deployed to: 0x36dA71ccAd7A67053f0a4d9D5f55b725C9A25A3E
```

- Polygon Mainnet

```
SaltyForwarder deployed to: 0xc684E8645c8414812f22918146d72d1071E722AE
SingleReporterOracle deployed to: 0x36dA71ccAd7A67053f0a4d9D5f55b725C9A25A3E
```

- Goerli

```
SaltyForwarder deployed to: 0xc684E8645c8414812f22918146d72d1071E722AE
SingleReporterOracle deployed to: 0x36dA71ccAd7A67053f0a4d9D5f55b725C9A25A3E
```

- Bellecour

```
VerifiedResultOracle deployed to: 0x36dA71ccAd7A67053f0a4d9D5f55b725C9A25A3E
```
