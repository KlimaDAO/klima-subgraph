import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { IToken } from '../tokens/IToken'


export interface IBondable {
    getToken(): IToken
    getBondName(): string
    getDaoIncomeForBondPayout(payout: BigDecimal): BigDecimal
    getBondPrice(): BigDecimal
    getBondDiscount(): BigDecimal
    parseBondPrice(priceInUSD: BigInt): BigDecimal
    parseBondTokenValueFormatted(rawPrice: BigInt): BigDecimal
    getCarbonCustodied(depositAmount: BigInt): BigDecimal
    getTreasuredAmount(): BigDecimal
  }