import { Address } from "@graphprotocol/graph-ts";

import * as constants from "../utils/Constants"
import { ILiquidityPool } from "./ILiquidityPool";
import { BCTUSDCLP } from "./impl/BCTUSDCLP";
import { KLIMABCTLP } from "./impl/KLIMABCTLP";
import { KLIMAMCO2LP } from "./impl/KLIMAMCO2";
import { KLIMANBOLP } from "./impl/KLIMANBOLP";
import { KLIMAUBOLP } from "./impl/KLIMAUBOLP";
import { KLIMAUSDCLP } from "./impl/KLIMAUSDCLP";
import { MCO2USDCLP } from "./impl/MCO2USDCLP";



export class LiquidityPoolFactory {
    constructor() {}

    public getLPForAddress(address: Address): ILiquidityPool {

        if (address.equals(Address.fromHexString(constants.BCT_USDC_PAIR))) {
            return new BCTUSDCLP(address)
        } 
        if (address.equals(Address.fromHexString(constants.KLIMA_BCT_PAIR))) {
            return new KLIMABCTLP(address)
        } 
        if (address.equals(Address.fromHexString(constants.KLIMA_MCO2_PAIR))) {
            return new KLIMAMCO2LP(address)
        } 
        if (address.equals(Address.fromHexString(constants.KLIMA_NBO_PAIR))) {
            return new KLIMANBOLP(address)
        } 
        if (address.equals(Address.fromHexString(constants.KLIMA_UBO_PAIR))) {
            return new KLIMAUBOLP(address)
        }
        if (address.equals(Address.fromHexString(constants.KLIMA_USDC_PAIR))) {
            return new KLIMAUSDCLP(address)
        }
        if (address.equals(Address.fromHexString(constants.MCO2_USDC_PAIR))) {
            return new MCO2USDCLP(address)
        }

        throw new Error("[Liquidity Pool Factory] Failed to get LP for address: "+ address.toHexString());
    }
}