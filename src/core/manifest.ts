import AppConfig from './configs'
import path from 'path'
import { fileURLToPath } from 'url'

const manifest = {
	server: {
		router: {
			isCaseSensitive: false,
			stripTrailingSlash: true,
		},
		port: AppConfig.port,
		routes: {
			cors: {
				// origin: ['*'],
				// headers: ['Accept', 'Content-Type'],
				additionalHeaders: ['from-vinny-with-love'],
			},
			files: {
				relativeTo: path.join(path.dirname(fileURLToPath(import.meta.url)), '../../public'),
			},
			// validate: {
			// 	failAction: async (_request: any, _h: any, err: any) => {
			// 		console.error('Catch in failAction hook', err)
			// 		if (process.env.NODE_ENV === 'production') {
			// 			throw Boom.badRequest('Invalid request payload input')
			// 		} else {
			// 			throw err
			// 		}
			// 	},
			// },
		},
	},
}

export default manifest
