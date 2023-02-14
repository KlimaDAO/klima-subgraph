import { BigDecimal, BigInt, Address } from '@graphprotocol/graph-ts'
import { ERC20 } from '../../graph-generated/ERC20'
import { IToken } from '../IToken'

import * as constants from '../../utils/Constants'
import { toDecimal, ZERO_BD } from '../../utils/Decimals'
import { KLIMA } from './KLIMA'
import { PriceUtil } from '../../utils/Price'
import { loadOrCreateToken } from '../../utils/Token'

export class BCT implements IToken {
  private contractAddress: Address = constants.BCT_ERC20_CONTRACT
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

    token.latestPricePerKLIMA = PriceUtil.getKLIMA_BCTRate()
    token.latestPricePerKLIMAUpdated = timestamp
    token.save()
  }

  updateUSDPrice(timestamp: BigInt, blockNumber: BigInt): void {
    let token = loadOrCreateToken(this.contractAddress)

    // We are going through BCT-USD until the liquidity is removed
    if (blockNumber < constants.BCT_USDC_PAIR_REMOVE_LIQUIDITY_BLOCK) {
      token.latestPriceUSD = PriceUtil.getBCT_USDRate()
      token.latestPriceUSDUpdated = timestamp
      return
    }

    token.latestPriceUSD = this.getMarketPrice().times(this.klimaToken.getUSDPrice())
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
