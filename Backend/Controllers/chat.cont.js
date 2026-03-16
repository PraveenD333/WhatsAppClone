import { uploadFileToCloudinary } from "../Database/cloudinaryConfig.js";
import ConversationModel from "../Models/conversation.model.js";
import MessageModel from "../Models/message.model.js";
import { errorresponse, successresponse } from "../Utils/response.js";


export const sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, content, messageStatus } = req.body;
        const file = req.file;

        const participants = [senderId, receiverId].sort();

        //check if the Conversation alredy exit's
        let conversation = await ConversationModel.findOne({
            participants: participants
        });

        if (!conversation) {
            conversation = new ConversationModel({ participants });
            await conversation.save();
        }

        let imageOrVideoUrl = null;
        let contentType = null;

        //Handel file Upload
        if (file) {
            const uploadFile = await uploadFileToCloudinary(file);

            if (!uploadFile?.secure_url) {
                return errorresponse(res, "Internal Server Error", 500);
            }
            imageOrVideoUrl = uploadFile?.secure_url;

            if (file.mimetype.startsWith('image')) {
                contentType = 'image';
            } else if (file.mimetype.startsWith('video')) {
                contentType = 'video';
            } else {
                return errorresponse(res, "Invalid file type", 400);
            }
        } else if (content?.trim()) {
            contentType = 'text';
        } else {
            return errorresponse(res, "Content is required", 400);
        }

        const message = new MessageModel({
            conversation: conversation._id,
            sender: senderId,
            receiver: receiverId,
            content,
            contentType,
            imageOrVideoUrl,
            messageStatus
        })
        await message.save();
        if (message?.content) {
            conversation.lastMessage = message?._id;
        }
        conversation.unreadCount += 1;
        await conversation.save();

        const populatedMessage = await MessageModel.findById(message?._id)
            .populate("sender", "username profilePicture")
            .populate("receiver", "username profilePicture")

        //Emit Socket Event
        if (req.io && req.socketUserMap) {
            const receiverSocketId = req.socketUserMap.get(receiverId);
            if (receiverSocketId) {
                req.io.to(receiverSocketId).emit("receive_message", populatedMessage);
                message.messageStatus = "delivered";
                await message.save();
            }
        }

        return successresponse(res, "Message sent successfully", 201, populatedMessage);
    } catch (error) {
        return errorresponse(res, "Internal Server Error", 500, error);
    }
}

export const getConversation = async (req, res) => {
    const userId = req.user.userId;
    try {
        let conversation = await ConversationModel.find({ participants: userId, })
            .populate("participants", "username profilePicture lastSeen isOnline")
            .populate({
                path: "lastMessage",
                populate: {
                    path: "sender receiver",
                    select: "username profilePicture"
                }
            }).sort({ updatedAt: -1 })

        return successresponse(res, "Conversation retrived successfully", 200, conversation);
    } catch (error) {
        return errorresponse(res, "Internal Server Error", 500, error);
    }
}

export const getMessages = async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user.userId;
    try {
        const conversation = await ConversationModel.findById(conversationId)
        if (!conversation) {
            return errorresponse(res, "Conversation not found", 404);
        }
        if (!conversation.participants.includes(userId)) {
            return errorresponse(res, "Not authorized to view The conversation", 403);
        }
        const meaasage = await MessageModel.find({ conversation: conversationId })
            .populate("sender", "username profilePicture")
            .populate("receiver", "username profilePicture")
            .sort("createdAt")

        await MessageModel.updateMany({
            conversation: conversationId,
            receiver: userId,
            messageStatus: { $in: ["send", "delivered"] },
        }, { $set: { messageStatus: "read" } });

        conversation.unreadCount = 0;
        await conversation.save();

        return successresponse(res, "Messages retrived successfully", 200, meaasage);
    } catch (error) {
        return errorresponse(res, "Internal Server Error", 500, error);
    }
}

export const markAsRead = async (req, res) => {
    const { messageIds } = req.body;
    const userId = req.user.userId;
    try {
        let messages = await MessageModel.find({
            _id: { $in: messageIds },
            receiver: userId,
        })

        await MessageModel.updateMany(
            { _id: { $in: messageIds }, receiver: userId }, 
            { $set: { messageStatus: "read" } }
        );

        //Emit Socket Event notify to orignal sender
        if (req.io && req.socketUserMap) {
            for (const message of messages) {
                const senderSocketId = req.socketUserMap.get(message.sender.toString());
                if (senderSocketId) {
                    const updatedMessage = {
                        _id: message._id,
                        messageStatus: "read",
                    };
                    req.io.to(senderSocketId).emit("message_read", updatedMessage)
                    await message.save();
                }
            }
        }
        return successresponse(res, "Messages marked as read successfully", 200, messages);
    } catch (error) {
        return errorresponse(res, "Internal Server Error", 500, error);
    }
}

export const deleteMessage = async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user.userId;
    try {
        const message = await MessageModel.findById(messageId);
        if (!message) {
            return errorresponse(res, "Message not found", 404);
        }
        if (message.sender.toString() !== userId) {
            return errorresponse(res, "Not authorized to delete this message", 403);
        }
        await message.deleteOne();

        //Emit Socket Event notify to orignal sender
        if (req.io && req.socketUserMap) {
            const receiverSocketId = req.socketUserMap.get(message.receiver.toString());
            if (receiverSocketId) {
                req.io.to(receiverSocketId).emit("message_deleted", messageId)
            }
        }

        return successresponse(res, "Message deleted successfully", 200);
    } catch (error) {
        return errorresponse(res, "Internal Server Error", 500, error);
    }
}