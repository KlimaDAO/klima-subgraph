import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import { ERC20 } from "../../../../generated/BCT/ERC20";
import { ICarbonToken } from "../ICarbonToken";
import { toDecimal } from "../../../../../lib/utils/Decimals";
import { MCO2_TOKEN } from "../../../../../lib/utils/Constants";


export class MCO2 implements ICarbonToken {

    private contractAddress: Address

    constructor(contractAddress: Address) {
        this.contractAddress = contractAddress
    }

    getDecimals(): number {
        return 18
    }

    getAddress(): Address {
        return this.contractAddress
    }

    getToken(): string {
        return MCO2_TOKEN
    }

    returnAddressBalance(address: Address): BigDecimal {
        const newBalanceRaw = ERC20.bind(this.contractAddress).try_balanceOf(address)
        if (!newBalanceRaw.reverted) {
            return toDecimal(newBalanceRaw.value, this.getDecimals())
        }
        return BigDecimal.fromString("0")
    }

}
