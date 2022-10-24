#!/usr/bin/env bash
echo "========== STARTING BLOCKCHAIN ==========";
nohup node /app/dist/node/cli.js --wallet.mnemonic "swarm misery witness trophy legal auto barely subject later rocket strike gown" --chain.networkId 65535 --chain.chainId 65535 --chain.hardfork berlin --database.dbPath "/ganachedb" > deployed.txt 2>&1 &
sleep 4

cd /generic-oracle-contracts && \
  echo "========== INSTALL DEPENDENCIES ==========" && \
  bash -i -c "npm ci --production=false" && \
  echo "========== DEPLOYMENT ==========" && \
  bash -i -c "./node_modules/.bin/hardhat run scripts/deploy.ts --network local"