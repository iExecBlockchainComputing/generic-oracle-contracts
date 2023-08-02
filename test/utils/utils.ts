import { ethers } from 'hardhat';

export function generateDate(): BigInt {
  return BigInt(new Date().getTime());
}

export function buildCallback(
  oracleId: string,
  date: BigInt,
  encodedTypedValue: string
): string {
  return ethers.utils.defaultAbiCoder.encode(
    ['bytes32', 'uint256', 'bytes'],
    [oracleId, date, encodedTypedValue]
  );
}
