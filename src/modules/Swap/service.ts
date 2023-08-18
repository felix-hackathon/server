import fetcher1Inch from '@/core/1inch'
import CacheService from '@/core/cache'
import AppConfig from '@/core/configs'
import SwapProtocolModel from '@/models/Swap/Protocol'
import SwapTokenModel from '@/models/Swap/Token'
import Caver from 'caver-js'
import { stringify } from 'querystring'
import AppService from '../App/service'
import Exception from '@/core/exception'
import { SwapPayload } from './type'

export default class SwapService {
	static async getTokens(chainId: number) {
		const cacheKey = `swap::tokens::${chainId}`
		const data = await CacheService.get(cacheKey)
		if (data) {
			return data
		}
		const tokens = await SwapTokenModel.find({ chainId }, { __v: 0, createdAt: 0, updatedAt: 0, _id: 0 }).lean()
		await CacheService.set(cacheKey, tokens)
		return tokens || []
	}

	static async getProtocols(chainId: number) {
		const cacheKey = `swap::protocols::${chainId}`
		const data = await CacheService.get(cacheKey)
		if (data) {
			return data
		}
		const protocols = await SwapProtocolModel.find({ chainId }, { __v: 0, createdAt: 0, updatedAt: 0, _id: 0 }).lean()
		await CacheService.set(cacheKey, protocols)
		return protocols || []
	}

	static async getSpender(chainId: number) {
		const cacheKey = `swap::spender::${chainId}`
		const data = await CacheService.get(cacheKey)
		if (data) {
			return data
		}
		const res = await fetcher1Inch(`/swap/v5.2/${chainId}/approve/spender`)
		await CacheService.set(cacheKey, res?.data?.address)
		return res?.data?.address || null
	}

	static async quote(chainId: number, payload) {
		const res = await fetcher1Inch(`/swap/v5.2/${chainId}/quote?${stringify(payload)}`)
		return res?.data
	}

	static async getSwapData(chainId: number, payload) {
		const res = await fetcher1Inch(`/swap/v5.2/${chainId}/swap?${stringify(payload)}`)
		return res?.data
	}
	static async swap(chainId: number, { rawTx }: SwapPayload) {
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
		return res
	}
}
