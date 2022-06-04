import { ZERO_ADDRESS } from "../../lib/utils/Constants";
import { Transfer } from "../generated/MCO2/ERC20";
import { MCO2 } from "./utils/carbon_token/impl/MCO2";
import { HoldingsUtils } from "./utils/Holdings";

export function handleTransfer(event: Transfer): void {
    if (event.params.from.toHexString() != ZERO_ADDRESS) {
        HoldingsUtils.updateHolding(new MCO2(event.address), event.block.timestamp, event.params.from)
    }
    if (event.params.to.toHexString() != ZERO_ADDRESS) {
        HoldingsUtils.updateHolding(new MCO2(event.address), event.block.timestamp, event.params.to)
    }
}
