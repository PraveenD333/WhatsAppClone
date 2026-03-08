import { model, Schema } from "mongoose";

const conversationSchema = new Schema({
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    unreadCount: { type: Number, default: 0 } 
    
}, { timestamps: true });

const ConversationModel = model('Conversation', conversationSchema)

export default ConversationModel;