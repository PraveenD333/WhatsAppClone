import { model, Schema } from "mongoose";

const statusSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    contentType: { type: String, enum: ['text', 'image', 'video'], default: 'text' },
    viewers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    expiresAt: { type: Date, required: true },

}, { timestamps: true })

const StatusModel = model('Status', statusSchema)

export default StatusModel;