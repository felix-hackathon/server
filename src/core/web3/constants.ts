import { Interface } from 'ethers'
import carABI from './carAbi'
import accessoryABI from './accessoryAbi'

export const ifaceCar = Interface.from(carABI)

export const NFTCarTopics = {
	BaseCollectionMinted: ifaceCar.getEvent('BaseCollectionMinted').topicHash,
}

export const ifaceAccessory = Interface.from(accessoryABI)

export const NFTAccessoryTopics = {
	AccessoryMinted: ifaceAccessory.getEvent('AccessoryMinted').topicHash,
}

export const ifaceRegistry = Interface.from([
	{
		anonymous: false,
		inputs: [
			{ indexed: false, internalType: 'address', name: 'account', type: 'address' },
			{ indexed: false, internalType: 'address', name: 'implementation', type: 'address' },
			{ indexed: false, internalType: 'uint256', name: 'chainId', type: 'uint256' },
			{ indexed: false, internalType: 'address', name: 'tokenContract', type: 'address' },
			{ indexed: false, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
			{ indexed: false, internalType: 'uint256', name: 'salt', type: 'uint256' },
		],
		name: 'AccountCreated',
		type: 'event',
	},
])

export const RegistryTopics = {
	AccountCreated: ifaceRegistry.getEvent('AccountCreated').topicHash,
}
