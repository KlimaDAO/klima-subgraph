import { BigDecimal, BigInt, log } from '@graphprotocol/graph-ts'
import { ICR_MIGRATION_BLOCK } from './Constants'

export const DEFAULT_DECIMALS = 18

export const BIG_DECIMAL_1E9 = BigDecimal.fromString('1e9')
export const BIG_DECIMAL_1E12 = BigDecimal.fromString('1e12')
export const BIG_DECIMAL_1E18 = BigDecimal.fromString('1e18')

export const ZERO_BI = BigInt.fromString('0')
export const ZERO_BD = BigDecimal.fromString('0')
export const BIG_INT_1E18 = BigInt.fromString('1000000000000000000')

export function pow(base: BigDecimal, exponent: number): BigDecimal {
  let result = base

  if (exponent == 0) {
    return BigDecimal.fromString('1')
  }

  for (let i = 2; i <= exponent; i++) {
    result = result.times(base)
  }

  return result
}

export function toDecimal(value: BigInt, decimals: number = DEFAULT_DECIMALS): BigDecimal {
  let precision = BigInt.fromI32(10)
    .pow(<u8>decimals)
    .toBigDecimal()

  return value.divDecimal(precision)
}

export function toWei(value: BigInt): BigInt {
  let weiDecimals: BigInt = BigInt.fromI32(10).pow(DEFAULT_DECIMALS as u8)
  return value.times(weiDecimals)
}

export function handleMigrationDecimals(registry: string, blockNumber: BigInt, amount: BigInt): BigInt {
  if (registry == 'ICR' && blockNumber.lt(ICR_MIGRATION_BLOCK)) {
    return toWei(amount)
  } else {
    return amount
  }
}
