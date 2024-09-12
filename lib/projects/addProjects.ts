import { NetworkType, getNetworkConfig } from './utils/getNetworkConfig'
import ProjectManagerAbi from '../abis/ProjectManager.json'
import { findMissingProjects } from './utils/fetchSubgraphProjects'

const args = process.argv.slice(2)
const network = args.find((arg) => arg.startsWith('--'))?.replace('--', '')

const { provider, getContract, addresses } = getNetworkConfig(network as NetworkType)

// Project Manager contract
const projectManagerContractAddress = addresses.projectManager.address

const projectManagerContract = getContract(projectManagerContractAddress, ProjectManagerAbi)

const addProjects = async () => {
  const missingProjects = await findMissingProjects(network as NetworkType)

  // call to emit ProjectAdded event
  if (missingProjects.length === 1) {
    try {
      const tx = await projectManagerContract.addProject(missingProjects)
      const receipt = await provider.waitForTransaction(tx.hash)
      console.log('project info updated', receipt.transactionHash)
    } catch (e) {
      // console.error('error updating project info', e.error.error.error.message)
      console.error('error updating project info', e)
    }
  } else if (missingProjects.length > 1) {
    const batchSize = 10
    const numberOfBatches = Math.ceil(missingProjects.length / batchSize)
    /** the contract currently kicks if any field is undefined
     * There are a couple projects that have undefined names so it will not add the whole batch
     * We can either remove this requirement on the contract, or ensure all Projects have all fields added */ 
    
    for (let i = 0; i < numberOfBatches; i++) {
      const start = i * batchSize
      const end = start + batchSize
      const currentBatch = missingProjects.slice(start, end)

      try {
        const tx = await projectManagerContract.addProjectBatch(currentBatch)

        await tx.wait()
        console.log(`Batch ${i + 1} of ${numberOfBatches} processed successfully`)
      } catch (error) {
        console.error(`Error adding batch ${i + 1}:`, error)
        console.log('fix', currentBatch)
      }
    }
  }
}

addProjects()
