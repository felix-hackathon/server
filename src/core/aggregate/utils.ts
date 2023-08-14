import { PipelineStage } from 'mongoose'
import Exception from '../exception'

export interface IQuery {
	field: string
	value: any | any[]
	exact?: boolean
}

export enum QueryType {
	And = 'and',
	Or = 'or',
}

export interface IJoinModel {
	externalCollection: string
	fields: {
		external: string
		internal: string
	}[]
	alias: string
	pipelineLookup?: PipelineStage[]
}

class AggregateUtils {
	static filter(queries: IQuery[], type: QueryType = QueryType.And): PipelineStage {
		const filter = queries.map((query) => {
			if (query.exact === false) {
				if (Array.isArray(query.value)) {
					throw Exception.BadRequest('Invalid query filter')
				}
				return {
					[query.field]: { $regex: query.value, $options: 'i' },
				}
			} else {
				if (Array.isArray(query.value)) {
					return {
						[query.field]: { $in: query.value },
					}
				}
				return {
					[query.field]: query.value,
				}
			}
		})
		if (type === QueryType.Or) {
			return {
				$match: {
					$or: filter,
				},
			}
		} else if (type === QueryType.And) {
			return {
				$match: {
					$and: filter,
				},
			}
		}
	}

	static searchKeyRegex(searchValue: string, fields: string[]): PipelineStage {
		const or = fields.map((field) => {
			return {
				[field]: {
					$regex: searchValue,
					$options: 'i',
				},
			}
		})
		return {
			$match: {
				$or: or,
			},
		}
	}

	static joinModel(query: IJoinModel): PipelineStage {
		const { alias, externalCollection, fields, pipelineLookup = [] } = query
		const isObjectId = fields.length === 1 && fields[0].external === '_id'
		if (isObjectId) {
			const { external, internal } = fields[0]
			return {
				$lookup: {
					from: externalCollection,
					localField: internal,
					foreignField: external,
					as: alias,
				},
			}
		} else {
			const letObj = {}
			const and = []
			fields.forEach((field) => {
				const { external, internal } = field
				letObj[external] = `$${external}`
				and.push({
					$eq: [`$${internal}`, `$$${external}`],
				})
			})
			return {
				$lookup: {
					from: externalCollection,
					let: letObj,
					pipeline: [
						{
							$match: {
								$expr: {
									$and: and,
								},
							},
						},
						...(pipelineLookup as any[]),
					],
					as: alias,
				},
			}
		}
	}

	static unwindLookup(alias: string): PipelineStage {
		return {
			$unwind: {
				path: `$${alias}`,
				preserveNullAndEmptyArrays: true,
			},
		}
	}

	static sort(sorts: { by: string; direction: ('asc' | 'desc') | number }[]) {
		const sort = {}
		sorts.forEach((item) => {
			const direction = typeof item.direction === 'number' ? item.direction : item.direction === 'asc' ? 1 : -1
			sort[item.by] = direction
		})
		return {
			$sort: sort,
		}
	}
}

export default AggregateUtils
