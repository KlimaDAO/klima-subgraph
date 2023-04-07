import { BigDecimal, BigInt, Address } from '@graphprotocol/graph-ts'
import { ERC20 } from '../../generated/ERC20'
import { IToken } from '../IToken'

import * as constants from '../../utils/Constants'
import { toDecimal } from '../../utils/Decimals'
import { KLIMA } from './KLIMA'
import { PriceUtil } from '../../utils/Price'

export class NBO implements IToken {
  private contractAddress: Address = Address.fromString(constants.NBO_ERC20_CONTRACT)
  private klimaToken: KLIMA = new KLIMA()

  getERC20ContractAddress(): string {
    return this.contractAddress.toHexString()
  }

  getTokenName(): string {
    return constants.NBO_TOKEN
  }
  getDecimals(): number {
    return 18
  }

  getFormattedPrice(rawPrice: BigInt): BigDecimal {
    return toDecimal(rawPrice, this.getDecimals())
  }

  getMarketPrice(blockNumber: BigInt): BigDecimal {
    return PriceUtil.getKLIMA_NBORate()
  }

  getUSDPrice(blockNumber: BigInt): BigDecimal {
    const klimaUsdPrice = this.klimaToken.getUSDPrice(blockNumber)
    const nboMarketPrice = this.getMarketPrice(blockNumber)
    if (nboMarketPrice.equals(BigDecimal.zero())) {
      return BigDecimal.zero()
    }

    return klimaUsdPrice.div(nboMarketPrice)
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
