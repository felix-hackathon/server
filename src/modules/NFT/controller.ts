import { Controller, Get, Params, ParamsValidation, Payload, PayloadValidation, Post, Query, QueryValidation } from '@/core/decorators'
import { CancelNFTPayload, NFTParams, NFTQuery, OfferNFTPayload, RejectOfferPayload, SellNFTPayload } from './type'
import NFTModel from '@/models/NFT'
import Exception from '@/core/exception'
import Config from './config'
import NFTService from './service'
import AggregateFind from '@/core/aggregate'
import RequestNFTModel, { RequestNFTStatus, RequestNFTType } from '@/models/RequestNFT'
import AggregateUtils from '@/core/aggregate/utils'

@Controller('/nft', 'NFT')
export default class AppController {
	@Get('/', 'Get ALL NFT Car')
	@QueryValidation(NFTQuery)
	async getAllNFT(@Query() query: NFTQuery) {
		const aggregate = new AggregateFind(NFTModel)
		aggregate.filter([
			{
				field: 'chainId',
				value: query.chainId,
			},
			{
				field: 'nftAddress',
				value: Config.carAddress?.toLowerCase(),
			},
		])

		if (query.owner) {
			aggregate.filter([
				{
					field: 'owner',
					value: query.owner.toLowerCase(),
				},
			])
		}

		aggregate.joinModel({
			alias: 'market',
			externalCollection: RequestNFTModel.collection.name,
			fields: [
				{
					external: 'nftAddress',
					internal: 'nftAddress',
				},
				{
					external: 'nftId',
					internal: 'nftId',
				},
				{
					external: 'chainId',
					internal: 'chainId',
				},
			],
			pipelineLookup: [
				AggregateUtils.filter([
					{
						field: 'status',
						value: RequestNFTStatus.Init,
					},
					{ field: 'type', value: RequestNFTType.Market },
				]),
			],
		})

		aggregate.unwindLookup('market')

		aggregate.joinModel({
			alias: 'offer',
			externalCollection: RequestNFTModel.collection.name,
			fields: [
				{
					external: 'nftAddress',
					internal: 'nftAddress',
				},
				{
					external: 'nftId',
					internal: 'nftId',
				},
				{
					external: 'chainId',
					internal: 'chainId',
				},
			],
			pipelineLookup: [
				AggregateUtils.filter([
					{
						field: 'status',
						value: RequestNFTStatus.Init,
					},
					{ field: 'type', value: RequestNFTType.Offer },
				]),
			],
		})
		aggregate.joinModel({
			alias: 'auction',
			externalCollection: RequestNFTModel.collection.name,
			fields: [
				{
					external: 'nftAddress',
					internal: 'nftAddress',
				},
				{
					external: 'nftId',
					internal: 'nftId',
				},
				{
					external: 'chainId',
					internal: 'chainId',
				},
			],
			pipelineLookup: [
				AggregateUtils.filter([
					{
						field: 'status',
						value: RequestNFTStatus.Init,
					},
					{ field: 'type', value: RequestNFTType.Auction },
				]),
			],
		})

		const { data } = await aggregate.execWithoutCount(0, 0)
		return data
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
			return {
				name: 'Car',
			}
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

	@Post('/sell')
	@PayloadValidation(SellNFTPayload)
	async sell(@Payload() payload: SellNFTPayload) {
		return NFTService.sell(payload)
	}

	@Post('/reject')
	@PayloadValidation(RejectOfferPayload)
	async reject(@Payload() payload: RejectOfferPayload) {
		return NFTService.rejectOffer(payload)
	}

	@Post('/cancel')
	@PayloadValidation(CancelNFTPayload)
	async cancel(@Payload() payload: CancelNFTPayload) {
		return NFTService.cancel(payload)
	}

	@Post('/offer')
	@PayloadValidation(OfferNFTPayload)
	async offer(@Payload() payload: OfferNFTPayload) {
		return NFTService.offer(payload)
	}
}
