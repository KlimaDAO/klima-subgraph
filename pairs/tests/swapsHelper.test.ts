import { createMockedFunction } from 'matchstick-as'
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'

import {
  CCO2_ERC20_CONTRACT,
  KLIMA_CCO2_PAIR,
  KLIMA_ERC20_V1_CONTRACT,
  KLIMA_USDC_PAIR,
  NCT_ERC20_CONTRACT,
  NCT_USDC_PAIR,
  TREASURY_ADDRESS,
  USDC_ERC20_CONTRACT,
} from '../../lib/utils/Constants'
// Helper function to create a Swap event

function create_USDC_ERC20_CONTRACT_MOCKS(): void {
  createMockedFunction(USDC_ERC20_CONTRACT, 'name', 'name():(string)').returns([ethereum.Value.fromString('USDC')])
  createMockedFunction(USDC_ERC20_CONTRACT, 'symbol', 'symbol():(string)').returns([ethereum.Value.fromString('USDC')])
  createMockedFunction(USDC_ERC20_CONTRACT, 'decimals', 'decimals():(uint8)').returns([ethereum.Value.fromI32(6)])
}

function create_NCT_ERC20_CONTRACT_MOCKS(): void {
  createMockedFunction(NCT_ERC20_CONTRACT, 'name', 'name():(string)').returns([ethereum.Value.fromString('NCT')])
  createMockedFunction(NCT_ERC20_CONTRACT, 'symbol', 'symbol():(string)').returns([ethereum.Value.fromString('NCT')])
  createMockedFunction(NCT_ERC20_CONTRACT, 'decimals', 'decimals():(uint8)').returns([ethereum.Value.fromI32(18)])
}

function create_KLIMA_USDC_PAIR_MOCKS(): void {
  createMockedFunction(KLIMA_USDC_PAIR, 'getReserves', 'getReserves():(uint112,uint112,uint32)').returns([
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString('23211174326211')),
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString('2518999568458520093807838')),
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString('1725456599')),
  ])
}

function create_KLIMA_ERC20_V1_CONTRACT_MOCKS(): void {
  createMockedFunction(KLIMA_ERC20_V1_CONTRACT, 'name', 'name():(string)').returns([ethereum.Value.fromString('KLIMA')])

  createMockedFunction(KLIMA_ERC20_V1_CONTRACT, 'symbol', 'symbol():(string)').returns([
    ethereum.Value.fromString('KLIMA'),
  ])

  createMockedFunction(KLIMA_ERC20_V1_CONTRACT, 'decimals', 'decimals():(uint8)').returns([ethereum.Value.fromI32(18)])
}

function create_CCO2_ERC20_CONTRACT_MOCKS(): void {
  createMockedFunction(CCO2_ERC20_CONTRACT, 'name', 'name():(string)').returns([ethereum.Value.fromString('CCO2')])

  createMockedFunction(CCO2_ERC20_CONTRACT, 'symbol', 'symbol():(string)').returns([ethereum.Value.fromString('CCO2')])

  createMockedFunction(CCO2_ERC20_CONTRACT, 'decimals', 'decimals():(uint8)').returns([ethereum.Value.fromI32(18)])

  createMockedFunction(CCO2_ERC20_CONTRACT, 'decimalRatio', 'decimalRatio():(uint256)').returns([
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString('10000')),
  ])

  createMockedFunction(CCO2_ERC20_CONTRACT, 'burningPercentage', 'burningPercentage():(uint256)').returns([
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString('20')),
  ])
}

function createPairMocks(
  pair: Address,
  token0: Address,
  token1: Address,
  totalSupply: BigInt,
  balanceOf: BigInt,
  getReserves: BigInt[]
): void {
  createMockedFunction(pair, 'token0', 'token0():(address)').returns([ethereum.Value.fromAddress(token0)])

  createMockedFunction(pair, 'token1', 'token1():(address)').returns([ethereum.Value.fromAddress(token1)])

  // set total supply and balance of to address
  createMockedFunction(pair, 'totalSupply', 'totalSupply():(uint256)').returns([
    ethereum.Value.fromUnsignedBigInt(totalSupply),
  ])

  createMockedFunction(pair, 'balanceOf', 'balanceOf(address):(uint256)')
    .withArgs([ethereum.Value.fromAddress(TREASURY_ADDRESS)])
    .returns([ethereum.Value.fromUnsignedBigInt(balanceOf)])

  createMockedFunction(pair, 'getReserves', 'getReserves():(uint112,uint112,uint32)').returns([
    ethereum.Value.fromUnsignedBigInt(getReserves[0]),
    ethereum.Value.fromUnsignedBigInt(getReserves[1]),
    ethereum.Value.fromUnsignedBigInt(getReserves[2]),
  ])
}

function create_KLIMA_CCO2_PAIR_MOCKS(): void {
  createPairMocks(
    KLIMA_CCO2_PAIR,
    KLIMA_ERC20_V1_CONTRACT,
    CCO2_ERC20_CONTRACT,
    BigInt.fromString('7645055334322312917'),
    BigInt.fromString('0'),
    [
      BigInt.fromString('23211174326211'),
      BigInt.fromString('2518999568458520093807838'),
      BigInt.fromString('1725456599'),
    ]
  )
}

export function create_NCT_USDC_PAIR_MOCKS(): void {
  createPairMocks(
    NCT_USDC_PAIR,
    USDC_ERC20_CONTRACT,
    NCT_ERC20_CONTRACT,
    BigInt.fromString('79123581088009270'),
    BigInt.fromString('0'),
    [BigInt.fromString('54896292369'), BigInt.fromString('123979167683545067983988'), BigInt.fromString('1745614351')]
  )
}

export function create_SWAP_EVENT_MOCKS(): void {
  create_KLIMA_USDC_PAIR_MOCKS()
  create_KLIMA_CCO2_PAIR_MOCKS()
  create_KLIMA_ERC20_V1_CONTRACT_MOCKS()
  create_CCO2_ERC20_CONTRACT_MOCKS()
  create_NCT_USDC_PAIR_MOCKS()
  create_USDC_ERC20_CONTRACT_MOCKS()
  create_NCT_ERC20_CONTRACT_MOCKS()
}
