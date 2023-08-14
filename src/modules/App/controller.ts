import AppService from './service'
import { Controller, Get, Payload, PayloadValidation, Post } from '@/core/decorators'
import { TestPayload } from './type'
import { decode } from 'msgpack-lite'
import { UseAuthGuard } from '@/core/decorators/use-auth'

@Controller('/app', 'App')
export default class AppController {
	@Get('/config', 'Get app config')
	async getAppTemplate() {
		return AppService.getAppConfig()
	}
}
