import Joi from '@/core/joi'
import { JoiSchema } from 'joi-class-decorators'

export class ChainIdParams {
	@JoiSchema(Joi.number().required())
	chainId: number
}
