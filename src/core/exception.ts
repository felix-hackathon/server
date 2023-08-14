import { HttpStatus } from './type'

export default class Exception extends Error {
	code: HttpStatus = HttpStatus.Internal
	data: any = null
	constructor(code: HttpStatus, message: string, data?: any) {
		super(message)
		this.code = code || HttpStatus.Internal
		this.data = data || null
	}

	static BadRequest(message: string, data: any = undefined) {
		return new Exception(HttpStatus.BadRequest, message, data)
	}

	static NotFound(message: string, data: any = undefined) {
		return new Exception(HttpStatus.NotFound, message, data)
	}

	static Forbidden(message: string, data: any = undefined) {
		return new Exception(HttpStatus.Forbidden, message, data)
	}

	static Unauthorized(message: string, data: any = undefined) {
		return new Exception(HttpStatus.Unauthorized, message, data)
	}

	static Internal(message: string, data: any = undefined) {
		return new Exception(HttpStatus.Internal, message, data)
	}
}
