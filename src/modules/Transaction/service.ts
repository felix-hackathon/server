import Exception from '@/core/exception'
import AppService from '../App/service'
import Caver from 'caver-js'
import AppConfig from '@/core/configs'
import { NFTAccessoryTopics, NFTCarTopics, RegistryTopics, ifaceAccessory, ifaceCar, ifaceRegistry } from '@/core/web3/constants'
import NFTService from '../NFT/service'

export default class TransactionService {
	static async call(chainId: number, rawTx: string) {
		const chains = await AppService.getChains()
		const chain = await chains.find((i) => i.chainId === chainId)
		if (!chain) {
			throw Exception.BadRequest('Chain not found')
		}
		const caver = new Caver(chain.rpc[0])
		caver.klay.accounts.wallet.add(AppConfig.callerKeys[0], '0xDF61031025A0f177314c10eB4bddF35B9E9bddd0')
		const res = await caver.klay.sendTransaction({
			senderRawTransaction: rawTx,
			feePayer: '0xDF61031025A0f177314c10eB4bddF35B9E9bddd0',
		})

		if (res?.logs) {
			for (let i = 0; i < res.logs.length; i++) {
				const log = res.logs[i]
				const topic = log.topics?.[0]
				if (topic === NFTCarTopics.BaseCollectionMinted) {
					const decoded = ifaceCar.decodeEventLog('BaseCollectionMinted', log.data, log.topics)
					const [recipient, type, tokenId] = decoded
					await NFTService.handleMint({
						chainId,
						nftAddress: log.address.toLowerCase(),
						nftId: `${tokenId}`,
						to: `${recipient}`.toLowerCase(),
						txHash: log.transactionHash,
						type: `${type}`,
					})
				} else if (topic === NFTAccessoryTopics.AccessoryMinted) {
					const decoded = ifaceAccessory.decodeEventLog('AccessoryMinted', log.data, log.topics)
					const [recipient, type, tokenId] = decoded
					await NFTService.handleMint({
						chainId,
						nftAddress: log.address.toLowerCase(),
						nftId: `${tokenId}`,
						to: `${recipient}`.toLowerCase(),
						txHash: log.transactionHash,
						type: `${type}`,
					})
				} else if (topic === RegistryTopics.AccountCreated) {
					const decoded = ifaceRegistry.decodeEventLog('AccountCreated', log.data, log.topics)
					const [account, implementation, cId, tokenContract, tokenId, salt] = decoded
					console.log(`TBA Address `, { account, implementation, cId, tokenContract, tokenId, salt })
					await NFTService.handleSaveTBA({
						chainId: parseInt(`${cId}`),
						nftAddress: `${tokenContract}`.toLowerCase(),
						nftId: `${tokenId}`,
						tbaAddress: `${account}`.toLowerCase(),
					})
				}
			}
		}
		return res
	}
}
