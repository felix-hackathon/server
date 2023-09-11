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
