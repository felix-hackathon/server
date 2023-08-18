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

		// test start
		function coverInitialTxValue(tx) {
			if (typeof tx !== 'object') throw new Error('Invalid transaction')
			if (!tx.senderRawTransaction && (!tx.type || tx.type === 'LEGACY' || tx.type.includes('SMART_CONTRACT_DEPLOY'))) {
				tx.to = tx.to || '0x'
				tx.data = caver.utils.addHexPrefix(tx.data || '0x')
			}
			tx.chainId = caver.utils.numberToHex(tx.chainId)
			return tx
		}

		const transaction = coverInitialTxValue({
			from: '0xc95c0ec40937ad81f34c8b0836680b7681b7bf60',
			to: '0x234234111254eeb25477b68fb85ed929f73a960582',
			value: '0xde0b6b3a7640000',
			data: '0x12aa3caf000000000000000000000000b553654e5d94cd4e3b451248a8c941ebff5327ac000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000ff3e7cf0c007f919807b32b30a4a9e7bd7bc4121000000000000000000000000b553654e5d94cd4e3b451248a8c941ebff5327ac000000000000000000000000c95c0ec40937ad81f34c8b0836680b7681b7bf600000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000c7d713b49da00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006600000000000000000000000000000000000000000000000000004800001a4060ff3e7cf0c007f919807b32b30a4a9e7bd7bc4121d0e30db080a06c4eca27ff3e7cf0c007f919807b32b30a4a9e7bd7bc41211111111254eeb25477b68fb85ed929f73a96058200000000000000000000000000000000000000000000000000008b1ccac8',
			gas: '0x2a432',
			type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
			chainId: 8217,
			gasPrice: '0xba43b7400',
			nonce: '0x15',
		})
		const rlpEncoded = caver.klay.accounts.encodeRLPByTxType(transaction)

		const messageHash = ethers.keccak256(rlpEncoded)

		const recovered2 = caver.utils.recover(
			messageHash,
			caver.utils.decodeSignature(
				ethers.Signature.from({
					v: '0x4056',
					r: '0x36ab61de7301a053bc394716bedf942a9292f67ddef2fda5dd82d0a2ed2afb64',
					s: '0x4bbc0df6f238c5bac4463c9a172378b8c8e6910e77d04edb92e1ef698235db06',
				}).serialized
			),
			true
		)
		console.log('recovered2', recovered2)

		// test end

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
