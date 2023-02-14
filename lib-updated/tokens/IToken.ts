import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'

export interface IToken {
  getContractAddress(): Address
  getTokenName(): string
  getDecimals(): number
  getFormattedPrice(rawPrice: BigInt): BigDecimal
  getMarketPrice(): BigDecimal
  getUSDPrice(): BigDecimal
  getTotalSupply(): BigDecimal
  updateMarketPrice(timestamp: BigInt, newPrice: BigDecimal): void
  updateUSDPrice(timestamp: BigInt, blockNumber: BigInt): void
  getAddressBalance(address: Address): BigDecimal
}
