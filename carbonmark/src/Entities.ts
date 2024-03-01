import { Activity, Category, Country, IpfsProjectInfo, Listing, Project, Purchase, User } from '../generated/schema'
import { ZERO_BI } from '../../lib/utils/Decimals'
import { ZERO_ADDRESS } from '../../lib/utils/Constants'
import { Address, BigInt, Bytes, log } from '@graphprotocol/graph-ts'
import { ProjectInfo } from '../generated/ProjectInfo/ProjectInfo'

export function loadOrCreateProject(token: Address): Project | null {
  // this vintage can't be used though as it's not in any event. need better way get to get vintage for 1155 tokens
  let project = Project.load(token.toHexString())

  const address = Address.fromString('0xd412DEc7cc5dCdb41bCD51a1DAb684494423A775')
  let contract = ProjectInfo.bind(address)
  let hash = contract.getProjectInfoHash()
  let ipfsData = IpfsProjectInfo.load(hash)

  if (ipfsData == null) {
    log.error('IPFS data not found for hash: {}', [hash])
    return null
  }

  let projects = ipfsData.projectList.load()
  for (let i = 0; i < projects.length; i++) {
    let projectData = projects[i]

    // remove the -ipfs from the id to create on-chain accessible entity
    let projectId = projectData.id.split('-')[0]

    if (projectId == token.toHexString()) {
      project = new Project(projectId)

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
      // returns project. alternately we can create all projects here
      return project
    }
  }

  return project
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
