import 'reflect-metadata'
import DatabaseService from './core/database'
import mongoose from 'mongoose'
import NFTService from './modules/NFT/service'
export async function bootstrap() {
	await DatabaseService.connect()
	await NFTService.processLogByHash(1001, '0x57c004ee31ea0fc8d63c08d13a3399e2293fa176cee8d58249954c58cc2922c1')
}

process.on('SIGINT', function () {
	mongoose.connection.close()
	process.exit(1)
})

bootstrap()
