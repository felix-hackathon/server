import UserModel, { IUserDoc } from 'models/User'
import { SignInPayload } from './type'
import Exception from '@/core/exception'
import jwt from 'jsonwebtoken'
import { ethers } from 'ethers'
import AppConfig from '@/core/configs'
import { generateId } from '@/core/utils'
import Caver from 'caver-js'
import Logger from '@/core/logger'

// expired in 5 minutes
const expiredTime = 300000

export default class AuthService {
	static async getSignNonce(address: string) {
		let user = await UserModel.findOne({ address: address?.toLowerCase() })
		const now = new Date()
		const message = `
		Welcome to FireFly!

		Click to sign in and accept the FireFly Terms of Service and Privacy Policy.

		This request will not trigger a blockchain transaction or cost any gas fees.

		Wallet address:
		${address}

		Nonce:
		${generateId(20)}
		`

		if (user) {
			if (!user.messageCreatedAt || user?.messageCreatedAt?.getTime() + expiredTime <= now.getTime()) {
				user.accessToken = null
				user.refreshToken = null
				user.message = message
				user.messageCreatedAt = now
			} else {
				return {
					message: user.message,
				}
			}
		} else {
			user = new UserModel({
				address: address?.toLowerCase(),
				message,
				messageCreatedAt: now,
				accessToken: null,
				refreshToken: null,
			})
		}
		await user.save()
		return {
			message: user.message,
		}
	}

	static async signIn({ signature, address }: SignInPayload) {
		const now = new Date()
		let user: IUserDoc
		user = await UserModel.findOne({ address: address.toLowerCase() })
		if (!user) {
			throw Exception.NotFound(`User ${address} not found`)
		}
		if (!user.messageCreatedAt || !user.message) {
			throw Exception.BadRequest(`Cannot get sign data`)
		}
		if (user.messageCreatedAt.getTime() + expiredTime <= now.getTime()) {
			throw Exception.BadRequest('Sign data expired')
		}

		const caver = new Caver()
		const recovered = caver.utils.recover(user.message, caver.utils.decodeSignature(signature))

		if (recovered.toLowerCase() !== user.address) {
			Logger.error(`Recover address ${recovered} || Expected: ${user.address}`)
			throw Exception.BadRequest('Signature invalid')
		}

		user.message = null
		user.messageCreatedAt = null
		user.accessToken = this.createAccessToken(user)
		user.refreshToken = this.createRefreshToken(user)
		await user.save()

		return {
			address: user.address,
			avatar: user.avatar,
			name: user.name,
			email: user.email,
			accessToken: user.accessToken,
			refreshToken: user.refreshToken,
		}
	}

	static async refreshToken(refreshToken: string) {
		const decodeToken: any = this.decodeRefreshToken(refreshToken)
		const userAddress = decodeToken?.address?.toLowerCase()
		const accessToken = decodeToken?.accessToken
		if (!userAddress || !accessToken || !ethers.isAddress(userAddress)) {
			throw Exception.Forbidden('Refresh token invalid')
		}

		const user = await UserModel.findOne({ address: userAddress })
		if (!user) {
			throw Exception.NotFound('User not found')
		}

		if (user.refreshToken !== refreshToken) {
			throw Exception.Forbidden('Refresh token mismatch')
		}
		if (user.accessToken !== accessToken) {
			throw Exception.Forbidden('Access token mismatch')
		}

		user.accessToken = this.createAccessToken(user)
		user.refreshToken = this.createRefreshToken(user)
		await user.save()

		return {
			address: user.address,
			avatar: user.avatar,
			name: user.name,
			email: user.email,
			accessToken: user.accessToken,
			refreshToken: user.refreshToken,
		}
	}

	static createAccessToken(user: IUserDoc) {
		return jwt.sign(
			{
				address: user.address,
			},
			AppConfig.jwt.accessTokenSecret,
			{
				algorithm: 'HS256',
				expiresIn: AppConfig.jwt.accessTokenExpiredIn,
			}
		)
	}

	static createRefreshToken(user: IUserDoc) {
		return jwt.sign(
			{
				address: user.address,
				accessToken: user.accessToken,
			},
			AppConfig.jwt.refreshTokenSecret,
			{
				algorithm: 'HS256',
				expiresIn: AppConfig.jwt.refreshTokenExpiredIn,
			}
		)
	}

	static decodeAccessToken = (token: string) => {
		try {
			const decoded = jwt.verify(token, AppConfig.jwt.accessTokenSecret)
			return decoded
		} catch (error) {
			return null
		}
	}

	static decodeRefreshToken = (token: string) => {
		try {
			const decoded = jwt.verify(token, AppConfig.jwt.refreshTokenSecret)
			return decoded
		} catch (error) {
			return null
		}
	}
}
