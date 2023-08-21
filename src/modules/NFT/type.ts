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
