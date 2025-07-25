# KlimaDAO Protocol Subgraphs

The main subgraph repo that houses all of the data associated with the KlimaDAO protocol (except the tokenized carbon subgraphs which live [here](https://github.com/klimadao/carbon-subgraph)).

## Local Installation

First, deploy a Graph node locally. The most straightforward option is to use
`docker-compose` from the [graph-node](https://github.com/graphprotocol/graph-node/tree/master/docker#docker-compose) repo.
Make sure to update the `ethereum` environment variable of `graph-node` in `docker/docker-compose.yml` to `matic:https://polygon-rpc.com/`.

For information on getting started with a Graph Node see this link: https://github.com/graphprotocol/graph-node/blob/master/docs/getting-started.md

Install any needed packages.

```
npm run
```

Navigate to the desired subgraph deployment folder. Then create the subgraph instance

```
npm run create-local
```

Finally run codegen and deploy the subgraph and start indexing.

```
npm run codegen && npm run deploy-local
```

## Local Navigation and Querying

After the subgraph is deployed, navigate to http://127.0.01:8000/subgraphs/name/name-of-subgraph. You can then create GraphQL queries and view the returned data.

## Deployed Hosted Service Subgraphs

- Protocol Metrics: [Staging](https://thegraph.com/hosted-service/subgraph/klimadao/staging-klimadao-protocol-metrics) | [Production](https://thegraph.com/hosted-service/subgraph/klimadao/klimadao-protocol-metrics)
- Bonds: [Staging](https://thegraph.com/hosted-service/subgraph/klimadao/staging-klimadao-bonds) | [Production](https://thegraph.com/hosted-service/subgraph/klimadao/klimadao-bonds)
- Vesting: [Staging](https://thegraph.com/hosted-service/subgraph/klimadao/staging-klimadao-vesting) | [Production](https://thegraph.com/hosted-service/subgraph/klimadao/klimadao-vesting)
- Carbon Users: [Staging](https://thegraph.com/hosted-service/subgraph/klimadao/staging-klimadao-carbon-users) | [Production](https://thegraph.com/hosted-service/subgraph/klimadao/klimadao-carbon-users)
- Token Pairs: [Staging](https://thegraph.com/hosted-service/subgraph/klimadao/staging-klimadao-pairs) | [Production](https://thegraph.com/hosted-service/subgraph/klimadao/klimadao-pairs)
- Polygon Digital Carbon: [Staging](https://thegraph.com/hosted-service/subgraph/klimadao/staging-polygon-digital-carbon) | [Production](https://thegraph.com/hosted-service/subgraph/klimadao/polygon-digital-carbon)
- Ethereum Bridged Carbon: [Staging](https://thegraph.com/hosted-service/subgraph/klimadao/staging-ethereum-bridged-carbon) | [Production](https://thegraph.com/hosted-service/subgraph/klimadao/ethereum-bridged-carbon)
- Celo Bridged Carbon: [Staging](https://thegraph.com/hosted-service/subgraph/klimadao/staging-celo-bridged-carbon) | [Production](https://thegraph.com/hosted-service/subgraph/klimadao/celo-bridged-carbon)

### Note for non Ubuntu linux developers

A bug in Matchstick prevents the `npm run test` copmmand to run correctly.
You can use the workaround described here: https://github.com/graphprotocol/graph-tooling/issues/1546#issuecomment-2182244898

### Add credits definitions on the fly

Adding credits definitions normally requires updating the `lib/projects/Projects.ts` file and recompiling and redeploying the Marketplace and Polygon Digital Carbon subgraphs.
This process is not optimal because the subgraphs deployments are tedious and long.

Projects can be added on the fly (without redeploying the contracts) by updating the CreditManager contract.

- update the `lib/projects/Projects.ts` file with the new project's definitions
- set your `ALCHEMY_API_KEY` environment variable
- set your `PRIVATE_KEY` environment variable
- execute `npm run addCredits-polygon <creditId>`
