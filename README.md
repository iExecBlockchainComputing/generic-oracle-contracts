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

```
npx hardhat compile
npx hardhat coverage
```

## Deploy

```
npx hardhat run scripts/deploy.ts --network goerli
```

## Verify

- Automatic

```
npx hardhat verify --network <network> <SaltyForwarderAddress>
npx hardhat verify --network <network> <SingleReporterOracleAddress> "0x767A2D69D7278F200ae1F79a00Ac2CaE299dD784" "<SaltyForwarderAddress>"
```

See: https://mumbai.polygonscan.com/

- Manual

```
npx hardhat flatten contracts/VerifiedResultOracle.sol  > VerifiedResultOracle_flat.sol
```

with couple updates to clean imported interfaces, pragmas, licenses (`SPDX-License-Identifier: X AND Y`), ..

## NPM publish

```
npm publish --access public
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
