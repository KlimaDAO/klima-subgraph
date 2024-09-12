import { NetworkType, getNetworkConfig } from './utils/getNetworkConfig'
import ProjectManagerAbi from '../../lib/abis/ProjectManager.json'

const args = process.argv.slice(2)
const network = args.find((arg) => arg.startsWith('--'))?.replace('--', '')

const { provider, getContract, addresses } = getNetworkConfig(network as NetworkType)

// Project info facet
const projectInfoFacetAddress = addresses.projectManager.address

const projectManagerContract = getContract(projectInfoFacetAddress, ProjectManagerAbi)

const removeProject = async () => {


  const projectAddress = "VCS-10-2014"

  // call to emit ProjectAdded event
  try {
    const tx = await projectManagerContract.removeProject(
      projectAddress
    )
    const receipt = await provider.waitForTransaction(tx.hash)
    console.log('project successfully removed', receipt.transactionHash)
  } catch (e) {
    // console.error('error updating project info', e.error.error.error.message)
    console.error('error updating project info', e)
  }
}

removeProject()
