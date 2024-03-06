import { Activity, Category, Country, IpfsProjectInfo, Listing, Project, Purchase, User } from '../generated/schema'
import { ZERO_BI } from '../../lib/utils/Decimals'
import { ZERO_ADDRESS } from '../../lib/utils/Constants'
import { Address, BigInt, Bytes, dataSource, log } from '@graphprotocol/graph-ts'
import { ProjectInfo } from '../generated/ProjectInfo/ProjectInfo'

export function loadOrCreateProject(token: Address): Project | null {
  // do we need to access the correct vintage as well?
  // otherwise it will just return the first matching token address with whatever vintage
  // this vintage can't be used though as it's not in any event. need better way get to get vintage for 1155 tokens
  let project = Project.load(token.toHexString())
  let network = dataSource.network()

  if (project != null) {
    log.info('Project found {}', [project.id])
    return project
  }

  let projectInfoAddress: string
  if (network === 'polygon') {
    projectInfoAddress = '0x820DBba4e7621fB7dddDFd8A56dd2E9657CE34BC'
  } else {
    projectInfoAddress = '0xd412DEc7cc5dCdb41bCD51a1DAb684494423A775'
  }

  const contract = ProjectInfo.bind(Address.fromString(projectInfoAddress))

  let hash: string

  let hashResult = contract.try_getProjectInfoHash()

  if (hashResult.reverted) {
    // default fallbackHash
    hash = 'QmPuufEbe6ByzzmpgwAeUWtNud2rxdB156asaCZv5qNgYR'
  } else {
    hash = hashResult.value
  }
  log.info('used hash: {}', [hash])

  let ipfsData = IpfsProjectInfo.load(hash)

  if (ipfsData === null) {
    log.error('IPFS data not found for hash: {}', [hash])
    return null
  }

  log.info('IPFS data found for hash: {}', [hash])

  let projects = ipfsData.projectList.load()

  if (projects.length === 0) {
    log.error('No projects found in IPFS data for hash: {}', [hash])
    return null
  } else {
    log.info('zzz {}', [projects.length.toString()])
  }

  let testId: string = ''

  for (let i = 0; i < projects.length; i++) {
    let projectData = projects[i]
    // remove the -ipfs from the id to create on-chain accessible entity
    // stil need to check against vintage as well
    let projectId = projectData.id.split('-')[0]
    testId = projectId
    log.info('combo test {}', [projectId])

    if (projectId.toLowerCase() === token.toHexString().toLowerCase()) {
      project = new Project(projectId)

      project.key = projectData.key
      project.name = projectData.name
      project.methodology = projectData.methodology
      project.vintage = BigInt.fromString(projectData.vintage.toString())
      project.projectAddress = Bytes.fromHexString(projectData.projectAddress.toHexString())
      project.registry = projectData.registry
      project.category = projectData.category
      project.country = projectData.country
      project.shortDescription = projectData.shortDescription
      project.ipfsProjectInfo = hash

      createCountry(project.country)
      createCategory(project.category)
      project.save()
      log.info("successfully created project: {}", [project.id])
      return project
    }
  }

  log.info('No project matches the provided token: {} testId', [token.toHexString(), testId])
  return null
}

export function loadOrCreateUser(id: Address): User {
  let user = User.load(id)
  if (user == null) {
    user = new User(id)
    user.save()
  }
  return user
}

export function loadOrCreateListing(id: string): Listing {
  let listing = Listing.load(id)
  if (listing == null) {
    listing = new Listing(id)
    listing.totalAmountToSell = ZERO_BI
    listing.leftToSell = ZERO_BI
    listing.tokenAddress = ZERO_ADDRESS
    listing.tokenId = ZERO_BI
    listing.active = false
    listing.deleted = false
    listing.batches = [ZERO_BI]
    listing.batchPrices = [ZERO_BI]
    listing.singleUnitPrice = ZERO_BI
    listing.expiration = ZERO_BI
    listing.minFillAmount = ZERO_BI
    listing.project = ''
    listing.seller = ZERO_ADDRESS
    listing.createdAt = ZERO_BI
    listing.updatedAt = ZERO_BI
    listing.tokenSymbol = ''
    // initialize with ERC20 as default
    listing.tokenStandard = 'ERC20'
    listing.save()
  }
  return listing
}

export function loadOrCreateActivity(id: string): Activity {
  let activity = Activity.load(id)
  if (activity == null) {
    activity = new Activity(id)
    activity.activityType = 'CreatedListing'
    activity.user = ZERO_ADDRESS
    activity.project = ''
    activity.seller = ZERO_ADDRESS
    activity.save()
  }
  return activity
}

export function loadOrCreatePurchase(id: Bytes): Purchase {
  let purchase = Purchase.load(id)
  if (purchase == null) {
    purchase = new Purchase(id)
    purchase.price = ZERO_BI
    purchase.amount = ZERO_BI
    purchase.timeStamp = ZERO_BI
    purchase.user = ZERO_ADDRESS
    purchase.listing = ''
    purchase.save()
  }
  return purchase
}

export function createCountry(id: string): void {
  let country = Country.load(id)
  if (country == null) {
    country = new Country(id)
    country.save()
  }
}

export function createCategory(id: string): void {
  let category = Category.load(id)
  if (category == null) {
    category = new Category(id)
    category.save()
  }
}
