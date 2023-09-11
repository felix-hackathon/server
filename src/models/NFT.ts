import { Model, Document, Schema, model } from 'mongoose'

export interface IAttribute {
	trait_type: string
	value: string | number | boolean | Date
	display_type?: 'string' | 'number' | 'boost_percentage' | 'boost_number' | 'date'
}
export interface INFT {
	owner: string
	nftId: string
	nftAddress: string
	chainId: number
	name: string
	image: string
	attributes: IAttribute[]
	tbaAddress?: string
	type?: string
	txHash?: string
}

export interface INFTDoc extends INFT, Document {}

const schema = new Schema<any, any>(
	{
		owner: { type: String, required: true, lowercase: true, index: true },
		nftId: { type: String, required: true, index: true },
		nftAddress: { type: String, required: true, lowercase: true, index: true },
		chainId: { type: Number, required: true },
		name: { type: String, required: true },
		image: { type: String, required: true },
		tbaAddress: { type: String },
		attributes: {
			type: [
				{
					_id: false,
					trait_type: { type: String, required: true },
					value: {
						type: Schema.Types.Mixed,
						required: true,
					},
					display_type: {
						type: String,
					},
				},
			],
			default: [] as IAttribute[],
		},
		type: { type: String, default: null, required: false },
		txHash: String,
	},
	{ timestamps: true }
)
schema.index({ nftId: 1, nftAddress: 1, chainId: 1 }, { unique: true })
export const NFTModel = model<INFTDoc, Model<INFTDoc>>('nft', schema)

export default NFTModel
