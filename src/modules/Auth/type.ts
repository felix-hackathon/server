import Joi from '@/core/joi'
import { JoiSchema } from 'joi-class-decorators'

export class GetSignNonceQuery {
	@JoiSchema(Joi.ethAddress().required())
	address: string
}

export class SignInPayload {
	@JoiSchema(Joi.string().optional())
	address?: string

	@JoiSchema(Joi.string().optional())
	signature?: string
}

export class RefreshTokenPayload {
	@JoiSchema(Joi.string().required())
	refreshToken?: string
}
