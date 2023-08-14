import config from 'config'
import Joi from 'joi'

export type IConfig = {
	env?: 'production' | 'staging' | 'development' | 'test'
	onlyBinary?: boolean
	port?: number
	documentation?: {
		enable?: boolean
		schemes: 'http' | 'https'
		options: {
			info: {
				title: string
				version: string
			}
			documentationPage: true
		}
	}
	uri1Inch?: string
	apiKey1Inch?: string[]
	jwt?: {
		accessTokenSecret: string
		refreshTokenSecret: string
		accessTokenExpiredIn: string
		refreshTokenExpiredIn: string
	}
	database?: {
		uri: string
	}
	redis?: {
		prefix: string
		host?: string
		port?: number
		password?: string
	}
}

const configObjectSchema = Joi.object<IConfig>({
	env: Joi.string().valid('production', 'staging', 'development', 'test').required(),
	onlyBinary: Joi.boolean().required(),
	port: Joi.number().required(),
	documentation: Joi.object({
		enable: Joi.boolean().required(),
		schemes: Joi.string().valid('http', 'https').required(),
		options: Joi.object({
			info: Joi.object({
				title: Joi.string().required(),
				version: Joi.string().required(),
			}),
			grouping: Joi.string().required(),
			documentationPage: Joi.boolean().required(),
		}),
	}).required(),
	uri1Inch: Joi.string().required(),
	apiKey1Inch: Joi.array().items(Joi.string().required()).required(),
	jwt: Joi.object({
		accessTokenSecret: Joi.string().required(),
		refreshTokenSecret: Joi.string().required(),
		accessTokenExpiredIn: Joi.string().required(),
		refreshTokenExpiredIn: Joi.string().required(),
	}).required(),
	database: Joi.object({
		uri: Joi.string().required(),
	}).required(),
	redis: Joi.object({
		prefix: Joi.string().required(),
		host: Joi.string().allow('').optional(),
		port: Joi.number().optional(),
		password: Joi.string().allow('').optional(),
	}).required(),
})

const AppConfig: IConfig & {
	load: () => IConfig
} = {
	load: () => {
		const { error, value } = configObjectSchema
			.prefs({
				errors: {
					label: 'key',
				},
			})
			.validate(JSON.parse(JSON.stringify(config)))
		if (error) {
			throw new Error(error as any)
		}
		const configValue: any = JSON.parse(JSON.stringify(value))
		Object.keys(configValue).forEach((key) => {
			AppConfig[key] = configValue[key]
		})
		const result = JSON.parse(JSON.stringify({ ...AppConfig, load: undefined }))
		return result
	},
}

AppConfig.load()

export default AppConfig
