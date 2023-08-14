import { Model, Document, Schema, model } from 'mongoose'

export interface ISwapToken {
	address: string
	chainId: number
	name: string
	symbol: string
	decimals: number
	tags: string[]
	icon: string | null
}

export interface ISwapTokenDoc extends ISwapToken, Document {}

const schema = new Schema<ISwapToken, any>(
	{
		address: { type: String, lowercase: true, required: true },
		chainId: { type: Number, required: true },
		name: { type: String, required: true },
		symbol: { type: String, required: true },
		decimals: { type: Number, required: true },
		icon: { type: String, default: null },
		tags: { type: [String], default: [] },
	},
	{ timestamps: true }
)
schema.index(
	{
		address: 1,
		chainId: 1,
	},
	{
		unique: true,
	}
)
export const SwapTokenModel = model<ISwapTokenDoc, Model<ISwapTokenDoc>>('swap-tokens', schema)
export default SwapTokenModel
