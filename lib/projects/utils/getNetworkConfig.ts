import { ethers } from 'ethers';
import { networkConfig } from './networkConfig'; 

export type NetworkType = keyof typeof networkConfig;

export function getNetworkConfig(network: NetworkType) {
  const config = networkConfig[network] || networkConfig['mumbai']; 
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const signer = wallet.connect(provider);

  const getContract = (address: string, abi: any[]) => new ethers.Contract(address, abi, wallet);

  return { provider, wallet, signer, getContract, addresses: config.addresses};
}