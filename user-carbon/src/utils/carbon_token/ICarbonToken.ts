import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export interface ICarbonToken {
    getDecimals(): number
    getAddress(): Address
    getToken(): string
    returnAddressBalance(address: Address): BigDecimal
}
