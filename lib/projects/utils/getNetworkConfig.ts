import { JsonRpcProvider, Wallet, Contract } from 'ethers';
import { networkConfig } from './networkConfig'; 

export type NetworkType = keyof typeof networkConfig;

export function getNetworkConfig(network: NetworkType) {
  const config = networkConfig[network] || networkConfig['amoy']; 
  const provider = new JsonRpcProvider(config.rpcUrl);
  const wallet = process.env.PRIVATE_KEY ? new Wallet(process.env.PRIVATE_KEY, provider) : null;
  const signer = wallet ? wallet.connect(provider) : null;

  const getContract = (address: string, abi: any[]) => new Contract(address, abi, wallet);

  return { provider, wallet, signer, getContract, addresses: config.addresses};
}