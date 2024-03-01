import ethers from 'ethers'

// Project info facet
const projectInfoFacetAddress = '0xd412DEc7cc5dCdb41bCD51a1DAb684494423A775'
const abi = ['function testFunction()']

// set up signer
const provider = new ethers.providers.JsonRpcProvider(
  `https://polygon-mumbai.infura.io/v3/${process.env.MUMBAI_INFURA_API_KEY}`
)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!)
const signer = wallet.connect(provider)

const updateProjectInfo = async () => {
  const carbonmarkContract = new ethers.Contract(projectInfoFacetAddress, abi, signer)

  // call setter on facet
  const tx = await carbonmarkContract.testFunction()

  const receipt = await provider.waitForTransaction(tx.hash)

  console.log('test function triggered: ', receipt.transactionHash)
}

updateProjectInfo()
