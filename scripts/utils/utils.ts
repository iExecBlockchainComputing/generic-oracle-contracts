import fs from 'fs/promises';
import path from 'path';

export const saveDeployed = async ({
  contractName,
  chainId,
  address,
  constructorArgs,
}: {
  contractName: string;
  chainId: number;
  address: string;
  constructorArgs: string[];
}) => {
  const deploymentPath = path.join(
    'deployed',
    chainId.toString(),
    contractName
  );
  console.log(`saving deployment to ${deploymentPath}`);
  await fs.mkdir(deploymentPath, { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(deploymentPath, 'address'), address),
    fs.writeFile(
      path.join(deploymentPath, 'constructorArgs'),
      constructorArgs.join(' ')
    ),
  ]);
};
