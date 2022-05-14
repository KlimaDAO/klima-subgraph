import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'

export interface IToken {
    getERC20ContractAddress() : string
    getTokenName() : string
    getDecimals() : number
    getFormattedPrice(rawPrice: BigInt) : BigDecimal
    getMarketPrice() : BigDecimal
    getTotalSupply() : BigDecimal
  }