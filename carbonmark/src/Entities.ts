import { Activity, Category, Country, IpfsProjectInfo, Listing, Project, Purchase, User } from '../generated/schema'
import { ZERO_BI } from '../../lib/utils/Decimals'
import { ZERO_ADDRESS } from '../../lib/utils/Constants'
import { Address, BigInt, Bytes, log } from '@graphprotocol/graph-ts'
import { ProjectInfo } from '../generated/ProjectInfo/ProjectInfo'

export function loadOrCreateProject(token: Address): Project | null {
  // this function shouldn't be necessary as all the Project entities should be created by the handleProjectInfo updated event
  let project = Project.load(token.toHexString())

  if (project !== null) {
    return project
  }

  const address = Address.fromString('0xd412DEc7cc5dCdb41bCD51a1DAb684494423A775')

  let facet = ProjectInfo.bind(address)
  // get hash from contract to load project array
  let hash = facet.getProjectInfoHash()

  let ipfsData = IpfsProjectInfo.load(hash)

  if (ipfsData === null) {
    log.error('IPFS data entity not found for hash: {}', [hash])
    return null
  }

  if (ipfsData !== null && ipfsData.projectList) {
    let projects = ipfsData.projectList.load()

    for (let i = 0; i < projects.length; i++) {
      let projectData = projects[i]

      project = new Project(token.toHexString())
      project.key = projectData.key
      project.name = projectData.name
      project.methodology = projectData.methodology
      project.vintage = BigInt.fromString(projectData.vintage.toString())
      project.projectAddress = Bytes.fromHexString(projectData.projectAddress.toHexString())
      project.registry = projectData.registry
      project.category = projectData.category
      project.country = projectData.country

      createCountry(project.country)
      createCategory(project.category)
      project.save()

      return project
    }
  } else {
    log.error('IPFS data not found or projectList is undefined for hash: {}', [hash])
    return null
  }
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
    listing.tokenStandard = ''
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
