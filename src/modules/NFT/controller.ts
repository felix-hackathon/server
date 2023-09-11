import { Controller, Get, Params, ParamsValidation } from '@/core/decorators'
import { NFTParams } from './type'
import NFTModel from '@/models/NFT'
import Exception from '@/core/exception'

@Controller('/nft', 'App')
export default class AppController {
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
			animation_url: `https://nft-klaytn.vercel.app/nft/${params.chainId}/${params.address}/${params.id}`,
		}
	}
}
