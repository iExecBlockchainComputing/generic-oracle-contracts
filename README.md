# Generic Oracle Contracts

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
npx hardhat verify --network <network> <ClassicOracleAddress> "0x767A2D69D7278F200ae1F79a00Ac2CaE299dD784" "<SaltyForwarderAddress>"
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
ClassicOracle deployed to: 0x68bDfa911178f72CEA7BCFd0FeEbbA4cDDE24eCF
```
* Goerli
```
ClassicOracle deployed to: 0x28291E6A81aC30cE6099144E68D8aEeE2b64052b
```