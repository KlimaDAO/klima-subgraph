import { JsonRpcProvider, Wallet, Contract } from 'ethers';
import { networkConfig } from './networkConfig'; 

export type NetworkType = keyof typeof networkConfig;

export function getNetworkConfig(network: NetworkType) {
  const config = networkConfig[network] || networkConfig['amoy']; 
  const provider = new JsonRpcProvider(config.rpcUrl);
  const wallet = new Wallet(process.env.PRIVATE_KEY!, provider);
  const signer = wallet.connect(provider);

  const getContract = (address: string, abi: any[]) => new Contract(address, abi, wallet);
0xa3b491CE0f67A03c0D8c1095F47d9ae9E98a2B92
  return { provider, wallet, signer, getContract, addresses: config.addresses};
}