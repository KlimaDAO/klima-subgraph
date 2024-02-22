import { ipfsPinProjectInfo } from './ipfsPinProjectInfo'
import ethers from 'ethers'

// Project info facet
const projectInfoFacetAddress = '0x868b25ae76a515258Eb7dE83729172E964c13c93'
const abi = ['function updateProjectInfo(string memory newHash)']

// set up signer
const provider = new ethers.providers.JsonRpcProvider(
  `https://polygon-mumbai.infura.io/v3/${process.env.MUMBAI_INFURA_API_KEY}`
)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!)
const signer = wallet.connect(provider)

const updateProjectInfo = async () => {
  const carbonmarkContract = new ethers.Contract(projectInfoFacetAddress, abi, signer)

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
