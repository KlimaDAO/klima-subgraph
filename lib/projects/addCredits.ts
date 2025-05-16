import { NetworkType, getNetworkConfig } from './utils/getNetworkConfig'
import CreditManagerAbi from '../abis/CreditManager.json'
import arg from 'arg';
import { PROJECT_INFO } from './Projects';

if (!process.env.PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY environment variable is not set');
}


const getCreditInfo = (creditId: string) => {
  const info = PROJECT_INFO.find(projectInfo => `${projectInfo.projectId}-${projectInfo.vintage}` === creditId)
  // The contract expects an array for the vintage
  if (!info) {
    throw(Error(`Credit id ${creditId} not found`))
  }

  return [
    info.address,
    info.tokenId,
    info.isExAnte,
    info.projectId,
    info.vintage,
    info.name,
    [info.methodology],
    info.category,
    info.country,
    "unknown", // region
    "" // description
  ]
}

const addCredits = async (network: string, creditIds: string[]) => {
  const { getContract, addresses } = getNetworkConfig(network as NetworkType)

  const credits = creditIds.map(creditId => getCreditInfo(creditId))

  // Project Manager contract
  const creditManagerContractAddress = addresses.creditManager.address
  
  const creditManagerContract = getContract(creditManagerContractAddress, CreditManagerAbi)

  const batchSize = 10
  const numberOfBatches = Math.ceil(creditIds.length / batchSize)
  
  for (let i = 0; i < numberOfBatches; i++) {
    const start = i * batchSize
    const end = start + batchSize
    const currentBatch = credits.slice(start, end)

    try {
      const tx = await creditManagerContract.addCreditBatch(currentBatch)

      await tx.wait()
      console.log(`Batch ${i + 1} of ${numberOfBatches} processed successfully`)
    } catch (error) {
      console.error(`Error adding batch ${i + 1}:`, error)
      console.log('fix', currentBatch)
    }
  }
}

// Parse and check arguments
const args = arg({
	'--network': String
});
const network = args['--network']
const missingCreditIds = args["_"]
if (!network) {
    throw(Error("Network is required"))
}
if (!missingCreditIds || missingCreditIds.length === 0) {
    throw(Error("Missing credit ids are required"))
}

// Add Credits definitions to the contract
addCredits(network, missingCreditIds)
