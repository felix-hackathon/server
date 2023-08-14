import 'reflect-metadata'
import { compose, Options } from '@hapi/glue'
import path from 'path'
import { fileURLToPath } from 'url'
import manifest from './core/manifest'
import AppConfig from './core/configs'
import plugins from './core/plugins'
import DatabaseService from './core/database'
import mongoose from 'mongoose'
import RouterService from './core/routers'
import Exception from './core/exception'
import { HttpStatus } from './core/type'
import CacheService from './core/cache'
import { encode } from 'msgpack-lite'
import crypto from 'crypto-js'
import seed1Inch from './modules/Swap/seed'

export async function bootstrap() {
	const options: Options = {
		relativeTo: path.dirname(fileURLToPath(import.meta.url)),
	}
	const registerOptions = { once: true }
	try {
		const server = await compose(manifest, options)
		await server.register(plugins, registerOptions)
		server.auth.strategy('jwt', 'jwt', {
			key: AppConfig.jwt?.accessTokenSecret,
			validate: () => {
				return { isValid: true }
			},
			verifyOptions: {
				algorithms: ['HS256'],
			},
		})

		server.ext('onPreResponse', (request, h) => {
			const response: any = request.response
			let responseData = response?.source || null
			let responseStatus = HttpStatus.Success
			let isError = false
			if (response instanceof Exception) {
				responseData = {
					message: response.message,
					statusCode: response.code,
					data: response.data,
				}
				responseStatus = response.code
				isError = true
			} else if (response instanceof Error) {
				responseData = {
					message: response.message,
					statusCode: HttpStatus.Internal,
					data: null,
				}
				responseStatus = HttpStatus.Internal
				isError = true
			}
			if (request?.headers?.['content-type'] === 'application/octet-stream') {
				const encodedResponseSource = encode(crypto.AES.encrypt(JSON.stringify(responseData || null), 'vinny').toString())
				return h.response(encodedResponseSource).encoding('hex').code(responseStatus).type('application/octet-stream').bytes(encodedResponseSource.length)
			} else if (isError) {
				return h.response(responseData).code(responseStatus)
			}
			return h.continue
		})

		const routes = await RouterService.initialize()
		server.route(routes)

		await DatabaseService.connect()
		DatabaseService.syncIndexes()
		DatabaseService.listenEvent()
		server.start().then(async () => {
			console.info(`Server running on ${server.info.uri}`)
			await CacheService.bootstrap()
			await seed1Inch(8217)
		})
	} catch (error) {
		console.error(error)
		process.exit(1)
	}
}

process.on('SIGINT', function () {
	mongoose.connection.close()
	process.exit(1)
})

bootstrap()
