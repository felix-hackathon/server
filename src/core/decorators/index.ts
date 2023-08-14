import { MetadataKeys } from './constant'
import { BinaryOptional, IRouter, Methods, Optional } from './type'

export const methodDecoratorFactory = (method: Methods) => {
	return (path: string = '/', description: string = 'Api description', routeConfig: object = {}): MethodDecorator => {
		return (target, propertyKey) => {
			const controllerClass = target.constructor
			const routers: IRouter[] = Reflect.hasMetadata(MetadataKeys.Routers, controllerClass) ? Reflect.getMetadata(MetadataKeys.Routers, controllerClass) : []
			routers.push({
				method,
				path,
				handlerName: propertyKey,
				description,
				routeConfig,
			})
			Reflect.defineMetadata(MetadataKeys.Routers, routers, controllerClass)
		}
	}
}

export const destructuringDecoratorFactory = (name: 'query' | 'params' | 'payload' | 'pre' | 'default', preField?: string) => {
	return (field: string | null = null): ParameterDecorator => {
		return (target: any, propertyKey: any, parameterIndex: number) => {
			const parameter = Reflect.hasMetadata(MetadataKeys.DestructuringParameter, target[propertyKey])
				? Reflect.getMetadata(MetadataKeys.DestructuringParameter, target[propertyKey])
				: []
			parameter.push({
				name,
				field,
				index: parameterIndex,
				preField,
			})
			Reflect.defineMetadata(MetadataKeys.DestructuringParameter, parameter, target[propertyKey])
		}
	}
}

export const Get = methodDecoratorFactory(Methods.GET)

export const Post = methodDecoratorFactory(Methods.POST)

export const Put = methodDecoratorFactory(Methods.PUT)

export const Delete = methodDecoratorFactory(Methods.DELETE)

export const Patch = methodDecoratorFactory(Methods.PATCH)

export const Query = destructuringDecoratorFactory('query')
export const Params = destructuringDecoratorFactory('params')
export const Payload = destructuringDecoratorFactory('payload')
export const Request = destructuringDecoratorFactory('default')

export const Controller = (basePath: string = '/', apiTag = 'App'): ClassDecorator => {
	return (target: any) => {
		if (!Reflect.hasMetadata(MetadataKeys.BasePath, target)) {
			Reflect.defineMetadata(MetadataKeys.BasePath, basePath, target)
		}
		if (!Reflect.hasMetadata(MetadataKeys.ApiTag, target)) {
			Reflect.defineMetadata(MetadataKeys.ApiTag, apiTag, target)
		}
		if (!Reflect.hasMetadata(MetadataKeys.IsController, target)) {
			Reflect.defineMetadata(MetadataKeys.IsController, true, target)
		}
	}
}

export const Validation = (object: { query?: Object; params?: Object; payload?: Object }): MethodDecorator => {
	return (target: any, propertyKey) => {
		const targetFunction = target[propertyKey]
		if (object.query) {
			Reflect.defineMetadata(MetadataKeys.ValidationQuery, object.query, targetFunction)
		}
		if (object.params) {
			Reflect.defineMetadata(MetadataKeys.ValidationParams, object.params, targetFunction)
		}
		if (object.payload) {
			Reflect.defineMetadata(MetadataKeys.ValidationPayload, object.payload, targetFunction)
		}
	}
}

export const QueryValidation = (object: Object, options: Optional & BinaryOptional = { binaryOptional: false }): MethodDecorator => {
	return (target: any, propertyKey) => {
		const targetFunction = target[propertyKey]
		Reflect.defineMetadata(MetadataKeys.ValidationQuery, object, targetFunction)
		if (options?.binaryOptional) {
			Reflect.defineMetadata(MetadataKeys.BinaryOptional, true, targetFunction)
		}
	}
}
export const ParamsValidation = (object: Object, options: BinaryOptional = { binaryOptional: false }): MethodDecorator => {
	return (target: any, propertyKey) => {
		const targetFunction = target[propertyKey]
		Reflect.defineMetadata(MetadataKeys.ValidationParams, object, targetFunction)
		if (options?.binaryOptional) {
			Reflect.defineMetadata(MetadataKeys.BinaryOptional, true, targetFunction)
		}
	}
}

export const PayloadValidation = (object: Object, options: Optional & BinaryOptional = { optional: false, binaryOptional: false }): MethodDecorator => {
	return (target: any, propertyKey) => {
		const targetFunction = target[propertyKey]
		Reflect.defineMetadata(MetadataKeys.ValidationPayload, object, targetFunction)
		if (options?.optional) {
			Reflect.defineMetadata(MetadataKeys.Optional, true, targetFunction)
		}
		if (options.binaryOptional) {
			Reflect.defineMetadata(MetadataKeys.BinaryOptional, true, targetFunction)
		}
	}
}
