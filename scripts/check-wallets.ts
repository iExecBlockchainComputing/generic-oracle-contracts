import { Wallet } from 'ethers';

console.log(
  `prod wallet address ${new Wallet(process.env.PROD_WALLET || '').address}`
);
console.log(
  `dev wallet address ${new Wallet(process.env.DEV_WALLET || '').address}`
);
