FROM trufflesuite/ganache:latest as build

USER root

RUN mkdir /generic-oracle-contracts
COPY . /generic-oracle-contracts
RUN ls /generic-oracle-contracts
RUN mv /generic-oracle-contracts/testchain/.env.testchain /generic-oracle-contracts/.env 

RUN mkdir /ganachedb
RUN bash /generic-oracle-contracts/testchain/deploy.sh

FROM trufflesuite/ganache:latest as runtime

COPY --from=build "/ganachedb" "/ganachedb"

ENTRYPOINT ["node", "/app/dist/node/cli.js", "--chain.networkId", "65535", "--chain.chainId", "65535", "--chain.hardfork", "london", "--database.dbPath", "/ganachedb"]
CMD []
