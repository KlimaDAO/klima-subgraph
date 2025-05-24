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
        address: '0x2dF21aaCAD1aBc83db34227C5aBadBE3aE0B3DF2',
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
        address: '0x1B0128280d7f42Ea7E2c4d581ADc944C64303f7a',
      },
    },
  },
};