import fetcher1Inch from '@/core/1inch'
import SwapService from './service'
import SwapTokenModel from '@/models/Swap/Token'
import Logger from '@/core/logger'
import SwapProtocolModel from '@/models/Swap/Protocol'
const seed1Inch = async (chainId: number) => {
	await seedTokens(chainId)
	await seedProtocols(chainId)
}

const seedTokens = async (chainId: number) => {
	const tokens = await SwapTokenModel.count({ chainId }).lean()
	if (tokens === 0) {
		const res = await fetcher1Inch(`/swap/v5.2/${chainId}/tokens`)
		if (res?.data?.tokens) {
			const importTokens = Object.values(res?.data?.tokens).map((token: any) => ({
				address: token?.address?.toLowerCase(),
				name: token?.name,
				chainId,
				symbol: token?.symbol,
				decimals: token?.decimals,
				icon: token?.logoURI || null,
				tags: token?.tags || [],
			}))
			await SwapTokenModel.insertMany(importTokens)
			Logger.info(`Seed token swap ${chainId} success`)
		}
	}
}

const seedProtocols = async (chainId: number) => {
	const protocols = await SwapProtocolModel.count({ chainId }).lean()
	if (protocols === 0) {
		const res = await fetcher1Inch(`/swap/v5.2/${chainId}/liquidity-sources`)
		if (res?.data?.protocols) {
			const importProtocols = Object.values(res?.data?.protocols).map((protocol: any) => ({
				name: protocol?.title || '',
				img: protocol?.img || null,
				imgColor: protocol?.imgColor || null,
				chainId,
			}))
			await SwapProtocolModel.insertMany(importProtocols)
			Logger.info(`Seed protocol swap ${chainId} success`)
		}
	}
}

export default seed1Inch
