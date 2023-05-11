import {
  BridgeRequestReceived,
  BridgeRequestReceived1 as BridgeRequestReceived_1_1_0,
  BridgeRequestSent,
  BridgeRequestSent1 as BridgeRequestSent_1_1_0,
} from '../generated/ToucanCrossChainMessenger/ToucanCrossChainMessenger'
import { ERC20, Transfer } from '../generated/BaseCarbonTonne/ERC20'
import { loadOrCreateCarbonOffset } from './utils/CarbonOffsets'
import { toDecimal } from '../../lib/utils/Decimals'
import { loadOrCreateTransaction } from './utils/Transactions'
import { CarbonMetricUtils } from './utils/CarbonMetrics'
import { Address, BigInt, ethereum, log } from '@graphprotocol/graph-ts'
import { PoolTokenFactory } from './utils/pool_token/PoolTokenFactory'
import { loadOrCreateCrosschainBridge } from './utils/CrosschainBridge'

export function handleBridgeRequestReceived_1_0_0(event: BridgeRequestReceived): void {
  processBridgeRequest(
    'Received',
    event.params.token,
    event.transaction,
    event.params.amount,
    event.params.bridger,
    event.block
  )
}

export function handleBridgeRequestSent_1_0_0(event: BridgeRequestSent): void {
  processBridgeRequest(
    'Sent',
    event.params.token,
    event.transaction,
    event.params.amount,
    event.params.bridger,
    event.block
  )
}

export function handleBridgeRequestReceived_1_1_0(event: BridgeRequestReceived_1_1_0): void {
  processBridgeRequest(
    'Received',
    event.params.token,
    event.transaction,
    event.params.amount,
    event.params.bridger,
    event.block
  )
}

export function handleBridgeRequestSent_1_1_0(event: BridgeRequestSent_1_1_0): void {
  processBridgeRequest(
    'Sent',
    event.params.token,
    event.transaction,
    event.params.amount,
    event.params.bridger,
    event.block
  )
}

function processBridgeRequest(
  direction: string,
  token: Address,
  transaction: ethereum.Transaction,
  amount: BigInt,
  bridger: Address,
  block: ethereum.Block
): void {
  const poolToken = new PoolTokenFactory().getTokenForAddress(token)
  let tx = loadOrCreateTransaction(transaction, block)

  let crosschainBridge = loadOrCreateCrosschainBridge(token.toHexString(), tx)
  crosschainBridge.value = toDecimal(amount, poolToken.getDecimals())
  crosschainBridge.bridger = bridger.toHexString()
  crosschainBridge.direction = direction
  crosschainBridge.save()

  CarbonMetricUtils.updatePoolTokenSupply(poolToken, block.timestamp)
  CarbonMetricUtils.updateCrosschainTokenSupply(poolToken, block.timestamp, amount)
}
