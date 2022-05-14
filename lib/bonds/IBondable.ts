import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { IToken } from '../tokens/IToken'


export interface IBondable {
    getToken(): IToken
    getBondName(): string
    getBondFee(): BigDecimal
    getBondPrice(priceInUSD: BigInt): BigDecimal
    getCarbonCustodied(depositAmount: BigInt): BigDecimal
    getTreasuredAmount(): BigDecimal
  }