import { BigDecimal, BigInt, Address } from '@graphprotocol/graph-ts'
import { ERC20 } from '../../graph-generated/ERC20'
import { IToken } from '../IToken'

import * as constants from '../../utils/Constants'
import { toDecimal, ZERO_BD } from '../../utils/Decimals'
import { KLIMA } from './KLIMA'
import { PriceUtil } from '../../utils/Price'
import { loadOrCreateToken } from '../../utils/Token'

export class UBO implements IToken {
  private contractAddress: Address = constants.UBO_ERC20_CONTRACT
  private klimaToken: KLIMA = new KLIMA()

  getContractAddress(): Address {
    return this.contractAddress
  }

  getTokenName(): string {
    return constants.BCT_TOKEN
  }
  getDecimals(): number {
    return 18
  }

  getFormattedPrice(rawPrice: BigInt): BigDecimal {
    return toDecimal(rawPrice, this.getDecimals())
  }

  getMarketPrice(): BigDecimal {
    const token = loadOrCreateToken(this.contractAddress)
    return token.latestPricePerKLIMA
  }

  getUSDPrice(): BigDecimal {
    const token = loadOrCreateToken(this.contractAddress)
    return token.latestPriceUSD
  }

  updateMarketPrice(timestamp: BigInt, newPrice: BigDecimal = ZERO_BD): void {
    let token = loadOrCreateToken(this.contractAddress)

    // Set the price directly if we had access to liquidity pool information
    if (newPrice !== ZERO_BD) {
      token.latestPricePerKLIMA = newPrice
      token.latestPricePerKLIMAUpdated = timestamp
      token.save()
      return
    }

    token.latestPricePerKLIMA = PriceUtil.getKLIMA_UBORate()
    token.latestPricePerKLIMAUpdated = timestamp
    token.save()
  }

  updateUSDPrice(timestamp: BigInt, blockNumber: BigInt): void {
    let token = loadOrCreateToken(this.contractAddress)

    token.latestPriceUSD = this.getMarketPrice() == ZERO_BD ? ZERO_BD : this.klimaToken.getUSDPrice().div(this.getMarketPrice())
    token.latestPriceUSDUpdated = timestamp
    token.save()
  }

  getTotalSupply(): BigDecimal {
    let ercContract = ERC20.bind(this.contractAddress)
    let totalSupply = toDecimal(ercContract.totalSupply(), this.getDecimals())

    return totalSupply
  }

  getAddressBalance(address: Address): BigDecimal {
    const newBalanceRaw = ERC20.bind(this.contractAddress).try_balanceOf(address)
    if (!newBalanceRaw.reverted) {
      return toDecimal(newBalanceRaw.value, this.getDecimals())
    }
    return BigDecimal.fromString('0')
  }
}
