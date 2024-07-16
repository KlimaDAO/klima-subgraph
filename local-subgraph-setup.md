# Local Subgraph Setup

Recipe to setup a local instance of the KlimaDAO subgraphs

1.  Clone [graph-node](https://github.com/graphprotocol/graph-node)

```
git clone git@github.com:graphprotocol/graph-node.git
```

1.  Clone [klima-subgraph](https://github.com/KlimaDAO/klima-subgraph)

```
git clone git@github.com:KlimaDAO/klima-subgraph.git
```

1.  Install [Foundry](https://book.getfoundry.sh/getting-started/installation)

```
curl -L https://foundry.paradigm.xyz | bash
```

1.  Update the `ETHEREUM_REORG_THRESHOLD` value for docker-compose in the `graph-node` repo _(The default is 250, this will cause a free RPC to get_ _429'd\_\_)_
2.  This isn't strictly necessary if only indexing from the fork but this change will guard against unexpected behavior

docker-compose.yml

```
services:
  graph-node:
  ...
      environment:
          ETHEREUM_REORG_THRESHOLD: 10
      ...
```

1.  Add the following values to the `.env` file in the `klima-subgraph` repo

```
POLYGON_URL=<YOUR-OWN-RPC-URL>
```

1.  Start a local Polygon fork

klima-subgraph/

```
yarn local-fork
```

1.  Start the local [Graph Node](https://thegraph.com/) _(this step requires_ [_docker to be installed and running_](https://www.docker.com/get-started/)_)_

graph-node/docker/

```
docker-compose up
```

1.  Extract the starting block number of the running fork

```
cast block-number
```

1.  Update all "startBlock" values in `carbonmark/networkConfig/localhost.json` for and `polygon-digital-carbon/networkConfig/localhost.json` with the value from the previous command.

localhost.json

```
...
 "startBlock": "<COPIED_VALUE>"
...
```

1.  Deploy both subgraphs

klima-subgraph/carbonmark

```
yarn deploy
```

klima-subgraph/polygon-digital-carbon

```
yarn deploy
```

1.  Add some funds to our account

From /klima-subgraph

```
yarn fund
```

2. Set Server Wallet
   The wallet address from the mnemonic used for local development in `lib/utils/getServerWallet` should be set in the `makefile` for `DUMMY_SERVER_WALLET `

3. Various other actions are available in the makefile i.e. creating listings and retirements for various credits. Run selected action with `makefile <makefile action>`

**From /carbonmark/monorepo:**

1. add

```
USE_LOCAL_ENVIRONMENT=true
```
and 

```
GRAPH_POLYGON_DIGITALCARBON_URL=http://127.0.0.1:8000/subgraphs/name/polygon-digital-carbon
GRAPH_POLYGON_MARKETPLACE_URL=http://127.0.0.1:8000/subgraphs/name/carbonmark
```

to .env.local in `carbonmark-api/`

2. run local api and local checkout

3. For frontend interactions add anvil wallet #1 to metamask as that is the address the makefile funds. 
   
   Also add a new network (i.e. Local Polygon) with the localhost RPC and chainid 137. The anvil wallet address, and corresonding private key, is first one displayed when starting anvil.



This local configuration works best as a stash when working locally; do not commit.