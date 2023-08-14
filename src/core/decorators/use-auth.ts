import AuthService from '@/modules/Auth/service'
import { ethers } from 'ethers'
import Exception from '../exception'
import UserModel from '@/models/User'
import { MetadataKeys } from './constant'
import { destructuringDecoratorFactory } from '.'

export const authMethod = async (req: any, { optional = false }: { optional: boolean }) => {
	const token = req?.headers?.authorization?.split(' ')?.[1]
	if (!token) {
		if (optional) {
			return null
		} else {
			throw Exception.BadRequest('Unauthorized: Token is required')
		}
	}
	const decodeToken: any = AuthService.decodeAccessToken(token)
	const userAddress = decodeToken?.address?.toLowerCase()
	if (!userAddress || !ethers.isAddress(userAddress)) {
		if (optional) {
			return null
		} else {
			throw Exception.Unauthorized('Unauthorized: Token invalid')
		}
	}
	const user = await UserModel.findOne({ address: userAddress, accessToken: token })
	if (!user) {
		if (optional) {
			return null
		} else {
			throw Exception.Unauthorized('Unauthorized: User not found')
		}
	}

	user.lastActiveAt = new Date()
	await user.save()
	return user
}

export const UseAuthGuard = (): MethodDecorator => {
	return (target, propertyKey) => {
		const functionTarget = target[propertyKey]
		const middleware: any[] = Reflect.hasMetadata(MetadataKeys.Middleware, functionTarget) ? Reflect.getMetadata(MetadataKeys.Middleware, functionTarget) : []
		middleware.push({
			assign: 'user',
			execution: authMethod,
			params: {
				optional: false,
			},
		})
		Reflect.defineMetadata(MetadataKeys.Middleware, middleware, functionTarget)
	}
}

export const UseAuthOption = (): MethodDecorator => {
	return (target, propertyKey) => {
		const functionTarget = target[propertyKey]
		const middleware: any[] = Reflect.hasMetadata(MetadataKeys.Middleware, functionTarget) ? Reflect.getMetadata(MetadataKeys.Middleware, functionTarget) : []
		middleware.push({
			assign: 'user',
			execution: authMethod,
			params: {
				optional: true,
			},
		})
		Reflect.defineMetadata(MetadataKeys.Middleware, middleware, functionTarget)
	}
}
export const User = destructuringDecoratorFactory('pre', 'user')
