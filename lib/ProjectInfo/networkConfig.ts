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
      projectInfo: {
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
      projectInfo: {
        address: '0xd412DEc7cc5dCdb41bCD51a1DAb684494423A775',
        startBlock: 46541534,
      },
    },
  },
};
