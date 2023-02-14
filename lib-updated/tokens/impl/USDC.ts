import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { IToken } from '../IToken'
import { ERC20 } from '../../graph-generated/ERC20'
import * as constants from '../../utils/Constants'

import { toDecimal, ZERO_BD } from '../../utils/Decimals'
import { KLIMA } from './KLIMA'

export class USDC implements IToken {
  private contractAddress: Address = constants.USDC_ERC20_CONTRACT
  private klimaToken: KLIMA = new KLIMA()

  getContractAddress(): Address {
    return this.contractAddress
  }

  getTokenName(): string {
    return 'USDC'
  }
  getDecimals(): number {
    return 6
  }
  getFormattedPrice(rawPrice: BigInt): BigDecimal {
    return toDecimal(rawPrice, this.getDecimals())
  }

  getMarketPrice(): BigDecimal {
    return ZERO_BD
  }

  getUSDPrice(): BigDecimal {
    return BigDecimal.fromString('1')
  }

  updateMarketPrice(timestamp: BigInt, newPrice?: BigDecimal): void {
    // Not implemented, constant value stablecoin
  }

  updateUSDPrice(timestamp: BigInt, blockNumber: BigInt, klimaPrice: BigDecimal): BigDecimal {
    // Not implemented, constant value stablecoin
    return BigDecimal.fromString('1')
  }

  getTotalSupply(): BigDecimal {
    throw new Error('Method not implemented.')
  }

  getAddressBalance(address: Address): BigDecimal {
    const newBalanceRaw = ERC20.bind(this.contractAddress).try_balanceOf(address)
    if (!newBalanceRaw.reverted) {
      return toDecimal(newBalanceRaw.value, this.getDecimals())
    }
    return BigDecimal.fromString('0')
  }
}
