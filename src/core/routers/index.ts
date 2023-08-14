import path from 'path'
import { getAllFileInModules } from './utils'
import { fileURLToPath } from 'url'
import { MetadataKeys } from '../decorators/constant'
import { existsSync } from 'fs'
import { trimslash } from '../utils'
import Exception from '../exception'
import { HttpStatus } from '../type'
import Joi from 'joi'
import { getClassSchema } from 'joi-class-decorators'
import { IRouter } from '../decorators/type'
import { decode } from 'msgpack-lite'
import crypto from 'crypto-js'
import AppConfig from '../configs'

export default class AppRouterInit {
	static async initialize() {
		const result: any[] = [
			{
				method: 'GET',
				path: '/favicon.ico',
				handler: function (_, h) {
					return h.file('favicon.ico')
				},
			},
		]
		const files = getAllFileInModules()
		for (let i = 0; i < files.length; i++) {
			if (existsSync(files[i])) {
				const fileInstance = (await import(files[i])).default
				if (fileInstance) {
					if (Reflect.hasMetadata(MetadataKeys.IsController, fileInstance)) {
						const controllerInstance: any = new fileInstance() as any
						const apiTag: string = Reflect.getMetadata(MetadataKeys.ApiTag, fileInstance) || 'Default'
						const basePath: string = Reflect.getMetadata(MetadataKeys.BasePath, fileInstance) || '/'
						const routers: IRouter[] = Reflect.getMetadata(MetadataKeys.Routers, fileInstance) || []
						for (let routerIndex = 0; routerIndex < routers.length; routerIndex++) {
							const route = routers[routerIndex]

							const hasQuery = Reflect.hasMetadata(MetadataKeys.ValidationQuery, controllerInstance[route.handlerName])
							const hasParams = Reflect.hasMetadata(MetadataKeys.ValidationParams, controllerInstance[route.handlerName])
							const hasPayload = Reflect.hasMetadata(MetadataKeys.ValidationPayload, controllerInstance[route.handlerName])
							const optional = Reflect.hasMetadata(MetadataKeys.Optional, controllerInstance[route.handlerName])
							const binaryOptional = Reflect.hasMetadata(MetadataKeys.BinaryOptional, controllerInstance[route.handlerName])
							const hasMiddleware = Reflect.hasMetadata(MetadataKeys.Middleware, controllerInstance[route.handlerName])

							const routeData: any = {
								method: route.method,
								path: trimslash(trimslash(basePath) + route.path),
								config: {
									...(route.routeConfig || {}),
									description: route.description,
									tags: ['api', apiTag],
									pre: [],
									validate: {},
									handler: async (req: any) => {
										const paramDestructuring: any[] = []
										let payload = req?.payload || {}
										if (hasPayload || req?.payload) {
											const validatePayload = Reflect.getMetadata(MetadataKeys.ValidationPayload, controllerInstance[route.handlerName])
											if (req?.headers?.['content-type'] === 'application/octet-stream') {
												if (validatePayload) {
													const { error, value } = getClassSchema(validatePayload)
														.prefs({
															errors: {
																label: 'key',
															},
														})
														.validate(JSON.parse(crypto.AES.decrypt(decode(req?.payload), 'vinny').toString(crypto.enc.Utf8)))
													payload = value
													if (error) {
														throw Exception.BadRequest(error.message)
													}
												} else {
													payload = JSON.parse(crypto.AES.decrypt(decode(req?.payload), 'vinny').toString(crypto.enc.Utf8))
												}
											}
										}
										if (Reflect.hasMetadata(MetadataKeys.DestructuringParameter, controllerInstance[route.handlerName])) {
											const array = Reflect.getMetadata(MetadataKeys.DestructuringParameter, controllerInstance[route.handlerName])
											for (let i = 0; i < array.length; i++) {
												const param = array.find((ele: any) => ele.index === i)
												if (param?.name === 'default') {
													paramDestructuring.push(param?.field ? req?.[param?.field] : req)
												} else if (param?.name === 'pre') {
													paramDestructuring.push(param?.field ? req?.[param?.name]?.[param.preField]?.[param?.field] : req?.[param?.name]?.[param?.preField])
												} else if (param?.name === 'payload') {
													paramDestructuring.push(param?.field ? payload[param?.field] : payload)
												} else {
													paramDestructuring.push(param?.field ? req?.[param?.name]?.[param?.field] : req?.[param?.name])
												}
											}
										}
										const result = await controllerInstance[route.handlerName](...paramDestructuring)
										if (req.headers?.['from-vinny-with-love']) {
											return {
												statusCode: HttpStatus.Success,
												data: result,
												message: 'Success',
											}
										}
										return result
									},
								},
							}

							if (hasQuery) {
								const validateQuery = Reflect.getMetadata(MetadataKeys.ValidationQuery, controllerInstance[route.handlerName])
								routeData.config.validate.query = getClassSchema(validateQuery)
							}
							if (hasParams) {
								const validateParams = Reflect.getMetadata(MetadataKeys.ValidationParams, controllerInstance[route.handlerName])
								routeData.config.validate.params = getClassSchema(validateParams)
							}
							if (hasPayload) {
								const validatePayload = Reflect.getMetadata(MetadataKeys.ValidationPayload, controllerInstance[route.handlerName])
								// let validate = getClassSchema(validatePayload)
								if (binaryOptional || !AppConfig.onlyBinary) {
									if (optional) {
										routeData.config.validate.payload = Joi.alternatives([getClassSchema(validatePayload), Joi.binary()]).optional()
									} else {
										routeData.config.validate.payload = Joi.alternatives([getClassSchema(validatePayload), Joi.binary()]).required()
									}
								} else {
									if (optional) {
										routeData.config.validate.payload = Joi.binary().optional()
									} else {
										routeData.config.validate.payload = Joi.binary().required()
									}
								}
							}
							if (hasMiddleware) {
								const middleware = Reflect.getMetadata(MetadataKeys.Middleware, controllerInstance[route.handlerName])
								const pre = []
								for (let i = 0; i < middleware.length; i++) {
									pre.push({
										method: async (req) => {
											return middleware[i].execution(req, middleware[i].params)
										},
										assign: middleware[i].assign,
									})
								}
								routeData.config.pre = pre
							}
							result.push(routeData)
						}
					}
				}
			}
		}
		return result
	}
}
