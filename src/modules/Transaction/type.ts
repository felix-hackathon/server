import Joi from '@/core/joi'
import { JoiSchema } from 'joi-class-decorators'

export class TxPayload {
	@JoiSchema(Joi.string().required())
	rawTx: string
}
