import { Model, Document, Schema, model } from 'mongoose'

export interface IUser {
	address: string
	name?: string
	email?: string
	avatar?: string
	message?: string | null
	messageCreatedAt?: Date | null
	lastActiveAt: Date
	accessToken?: string
	refreshToken?: string
}

export interface IUserDoc extends IUser, Document {}

const schema = new Schema<any, any>(
	{
		address: { type: String, required: true, unique: true, lowercase: true },
		name: { type: String, required: false, index: true },
		email: { type: String, required: false, unique: true, sparse: true, lowercase: true },
		avatar: { type: String, required: false },
		message: { type: String, required: false, default: null },
		messageCreatedAt: { type: Date, required: false, default: null },
		accessToken: { type: String },
		refreshToken: { type: String },
		lastActiveAt: { type: Date, required: false, default: null },
	},
	{ timestamps: true }
)

export const UserModel = model<IUserDoc, Model<IUserDoc>>('user', schema)

export default UserModel
