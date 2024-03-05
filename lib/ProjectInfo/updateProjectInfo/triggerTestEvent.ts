import { NetworkType, getNetworkConfig } from '../utils/getNetworkConfig'
import dotenv from 'dotenv'
dotenv.config()

const args = process.argv.slice(2)
const network = args.find((arg) => arg.startsWith('--'))?.replace('--', '')

const { provider, getContract, addresses } = getNetworkConfig(network as NetworkType)

// Accessing an address
const projectInfoFacetAddress = addresses.projectInfo.address

// Getting a contract instance
const projectInfoABI = ['function testFunction()']
const projectInfoContract = getContract(projectInfoFacetAddress, projectInfoABI)

const triggerTestEvent = async () => {
  // call setter on contract
  const tx = await projectInfoContract.testFunction()

  const receipt = await provider.waitForTransaction(tx.hash)

  console.log('test function triggered: ', receipt.transactionHash)
}

triggerTestEvent()
