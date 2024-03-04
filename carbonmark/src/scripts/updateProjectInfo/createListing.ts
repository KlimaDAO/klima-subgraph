import ethers from 'ethers'

const marketplaceContractAddress = '0xa018Acc1dC12Be57872B12642F84b95Dc5A1E582'
const marketplaceAbi = [
  'function createListing(address token, uint256 tokenId, uint256 amount, uint256 unitPrice, uint256 minFillAmount, uint256 deadline) external returns (bytes32 id)',
]

const tokenAddress = '0x51298f2f1142ecb129a2db5e6afd24f34f2e53f1'
const erc1155Abi = [
  'function isApprovedForAll(address account, address operator) external view returns (bool)',
  'function setApprovalForAll(address operator, bool approved) external',
  'function balanceOf(address account, uint256 id) external view returns (uint256)',
]

const provider = new ethers.providers.JsonRpcProvider(
  `https://polygon-mumbai.g.alchemy.com/v2/${process.env.MUMBAI_ALCHEMY_API_KEY}`
)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!)

const signer = wallet.connect(provider)

const createListing = async () => {
  const tokenContract = new ethers.Contract(tokenAddress, erc1155Abi, signer)
  const marketplaceContract = new ethers.Contract(marketplaceContractAddress, marketplaceAbi, signer)

  const isApproved = await tokenContract.isApprovedForAll(signer.address, marketplaceContractAddress)
  if (!isApproved) {
    console.log('Approving marketplace to manage tokens...')
    const approvalTx = await tokenContract.setApprovalForAll(marketplaceContractAddress, true)
    await provider.waitForTransaction(approvalTx.hash)
    console.log('Marketplace approved successfully.')
  } else {
    console.log('Marketplace is already approved.')
  }

  const userBalance = await tokenContract.balanceOf(signer.address, 2)
  console.log('User token balance: ', userBalance.toString())

  const tokenId = 2
  const amount = 1
  const unitPrice = ethers.utils.parseUnits('0.5', 6)
  const minFillAmount = 1
  const currentDate = new Date()

  currentDate.setFullYear(currentDate.getFullYear() + 1)

  const deadline = Math.floor(currentDate.getTime() / 1000)

  // Call createListing on the contract
  const tx = await marketplaceContract.createListing(tokenAddress, tokenId, amount, unitPrice, minFillAmount, deadline)
  console.log('Transaction hash: ', tx.hash)

  const receipt = await provider.waitForTransaction(tx.hash)
  console.log('Listing created: ', receipt.transactionHash)
}

createListing().catch(console.error)
