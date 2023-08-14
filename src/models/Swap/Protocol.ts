import { Model, Document, Schema, model } from 'mongoose'

export interface ISwapProtocol {
	name: string
	img: string
	imgColor: string
	chainId: number
}

export interface ISwapProtocolDoc extends ISwapProtocol, Document {}

const schema = new Schema<ISwapProtocol, any>(
	{
		name: { type: String, required: true },
		img: { type: String },
		imgColor: { type: String },
		chainId: { type: Number, required: true },
	},
	{ timestamps: true }
)

export const SwapProtocolModel = model<ISwapProtocolDoc, Model<ISwapProtocolDoc>>('swap-protocol', schema)
export default SwapProtocolModel
