import { Controller, Params, ParamsValidation, Payload, PayloadValidation, Post } from '@/core/decorators'
import { TxPayload } from './type'
import TransactionService from './service'
import { ChainIdParams } from '../Swap/type'

@Controller('/{chainId}/transaction', 'Transaction')
export default class TransactionController {
	@Post('/')
	@ParamsValidation(ChainIdParams)
	@PayloadValidation(TxPayload)
	async call(@Params() params: ChainIdParams, @Payload() payload: TxPayload) {
		return TransactionService.call(params.chainId, payload.rawTx)
	}
}
