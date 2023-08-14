export enum Methods {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	PATCH = 'PATCH',
	DELETE = 'DELETE',
}

export interface IRouter {
	method: Methods
	path: string
	description?: string
	handlerName: string | symbol
	routeConfig?: object
}

export type Optional = {
	optional?: boolean
}

export type BinaryOptional = {
	binaryOptional?: boolean
}
