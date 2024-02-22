import { ipfsPinProjectInfo } from './ipfsPinProjectInfo'
import ethers from 'ethers'

// Project info facet
const carbonmarkAddress = '0x953654889E278d3DcddeF4475C350A1ae82aa631'
const abi = ['function updateProjectInfo(string memory newHash)']

// set up signer
const provider = new ethers.providers.JsonRpcProvider(
  `https://polygon-mumbai.infura.io/v3/${process.env.MUMBAI_INFURA_API_KEY}`
)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!)
const signer = wallet.connect(provider)

const updateProjectInfo = async () => {
  const carbonmarkContract = new ethers.Contract(carbonmarkAddress, abi, signer)

  // upload and pin the project info to IPFS
  const res = await ipfsPinProjectInfo()

  console.log('file successfully pinned', res.IpfsHash)

  // call setter on facet
  const tx = await carbonmarkContract.updateProjectInfo(res.IpfsHash)

  const receipt = await provider.waitForTransaction(tx.hash)

  console.log('new PROJECT_INFO successfuly stored on ProjectInfo facet: ', receipt.transactionHash)
  console.log('ipfs hash: ', res.IpfsHash)
}

updateProjectInfo()
