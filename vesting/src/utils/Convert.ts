import { Address, BigInt, BigDecimal } from "@graphprotocol/graph-ts"
import { KlimaStakingV1 } from "../../generated/CO2CompoundNFT/KlimaStakingV1"
import * as constants from '../../../lib/utils/Constants'
import { toDecimal } from "../../../lib/utils/Decimals"


export function convertToWsKLIMA(klimaAmount: BigDecimal): BigDecimal {

    const indexCall = KlimaStakingV1.bind(Address.fromString(constants.STAKING_CONTRACT_V1)).try_index()
    if (indexCall.reverted) {
        throw new Error("Index call reverted")
    }

    const indexDecimal = toDecimal(BigInt.fromString(indexCall.value.toString()), 18)
    const wsKlimaSupply = klimaAmount.div(indexDecimal)    

    return wsKlimaSupply
}