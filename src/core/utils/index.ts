import fs from 'fs'
import Path from 'path'
import { Pagination } from '../type'
import { type } from 'os'
import Exception from '../exception'
import { RPCs, SUPPORTED_CHAIN_ID } from '@dapp-builder/rpcs'
import AppConfig from '../configs'
export const getAllFileInDirectory = (path: string) => {
	let result: string[] = []
	fs.readdirSync(path).forEach((file) => {
		const filePath = Path.join(path, file)
		if (fs.statSync(filePath).isDirectory()) {
			result = [...result, ...getAllFileInDirectory(filePath)]
		} else {
			result.push(filePath)
		}
	})
	return result
}

export function trimslash(s: string) {
	return s[s.length - 1] === '/' ? s.slice(0, s.length - 1) : s
}

export const getPagination = (query: Pagination, defaultLimit = 50) => {
	const page = query.page || 1
	const limit = query.limit || defaultLimit
	const skip = (page - 1) * limit
	delete query.page
	delete query.limit
	return {
		page,
		skip,
		limit,
	}
}

export const getCurrent = () => {
	return Math.round(Date.now() / 1000)
}

export const sleep = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function generateId(len: number, charSet?: string) {
	charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	var randomString = ''
	for (var i = 0; i < len; i++) {
		var randomPoz = Math.floor(Math.random() * charSet.length)
		randomString += charSet.substring(randomPoz, randomPoz + 1)
	}
	return randomString
}

export const promiseAll = async (promise: any[]) => {
	return (await Promise.allSettled(promise)).map((i: any) => i?.value || null)
}
