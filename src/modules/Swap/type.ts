import Joi from '@/core/joi'
import { JoiSchema } from 'joi-class-decorators'

export class ChainIdParams {
	@JoiSchema(Joi.number().required())
	chainId: number
}

export class SwapPayload {
	@JoiSchema(Joi.string().required())
	rawTx: string
}
