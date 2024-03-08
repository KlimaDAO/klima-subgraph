import { NetworkType, getNetworkConfig } from './utils/getNetworkConfig'
import ProjectManagerAbi from '../../lib/abis/ProjectManager.json'

const args = process.argv.slice(2)
const network = args.find((arg) => arg.startsWith('--'))?.replace('--', '')

const { provider, getContract, addresses } = getNetworkConfig(network as NetworkType)

// Project info facet
const projectInfoFacetAddress = addresses.projectManager.address

const projectManagerContract = getContract(projectInfoFacetAddress, ProjectManagerAbi)

const updateProjectInfo = async () => {
  // upload and pin the project info to IPFS

  // call setter on facet
  try {
    const tx = await projectManagerContract.addProject()
    const receipt = await provider.waitForTransaction(tx.hash)
    console.log('project info updated', receipt.transactionHash)
  } catch (e) {
    console.error('error updating project info', e.error.error.error.message)
  }
}

updateProjectInfo()
