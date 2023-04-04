import { Address } from '@graphprotocol/graph-ts'
import { ZERO_ADDRESS } from '../../lib-updated/utils/Constants'
import { Transfer } from '../generated/templates/ToucanCarbonOffsets/ERC20'
import { loadCarbonOffset, updateCarbonOffsetWithCall } from './utils/CarbonOffset'

export function handleTransfer(event: Transfer): void {
    let offset = loadCarbonOffset(event.address)

    if (offset.vintage == 1970) {
        // Update the entity with call data
        offset = updateCarbonOffsetWithCall(Address.fromBytes(offset.id), offset.bridgeProtocol)
    }

    if (event.params.from == ZERO_ADDRESS) {
        offset.bridged = offset.bridged.plus(event.params.value)
        offset.currentSupply = offset.currentSupply.plus(event.params.value)
    }

    if (event.params.to == ZERO_ADDRESS) {
        offset.currentSupply = offset.currentSupply.minus(event.params.value)
    }

    offset.save()
}
