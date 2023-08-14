import { Controller, Get, Payload, PayloadValidation, Post, Query, QueryValidation } from '@/core/decorators'
import { GetSignNonceQuery, RefreshTokenPayload, SignInPayload } from './type'
import AuthService from './service'

@Controller('/authentication', 'Auth')
export default class AuthController {
	@Get('/sign', 'Get sign-in data')
	@QueryValidation(GetSignNonceQuery)
	async getAll(@Query() query: GetSignNonceQuery) {
		const { address } = query
		return AuthService.getSignNonce(address)
	}

	@Post('/sign', 'Sign in')
	@PayloadValidation(SignInPayload)
	async signIn(@Payload() payload: SignInPayload) {
		console.log(payload)
		return AuthService.signIn(payload)
	}

	@Post('/refresh', 'Refresh token')
	@PayloadValidation(RefreshTokenPayload)
	async refreshToken(@Payload('refreshToken') refreshToken: string) {
		return AuthService.refreshToken(refreshToken)
	}
}
