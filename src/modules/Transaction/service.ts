import Exception from '@/core/exception'
import AppService from '../App/service'
import Caver from 'caver-js'
import AppConfig from '@/core/configs'
import NFTService from '../NFT/service'
import { sleep } from '@/core/utils'

export default class TransactionService {
	static async call(chainId: number, rawTx: string) {
		try {
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
			await sleep(1000)
			await NFTService.processLogByHash(chainId, res.transactionHash)
			return res
		} catch (error) {
			console.log(error)
			return {
				fail: true,
				error: error,
			}
		}
	}
}
