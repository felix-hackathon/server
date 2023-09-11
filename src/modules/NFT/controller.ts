import { Controller, Get, Params, ParamsValidation, Query, QueryValidation } from '@/core/decorators'
import { NFTParams, NFTQuery } from './type'
import NFTModel from '@/models/NFT'
import Exception from '@/core/exception'
import Config from './config'

@Controller('/nft', 'NFT')
export default class AppController {
	@Get('/', 'Get ALL NFT Car')
	@QueryValidation(NFTQuery)
	async getAllNFT(@Query() query: NFTQuery) {
		const nfts = await NFTModel.find({
			chainId: query.chainId,
			nftAddress: Config.carAddress?.toLowerCase(),
			...(query.owner ? { owner: query.owner?.toLowerCase() } : {}),
		}).lean()
		return nfts
	}

	@Get('/{chainId}/{address}/{id}', 'Get NFT Info')
	@ParamsValidation(NFTParams)
	async getNFT(@Params() params: NFTParams) {
		const nft = await NFTModel.findOne({
			chainId: parseInt(`${params.chainId}`),
			nftAddress: params.address.toLowerCase(),
			nftId: params.id,
		}).lean()
		if (!nft) {
			throw Exception.NotFound('NFT not found')
		}
		if (!nft.tbaAddress) {
			return nft
		}
		const items = await NFTModel.find({ owner: nft.tbaAddress }).lean()

		return {
			...nft,
			items,
		}
	}

	@Get('/metadata/{chainId}/{address}/{id}', 'Get Metadata')
	@ParamsValidation(NFTParams)
	async getMetadata(@Params() params: NFTParams) {
		const nft = await NFTModel.findOne({
			chainId: parseInt(`${params.chainId}`),
			nftAddress: params.address.toLowerCase(),
			nftId: params.id,
		}).lean()
		if (!nft) {
			throw Exception.NotFound('NFT not found')
		}
		return {
			nftAddress: params.address,
			chainId: params.chainId,
			nftId: params.id,
			name: nft?.name,
			image: nft?.image,
			attributes: nft?.attributes || [],
			...(nft.nftAddress?.toLowerCase() === Config.carAddress?.toLowerCase()
				? { animation_url: `https://nft-klaytn.vercel.app/nft/${params.chainId}/${params.address}/${params.id}` }
				: {}),
		}
	}
}
