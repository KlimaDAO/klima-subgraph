import { ipfsPinProjectInfo } from './ipfsPinProjectInfo'
import { NetworkType, getNetworkConfig } from '../utils/getNetworkConfig'

const args = process.argv.slice(2)
const network = args.find((arg) => arg.startsWith('--'))?.replace('--', '')

const { provider, getContract, addresses } = getNetworkConfig(network as NetworkType)

// Project info facet
const projectInfoFacetAddress = addresses.projectInfo.address
const projectInfoABI = ['function updateProjectInfo(string memory newHash)']
const projectInfoContract = getContract(projectInfoFacetAddress, projectInfoABI)

const updateProjectInfo = async () => {
  // upload and pin the project info to IPFS
  const hash = await ipfsPinProjectInfo()

  console.log('file successfully pinned', hash)

  // call setter on facet
  try {
    const tx = await projectInfoContract.updateProjectInfo(hash)
    const receipt = await provider.waitForTransaction(tx.hash)

    console.log('new PROJECT_INFO successfuly stored on ProjectInfo facet: ', receipt.transactionHash)
    console.log('ipfs hash: ', hash)
  } catch (e) {
    console.error('error updating project info', e.error.error.error.message)
  }
}

updateProjectInfo()
