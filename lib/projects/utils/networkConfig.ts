import dotenv from 'dotenv'
dotenv.config()

export const networkConfig = {
  polygon: {
    rpcUrl: `https://polygon-rpc.com/`,
    addresses: {
      marketplace: {
        address: '0xD973F90a4C49607EABeFdb2C45d4F39436c7e7fA',
        startBlock: 46541534,
      },
      creditManager: {
        address: '0xa3b491CE0f67A03c0D8c1095F47d9ae9E98a2B92',
        startBlock: 46541534,
      },
    },
  },
  mumbai: {
    rpcUrl: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    addresses: {
      marketplace: {
        address: '0xD83aE95CC40B69a1053326D6b21C5731e616FD94',
        startBlock: 46541534,
      },
      creditManager: {
        address: '',
        startBlock: 46541534,
      },
    },
  },
};