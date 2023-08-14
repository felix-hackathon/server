import { JoiSchema } from 'joi-class-decorators'
import Joi from '../joi'

export enum HttpStatus {
	Success = 200,
	BadRequest = 400,
	Unauthorized = 401,
	Forbidden = 403,
	NotFound = 404,
	Internal = 500,
}

export class Pagination {
	@JoiSchema(Joi.number().default(50).optional())
	limit: number
	@JoiSchema(Joi.number().default(1).optional())
	page: number
}

export class GetDetailParam {
	@JoiSchema(Joi.objectId().required())
	id: string
}
export class UpdateParam {
	@JoiSchema(Joi.objectId().required())
	id: string
}

export type ListResponse<T> = Promise<{
	items: T[]
	total: number
	page: number
	limit: number
	totalPages: number
}>
