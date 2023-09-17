import { Interface } from 'ethers'
import carABI from './carAbi'
import accessoryABI from './accessoryAbi'

export const ifaceCar = Interface.from(carABI)

export const NFTCarTopics = {
	BaseCollectionMinted: ifaceCar.getEvent('BaseCollectionMinted').topicHash,
	Transfer: ifaceCar.getEvent('Transfer').topicHash,
}

export const ifaceAccessory = Interface.from(accessoryABI)

export const NFTAccessoryTopics = {
	AccessoryMinted: ifaceAccessory.getEvent('AccessoryMinted').topicHash,
}

export const ifaceExchange = Interface.from([
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'enum QuoteType',
				name: 'quoteType',
				type: 'uint8',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'orderNonce',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'enum CollectionType',
				name: 'collectionType',
				type: 'uint8',
			},
			{
				indexed: false,
				internalType: 'address',
				name: 'collection',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'tokenId',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'address',
				name: 'currency',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'price',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'address',
				name: 'seller',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'address',
				name: 'recipient',
				type: 'address',
			},
		],
		name: 'OrderExecuted',
		type: 'event',
	},
])

export const ExchangeTopics = {
	OrderExecuted: ifaceExchange.getEvent('OrderExecuted').topicHash,
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
