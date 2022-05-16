import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { IToken } from '../tokens/IToken'


export interface ILiquidityPool {
    getLPName(): string
    getToken1(): IToken
    getToken2(): IToken
    getAffectedTokensFromSwap(): Array<IToken>
  }