import { Contract, ethers, JsonRpcProvider, Wallet } from "ethers";
import CarbonmarkCreditTokenFactoryABI from "../lib/abis/CarbonmarkCreditTokenFactory.json"

// Ganache RPC
const RPC_URL = "http://localhost:8545"
// Ganache Mnemonic
const MNEMONIC= "harvest forum about lawn crash pulse around claim notice orange border remember"

const ADDR1="0x117604890fc1E082bCbEc9a185ece38f7B98B825"

const CARBONMARKCREDITTOKENFACTORY_ADDRESS = "0xeee3abdd638e219261e061c06c0798fd5c05b5d3"

const getWallet = () => {
const provider = new JsonRpcProvider(RPC_URL, 137, {
    staticNetwork: true,
  });

const wallet = Wallet.fromPhrase(MNEMONIC).connect(provider);
return wallet;
}


async function issueCredits(){
    const wallet = getWallet();
    //const abi = ["issueCredits(address, uint256, address)"]
    const contract = new Contract(CARBONMARKCREDITTOKENFACTORY_ADDRESS, CarbonmarkCreditTokenFactoryABI, wallet)
    
    contract.issueCredits("CMARK-1",1, ADDR1);
}

issueCredits()