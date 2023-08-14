import { Model, Document, Schema, model } from 'mongoose'

interface INativeCurrency {
	name: string
	symbol: string
	decimals: number
}

export interface IChain {
	name: string
	rpc: string[]
	logo: string
	nativeCurrency: INativeCurrency
	chainId: number
	explorer: string
}

export interface IChainDoc extends IChain, Document {}

const nativeCurrencySchema = new Schema<INativeCurrency, any>({
	decimals: { type: Number, required: true },
	name: { type: String, required: true },
	symbol: { type: String, required: true },
})

const schema = new Schema<IChain, any>(
	{
		name: { type: String, required: true },
		chainId: { type: Number, required: true, unique: true },
		logo: { type: String, required: true },
		nativeCurrency: { type: nativeCurrencySchema, required: true },
		explorer: { type: String, required: true },
		rpc: { type: [String], required: true },
	},
	{ timestamps: true }
)

export const ChainModel = model<IChainDoc, Model<IChainDoc>>('chain', schema)

export default ChainModel
