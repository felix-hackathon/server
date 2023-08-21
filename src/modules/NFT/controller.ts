import { Controller, Get, Params, ParamsValidation } from '@/core/decorators'
import { NFTParams } from './type'

@Controller('/nft', 'App')
export default class AppController {
	@Get('/metadata/{chainId}/{address}/{id}', 'Get Metadata')
	@ParamsValidation(NFTParams)
	async getMetadata(@Params() params: NFTParams) {
		return {
			nftAddress: params.address,
			chainId: params.chainId,
			nftId: params.id,
			name: 'Test NFT',
			attributes: [
				{
					trait_type: 'Type',
					value: 'Supper car',
					display_type: 'string',
				},
			],
			animation_url: 'https://renderer-nft.vercel.app/',
		}
	}
}
