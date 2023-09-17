import 'reflect-metadata'
import DatabaseService from './core/database'
import mongoose from 'mongoose'
export async function bootstrap() {
	await DatabaseService.connect()
}

process.on('SIGINT', function () {
	mongoose.connection.close()
	process.exit(1)
})

bootstrap()
