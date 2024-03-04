import ethers from 'ethers'

// Project info facet
const projectInfoContractAddress = '0xd412DEc7cc5dCdb41bCD51a1DAb684494423A775'
const abi = ['function testFunction()']

// set up signer
const provider = new ethers.providers.JsonRpcProvider(
  `https://polygon-mumbai.g.alchemy.com/v2/${process.env.MUMBAI_ALCHEMY_API_KEY}`
)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!)
const signer = wallet.connect(provider)

const triggerTestEvent = async () => {
  const projectInfoContract = new ethers.Contract(projectInfoContractAddress, abi, signer)

  // call setter on facet
  const tx = await projectInfoContract.testFunction()

  const receipt = await provider.waitForTransaction(tx.hash)

  console.log('test function triggered: ', receipt.transactionHash)
}

triggerTestEvent()
