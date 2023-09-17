import Joi from '@/core/joi'
import { JoiSchema } from 'joi-class-decorators'

export class NFTParams {
	@JoiSchema(Joi.number().required())
	chainId: number
	@JoiSchema(Joi.string().required())
	address: string
	@JoiSchema(Joi.string().required())
	id: string
}

export class NFTQuery {
	@JoiSchema(Joi.number().required())
	chainId: number

	@JoiSchema(Joi.ethAddress().optional())
	owner?: string
}

export class SellNFTPayload {
	@JoiSchema(Joi.number().required())
	chainId: number

	@JoiSchema(Joi.string().required())
	address: string
	@JoiSchema(Joi.string().required())
	id: string

	@JoiSchema(Joi.string().required())
	priceWei: string

	@JoiSchema(Joi.string().required())
	sellerAddress: string

	@JoiSchema(Joi.string().required())
	signatureSeller: string
}

export class RejectOfferPayload {
	@JoiSchema(Joi.objectId().required())
	id: string
}

export class CancelNFTPayload {
	@JoiSchema(Joi.number().required())
	chainId: number

	@JoiSchema(Joi.string().required())
	address: string
	@JoiSchema(Joi.string().required())
	id: string
}

export class OfferNFTPayload {
	@JoiSchema(Joi.number().required())
	chainId: number

	@JoiSchema(Joi.string().required())
	address: string
	@JoiSchema(Joi.string().required())
	id: string

	@JoiSchema(Joi.string().required())
	priceWei: string

	@JoiSchema(Joi.string().required())
	buyerAddress: string

	@JoiSchema(Joi.string().required())
	signatureBuyer: string
}
