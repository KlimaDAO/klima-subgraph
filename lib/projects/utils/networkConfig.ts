import dotenv from 'dotenv'
dotenv.config()

export const networkConfig = {
  polygon: {
    rpcUrl: `https://polygon-rpc.com/`,
    addresses: {
      marketplace: {
        address: '0xD973F90a4C49607EABeFdb2C45d4F39436c7e7fA',
      },
      creditManager: {
        address: '0xeC78c8c2Df560e5598EeeaE388D20465D6e65f84',
      },
    },
  },
  amoy: {
    rpcUrl: `https://rpc-amoy.polygon.technology`,
    addresses: {
      marketplace: {
        address: '',
      },
      creditManager: {
        address: '0x6E7070CA35df41A9f856d9530d3BA42C9a0E06Fa',
      },
    },
  },
};