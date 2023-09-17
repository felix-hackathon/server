import { Model, Document, Schema, model } from 'mongoose'

export enum RequestNFTType {
	Market = 'market',
	Auction = 'auction',
	Offer = 'offer',
}

export enum RequestNFTStatus {
	Init = 'init',
	Cancel = 'cancel',
	Done = 'done',
}

export interface IRequestNFT {
	nftAddress: string
	nftId: string
	chainId: number
	type: RequestNFTType
	status: RequestNFTStatus
	sellerAddress: string
	buyerAddress: string
	signatureBuyer: string
	signatureSeller: string
	price: number
	priceWei: string
	txHash: string
}

export interface IRequestNFTDoc extends IRequestNFT, Document {}

const schema = new Schema<any, any>(
	{
		nftId: { type: String, required: true, index: true },
		nftAddress: { type: String, required: true, lowercase: true, index: true },
		sellerAddress: { type: String, lowercase: true },
		buyerAddress: { type: String, lowercase: true },
		chainId: { type: Number, required: true },
		type: { type: String, enum: RequestNFTType },
		status: { type: String, enum: RequestNFTStatus },
		price: { type: Number },
		priceWei: { type: String },
		signatureBuyer: { type: String },
		signatureSeller: { type: String },
		txHash: { type: String },
	},
	{ timestamps: true }
)

export const RequestNFTModel = model<IRequestNFTDoc, Model<IRequestNFT>>('request-nft', schema)

export default RequestNFTModel
