import { Activity, Listing, Project, Purchase, User } from '../generated/schema'
import { ZERO_BI } from '../../lib/utils/Decimals'
import { ZERO_ADDRESS } from '../../lib/utils/Constants'
import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'

export function loadOrCreateProject(token: Address): void {
  let project = Project.load('VCS-981-2017')
  if (project == null) {
    project = new Project('VCS-981-2017')
    project.key = 'VCS-981'
    project.projectID = '981'
    project.projectType = ''
    project.region = ''
    project.name = ''
    project.methodology = ''
    project.vintage = BigInt.fromI32(2017)
    project.projectAddress = token
    project.registry = 'VCS'
    project.category = '1'
    project.country = '1'
    project.save()
  }
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
    listing.active = false
    listing.deleted = false
    listing.batches = [ZERO_BI]
    listing.batchPrices = [ZERO_BI]
    listing.singleUnitPrice = ZERO_BI
    listing.expiration = ZERO_BI
    listing.minFillAmount = ZERO_BI
    listing.project = 'VCS-981-2017'
    listing.seller = ZERO_ADDRESS
    listing.createdAt = ZERO_BI
    listing.updatedAt = ZERO_BI
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
    activity.project = 'VCS-981-2017'
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
