import mongoose, { Model } from 'mongoose'
import AppConfig from '../configs'
import models from '@/models/index'

export const MongoEvent = {
	Timeout: 'timeout',
	Error: 'error',
	Reconnected: 'reconnected',
}

export const DbLogMessage = {
	ReconnectSuccess: 'Reconnect MongoDB success !!!',
	ReconnectFailed: 'Reconnect MongoDB success !!!',
	ConnectFailed: 'Could not connect to MongoDB !!!',
	ConnectSuccess: 'Connect MongoDB success !!!',
	Timeout: 'db: mongodb timeout',
}

export default class DatabaseService {
	static async connect() {
		try {
			await mongoose.connect(AppConfig.database!.uri)
			console.log(DbLogMessage.ConnectSuccess)
		} catch (error) {
			console.error(DbLogMessage.ConnectFailed)
			console.error(error)
			throw error
		}
	}

	static async reconnect() {
		try {
			await mongoose.connect(AppConfig.database!.uri)
			console.log(DbLogMessage.ReconnectSuccess)
		} catch (error) {
			console.error(DbLogMessage.ReconnectFailed)
			throw error
		}
	}

	static listenEvent() {
		mongoose.connection.on(MongoEvent.Timeout, async function (e) {
			try {
				console.error(DbLogMessage.Timeout, e)
				// reconnect here
				await mongoose.disconnect()
				await DatabaseService.reconnect()
			} catch (error) {
				console.log(error)
			}
		})
		mongoose.connection.on(MongoEvent.Error, async function (e) {
			try {
				console.error(DbLogMessage.ConnectFailed, e)
				// reconnect here
				await mongoose.disconnect()
				await DatabaseService.reconnect()
			} catch (error) {
				console.log(error)
			}
		})
		mongoose.connection.on(MongoEvent.Reconnected, async function () {
			console.error(DbLogMessage.ReconnectSuccess)
		})
	}
	static async syncIndexes() {
		const listModels = Object.values(models)
		for (let i = 0; i < listModels.length; i++) {
			try {
				const model = listModels[i]
				await (model as any).syncIndexes()
			} catch (error) {
				console.log(error)
			}
		}
	}
}
