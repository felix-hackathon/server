import fetcher1Inch from '@/core/1inch'
import CacheService from '@/core/cache'
import AppConfig from '@/core/configs'
import Exception from '@/core/exception'
import SwapProtocolModel from '@/models/Swap/Protocol'
import SwapTokenModel from '@/models/Swap/Token'
import axios from 'axios'
import { stringify } from 'querystring'

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

	static async swap(chainId: number, payload) {
		const res = await fetcher1Inch(`/swap/v5.2/${chainId}/swap?${stringify(payload)}`)
		return res?.data
	}
}
