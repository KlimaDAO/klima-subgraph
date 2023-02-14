import { BigDecimal, BigInt, Address, log } from '@graphprotocol/graph-ts'
import { ERC20 } from '../../graph-generated/ERC20'
import { IToken } from '../IToken'

import * as constants from '../../utils/Constants'
import { toDecimal, ZERO_BD } from '../../utils/Decimals'
import { PriceUtil } from '../../utils/Price'
import { loadOrCreateToken } from '../../utils/Token'

export class KLIMA implements IToken {
  private contractAddress: Address = constants.KLIMA_ERC20_CONTRACT

  getContractAddress(): Address {
    return this.contractAddress
  }

  getTokenName(): string {
    return constants.KLIMA_TOKEN
  }

  getDecimals(): number {
    return 9
  }

  getFormattedPrice(rawPrice: BigInt): BigDecimal {
    return toDecimal(rawPrice, this.getDecimals())
  }

  getMarketPrice(): BigDecimal {
    return BigDecimal.fromString('1')
  }

  getUSDPrice(): BigDecimal {
    const token = loadOrCreateToken(this.contractAddress)
    return token.latestPriceUSD
  }

  updateMarketPrice(timestamp: BigInt, newPrice: BigDecimal = ZERO_BD): void {
    // Always 1
  }

  updateUSDPrice(timestamp: BigInt, blockNumber: BigInt): void {
    let token = loadOrCreateToken(this.contractAddress)
    log.info('Updating KLIMA price: {}', [PriceUtil.getKLIMA_BCTRate().times(PriceUtil.getBCT_USDRate()).toString()])

    //We are going through KLIMA-BCT route until Liquidity is bolstered for KLIMA USDC
    if (blockNumber < constants.KLIMA_USDC_PAIR_BOLSTER_LIQUIDITY_BLOCK) {
      token.latestPriceUSD = PriceUtil.getKLIMA_BCTRate().times(PriceUtil.getBCT_USDRate())
    } else token.latestPriceUSD = PriceUtil.getKLIMA_USDRate()
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
