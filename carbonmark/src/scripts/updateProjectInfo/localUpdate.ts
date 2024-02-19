import { localPin } from './localPin'
import ethers from 'ethers'

// Project info facet
const carbonmarkAddress = '0x875EB08884a634FF01b007902f5A6f382eD43830'
const abi = ['function updateProjectInfo(string memory newHash)']

// set up signer
const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!)
const signer = wallet.connect(provider)

const updateProjectInfo = async () => {
  const carbonmarkContract = new ethers.Contract(carbonmarkAddress, abi, signer)

  const path = 'carbonmark/src/Projects.ts'

  // upload and pin the project info to IPFS
  const res = await localPin(path)

  // call setter on facet
  const tx = await carbonmarkContract.updateProjectInfo(res)

  const receipt = await provider.waitForTransaction(tx.hash)

  console.log('new PROJECT_INFO successfuly stored on ProjectInfo facet: ', receipt.transactionHash)
  console.log('ipfs hash: ', res)
}

updateProjectInfo()
