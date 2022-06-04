import { ZERO_ADDRESS } from "../../lib/utils/Constants";
import { Transfer } from "../generated/BCT/ERC20";
import { BCT } from "./utils/carbon_token/impl/BCT";
import { HoldingsUtils } from "./utils/Holdings";

export function handleTransfer(event: Transfer): void {
    if (event.params.from.toHexString() != ZERO_ADDRESS) {
        HoldingsUtils.updateHolding(new BCT(event.address), event.block.timestamp, event.params.from)
    }
    if (event.params.to.toHexString() != ZERO_ADDRESS) {
        HoldingsUtils.updateHolding(new BCT(event.address), event.block.timestamp, event.params.to)
    }
}
