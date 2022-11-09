# Generic Oracle Contracts

## Overview
```
      +------------------------+ +------------------------+
      |                        | |                        |
      |    Target chain 1      | |   Target chain 2       |
      | +--------------------+ | | +--------------------+ |
      | |                    | | | |                    | |  Read value
      | |   GenericOracle    | | | |   GenericOracle    <-+-------
      | |                    | | | |                    | |
      | +---------^----------+ | | +---------^----------+ |
      |           |            | |           |            |
      | +---------+----------+ | | +---------+----------+ |
      | |                    | | | |                    | |
      | |SingleReporterOracle| | | |SingleReporterOracle| |
      | |                    | | | |                    | |
      | +---------^----------+ | | +---------^----------+ |
      |           |            | |           |            |
      | +---------+----------+ | | +---------+----------+ |
      | |                    | | | |                    | |
      | |   SaltyForwarder   | | | |   SaltyForwarder   | |
      | |                    | | | |                    | |
      | +--------------^-----+ | | +-^------------------+ |
      |       on-chain |       | |   |     on-chain       |
      +----------------+-------+ +---+--------------------+
                       |             |
                       +------+------+
                Publish value |
        +---------------------+-----------------------+
        |                     |                       |
        |           +---------+----------+            |
Request |           |                    |            |
update  |           |     off-chain      |  off-chain |
    ----+----------->      Compute       |            |
        |           |                    |            |
        |           +---------+----------+            |
        +-- --  Publish value |           -- -- -- -- |
        |           +---------v----------+            |
        |           |                    |            |
        |           |                    |            |
        |           |VerifiedResultOracle|   on-chain |
        |           |                    |            |
        |           +---------+----------+            |
        |                     |                       |
        |           +---------v----------+            |
        |           |                    |            |     Read value
        |           |   GenericOracle    <------------+----------
        |           |                    |            |
        |           +--------------------+            |
        |                                             |
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
```
npx hardhat verify --network <network> <SaltyForwarderAddress>
npx hardhat verify --network <network> <SingleReporterOracleAddress> "0x767A2D69D7278F200ae1F79a00Ac2CaE299dD784" "<SaltyForwarderAddress>"
```
See: https://mumbai.polygonscan.com/

## NPM publish
```
npm publish --access public
```

## Testnets (not necessarily up-to-date)
* Polygon Mumbai
```
SaltyForwarder deployed to: 0xa715674ecf9D14141421190b6f8Acf20686b54d7
SingleReporterOracle deployed to: 0x330031CF7e6E2C318Dba230fe25A7f39fD3644EA
```
* Goerli
```
SaltyForwarder deployed to: 0x2aD6aD4F35cf7354fE703da74F459690dBcC12bf
SingleReporterOracle deployed to: 0x8dFf608952ADCDa4cF7320324Db1ef44001BE79b
```
* Bellecour
```
VerifiedResultOracle deployed to: 0xc83b0110F91aD082b580D894BE6c8660cf1FB26d
(SaltyForwarder deployed to: 0x1aAD77fd3C410096b14B2856cF04E63762A7a00C)
(SingleReporterOracle deployed to: 0x9A9E20717De105673fc7F1C357F5725Cb78114DA)
```