import UserModel, { IUserDoc } from 'models/User'
import { SiweMessage, generateNonce } from 'siwe'
import { SignInPayload } from './type'
import Exception from '@/core/exception'
import jwt from 'jsonwebtoken'
import { ethers } from 'ethers'
import AppConfig from '@/core/configs'

// expired in 5 minutes
const expiredTime = 300000

export default class AuthService {
	static async getSignNonce(address: string) {
		let user = await UserModel.findOne({ address: address?.toLowerCase() })
		const now = new Date()
		const nonceSign = generateNonce()

		if (user) {
			if (!user.nonceSignCreatedAt || user?.nonceSignCreatedAt?.getTime() + expiredTime <= now.getTime()) {
				user.accessToken = null
				user.refreshToken = null
				user.nonceSign = nonceSign
				user.nonceSignCreatedAt = now
			} else {
				return {
					nonce: user.nonceSign,
					createdAt: user.nonceSignCreatedAt,
				}
			}
		} else {
			user = new UserModel({
				address: address?.toLowerCase(),
				nonceSign,
				nonceSignCreatedAt: now,
				accessToken: null,
				refreshToken: null,
			})
		}
		await user.save()
		return {
			nonce: user.nonceSign,
			createdAt: user.nonceSignCreatedAt,
		}
	}

	static async signIn({ signature, message }: SignInPayload, affiliate: boolean = false) {
		const now = new Date()
		let user: IUserDoc
		const siweMessage = new SiweMessage(message)
		user = await UserModel.findOne({ address: siweMessage.address.toLowerCase() })

		if (!user) {
			throw Exception.NotFound(`User ${message} not found`)
		}
		if (!user.nonceSignCreatedAt || !user.nonceSign) {
			throw Exception.BadRequest(`Cannot get sign data`)
		}
		if (user.nonceSignCreatedAt.getTime() + expiredTime <= now.getTime()) {
			throw Exception.BadRequest('Sign data expired')
		}

		const valid = await siweMessage
			.verify({
				signature,
			})
			.then(() => true)
			.catch(() => false)
		if (!valid) {
			throw Exception.BadRequest('Signature invalid')
		}

		user.nonceSign = null
		user.nonceSignCreatedAt = null
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
