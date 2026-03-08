import { model, Schema } from "mongoose";

const messageSchema = new Schema({
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    content: { type: String },
    contentType: { type: String, enum: ["text", "image", "video"] },
    imageOrVideoUrl: { type: String },
    reactions: [{ user: { type: Schema.Types.ObjectId, ref: 'User' }, emoji: String }],
    messageStatus: { type: String, default: 'send' }

}, { timestamps: true })


const MessageModel = model('Message', messageSchema);

export default MessageModel;