import Joi from '@/core/joi'
import { JoiSchema } from 'joi-class-decorators'

export class TestPayload {
	@JoiSchema(Joi.string().required())
	test: string
}
