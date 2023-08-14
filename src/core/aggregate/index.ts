import { Model, PipelineStage } from 'mongoose'
import AggregateUtils, { IJoinModel, IQuery, QueryType } from './utils'

export default class AggregateFind<T = any> {
	model: Model<T>
	pipelineStages: PipelineStage[]
	constructor(_model: any) {
		this.model = _model
		this.pipelineStages = []
	}

	addPipelineState(pipelineStage: PipelineStage) {
		this.pipelineStages.push(pipelineStage)
	}

	filter(queries: IQuery[], type: QueryType = QueryType.And) {
		this.addPipelineState(AggregateUtils.filter(queries, type))
	}

	searchKeyRegex(searchValue: string, fields: string[]) {
		this.addPipelineState(AggregateUtils.searchKeyRegex(searchValue, fields))
	}

	joinModel(query: IJoinModel) {
		this.addPipelineState(AggregateUtils.joinModel(query))
	}

	unwindLookup(alias: string) {
		this.addPipelineState(AggregateUtils.unwindLookup(alias))
	}

	sort(sorts: { by: string; direction: ('asc' | 'desc') | number }[]) {
		this.addPipelineState(AggregateUtils.sort(sorts))
	}

	async exec(skip = 0, limit = 50) {
		const data = await this.model.aggregate([
			...this.pipelineStages,
			{
				$skip: Number(skip),
			},
			...(Number(limit) > 0
				? [
						{
							$limit: Number(limit),
						},
				  ]
				: []),
		])
		const total =
			(
				await this.model.aggregate([
					...this.pipelineStages,
					{
						$count: 'total',
					},
				])
			)?.[0]?.total || 0
		return { data, total }
	}

	async execWithoutCount(skip = 0, limit = 50) {
		const data = await this.model.aggregate([
			...this.pipelineStages,
			{
				$skip: Number(skip),
			},
			...(Number(limit) > 0
				? [
						{
							$limit: Number(limit),
						},
				  ]
				: []),
		])

		return { data }
	}
}
