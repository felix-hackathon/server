import CacheService from '@/core/cache'
import { promiseAll } from '@/core/utils'
import ChainModel from '@/models/Chain'

export default class AppService {
	static async loadCache() {
		await this.getAppConfig()
	}

	static async getAppConfig() {
		const [chains] = await promiseAll([this.getChains()])

		return {
			chains,
		}
	}

	static async getChains() {
		const cacheKey = `chains`
		const data = await CacheService.get(cacheKey)
		if (data) {
			return data
		}
		const chains = await ChainModel.find().lean()
		await CacheService.set(cacheKey, chains)
		return chains
	}
}
