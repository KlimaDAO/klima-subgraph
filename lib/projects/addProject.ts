import { NetworkType, getNetworkConfig } from './utils/getNetworkConfig'
import ProjectManagerAbi from '../../lib/abis/ProjectManager.json'

const args = process.argv.slice(2)
const network = args.find((arg) => arg.startsWith('--'))?.replace('--', '')

const { provider, getContract, addresses } = getNetworkConfig(network as NetworkType)

// Project info facet
const projectInfoFacetAddress = addresses.projectManager.address

const projectManagerContract = getContract(projectInfoFacetAddress, ProjectManagerAbi)

const addProject = async () => {
  // upload and pin the project info to IPFS

  const projectData = {
    id: '0x000000000000000000000000000000000000DEAD',
    projectId: 'TestItAll',
    vintages: ['2021', '2022'],
    name: 'Fake Project for Testing',
    methodologies: ['Method1', 'Method2'],
    category: 'Positive Vibes',
    country: 'Jupiter',
    description: 'fakefakefake123',
  }

  // call to emit ProjectAdded event
  try {
    const tx = await projectManagerContract.addProject(
      projectData
    )
    const receipt = await provider.waitForTransaction(tx.hash)
    console.log('project info updated', receipt.transactionHash)
  } catch (e) {
    // console.error('error updating project info', e.error.error.error.message)
    console.error('error updating project info', e)
  }
}

addProject()
