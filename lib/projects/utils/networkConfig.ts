import dotenv from 'dotenv'
dotenv.config()

export const networkConfig = {
  polygon: {
    rpcUrl: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    addresses: {
      marketplace: {
        address: '0x...',
        startBlock: 46541534,
      },
      projectManager: {
        address: '0x...',
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
      projectManager: {
        address: '0xb4e216C6d49EC6144996a6DF30B4E4C25B8772B1',
        startBlock: 46541534,
      },
    },
  },
};