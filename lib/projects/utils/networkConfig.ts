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
        address: '0x1247D7c744D0f4671E3053B4a513f6B1db221218',
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
        address: '0x22A0C44A934E0CfE33bD0241AA1454d1e9916422',
      },
    },
  },
};