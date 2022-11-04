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
SaltyForwarder deployed to: 0x6843aA5A3a777Ae750DD9d93a9D0fdF99e061b53
SingleReporterOracle deployed to: 0x68bDfa911178f72CEA7BCFd0FeEbbA4cDDE24eCF
```
* Goerli
```
SaltyForwarder deployed to: 0xc83de370A0D1C99F3D3D9e77bd930520ded81fFA
SingleReporterOracle deployed to: 0x8Ad317241854b1A29A06cE5478e6B92FA09Cd03a
```