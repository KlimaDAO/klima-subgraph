import { localPin } from './localPin.js'
import { ethers } from 'ethers'
import dotenv from 'dotenv'
dotenv.config()

// Project info facet
const carbonmarkAddress = '0x96e697b3Fa13B8F2E665204a8E1420b265a101cd'
const abi = ['function updateProjectInfo(string memory newHash)']

// set up signer
const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!)
const signer = wallet.connect(provider)

const updateProjectInfo = async () => {
  const carbonmarkContract = new ethers.Contract(carbonmarkAddress, abi, signer)

  const path = 'carbonmark/src/Projects.ts'

  // upload and pin the project info to IPFS
  // const res = await localPin(path)

  // call setter on facet
  const tx = await carbonmarkContract.updateProjectInfo('QmXy2FEgty2r9fA1u67ZTqMXQX3nX1TpdUY8HwU5HZYzBp')

  const receipt = await provider.waitForTransaction(tx.hash)

  console.log('new PROJECT_INFO successfuly stored on ProjectInfo facet: ', receipt.transactionHash)
  // console.log('ipfs hash: ', res)
}

updateProjectInfo()
