import { ipfsPinProjectInfo } from './ipfsPinProjectInfo'
import ethers from 'ethers'

// Project info facet
const projectInfoAddress = '0xd412DEc7cc5dCdb41bCD51a1DAb684494423A775'
const abi = ['function updateProjectInfo(string memory newHash)']

// set up signer
const provider = new ethers.providers.JsonRpcProvider(
  `https://polygon-mumbai.infura.io/v3/${process.env.MUMBAI_INFURA_API_KEY}`
)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!)
const signer = wallet.connect(provider)

const updateProjectInfo = async () => {
  const carbonmarkContract = new ethers.Contract(projectInfoAddress, abi, signer)

  // upload and pin the project info to IPFS
  const hash = await ipfsPinProjectInfo()

  console.log('file successfully pinned', hash)

  // call setter on facet
  const tx = await carbonmarkContract.updateProjectInfo(hash)

  const receipt = await provider.waitForTransaction(tx.hash)

  console.log('new PROJECT_INFO successfuly stored on ProjectInfo facet: ', receipt.transactionHash)
  console.log('ipfs hash: ', hash)
}

updateProjectInfo()
