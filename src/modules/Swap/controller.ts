import { Controller, Get, Params, ParamsValidation, Query } from '@/core/decorators'
import { ChainIdParams } from './type'
import SwapService from './service'

@Controller('/{chainId}/swap', 'Swap')
export default class SwapController {
	@Get('/tokens', 'Get Swap Tokens')
	@ParamsValidation(ChainIdParams)
	async getTokens(@Params('chainId') chainId: number) {
		return SwapService.getTokens(chainId)
	}
	@Get('/protocols', 'Get Swap Protocols')
	@ParamsValidation(ChainIdParams)
	async getProtocols(@Params('chainId') chainId: number) {
		return SwapService.getProtocols(chainId)
	}

	@Get('/spender', 'Get Swap Spender')
	@ParamsValidation(ChainIdParams)
	async getSpender(@Params('chainId') chainId: number) {
		return SwapService.getSpender(chainId)
	}

	@Get('/quote')
	@ParamsValidation(ChainIdParams)
	async quote(@Params('chainId') chainId: number, @Query() payload) {
		return SwapService.quote(chainId, payload)
	}
}
