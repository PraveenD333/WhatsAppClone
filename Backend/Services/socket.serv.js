import { Server } from 'socket.io'
import UserModel from '../Models/user.model.js'
import MessageModel from '../Models/message.model.js'
import handleVideoCallEvent from './video.sev.js';


// Map to Store online Users -> UserId SocketID
const onlineUsers = new Map();

//Map to Track typing Status -> UserId -> [Conversation] : Boolean
const typingUsers = new Map();

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        },
        pingTimeout: 60000  //Disconnect InActive User or Socket's After 60s
    });

    // When a new socket connection is established
    io.on("connection", (socket) => {
        console.log(`User Connected: ${socket.id}`)

        let userId = null;

        //handel user connection and mark them online in db
        socket.on("user_connected", async (connectingUserId) => {
            try {
                userId = connectingUserId;
                socket.userId = userId;
                onlineUsers.set(userId, socket.id)
                socket.join(userId) //join a personal room for direct emits


                //Update user status in db
                await UserModel.findByIdAndUpdate(userId, {
                    isOnline: true,
                    lastSeen: new Date()
                });

                //Notify all User that this user is online
                io.emit("user_status", { userId, isOnline: true });
            } catch (error) {
                console.error("Error Handling User Connection", error);
            }
        })

        // Return Online Status of requested user
        socket.on("get_user_status", (requestedUserId, callback) => {
            const isOnline = onlineUsers.has(requestedUserId)
            callback({
                userId: requestedUserId,
                isOnline,
                lastSeen: isOnline ? new Date() : null
            })
        })


        //forword message to receiver if online
        socket.on("send message", async (message) => {
            try {
                const receiverSocketId = onlineUsers.get(message.receiver?._id);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("receive_message", message)
                }
            } catch (error) {
                console.error("Error sending message", error)
                socket.emit("message_error", { error: "Failed to send message" })
            }
        })

        //update message as read and notify sender
        socket.on("message_read", async ({ messageIds, senderId }) => {
            try {
                await MessageModel.updateMany(
                    { _id: { $in: messageIds } },
                    { $set: { messageStatus: "read" } }
                )
                const senderSocketId = onlineUsers.get(senderId);
                if (senderSocketId) {
                    messageIds.forEach((messageId) => {
                        io.to(senderSocketId).emit("message_status_update", {
                            messageId,
                            messageStatus: "read"
                        })
                    })
                }
            } catch (error) {
                console.error("Error updating message read status", error);
            }
        })


        //handle typing start event and auto-stop after 3s
        socket.on("typing_start", ({ conversationId, receiverId }) => {
            if (!userId || !conversationId || !receiverId) return;

            if (!typingUsers.has(userId)) typingUsers.set(userId, {})

            const userTyping = typingUsers.get(userId)

            userTyping[conversationId] = true;

            //clear any exiting timeout
            if (userTyping[`${conversationId}_timeout`]) {
                clearTimeout(userTyping[`${conversationId}_timeout`])
            }

            //auto-Stop after 3s
            userTyping[`${conversationId}_timeout`] = setTimeout(() => {
                userTyping[conversationId] = false;
                socket.to(receiverId).emit("user_typing", {
                    userId,
                    conversationId,
                    isTyping: false
                })
            }, 3000)

            //Notify receiver
            socket.to(receiverId).emit("user_typing", {
                userId,
                conversationId,
                isTyping: true
            })
        })


        socket.on("typing_stop", ({ conversationId, receiverId }) => {
            if (!userId || !conversationId || !receiverId) return;

            if (typingUsers.has(userId)) {
                const userTyping = typingUsers.get(userId);
                userTyping[conversationId] = false 

                if (userTyping[`${conversationId}_timeout`]) {
                    clearTimeout(userTyping[`${conversationId}_timeout`])
                    delete userTyping[`${conversationId}_timeout`]
                }
            };

            socket.to(receiverId).emit("user_typing", {
                userId,
                conversationId,
                isTyping: false
            })
        })


        //Add or update reaction on message
        socket.on("add_reaction", async ({ messageId, emoji, userId: reactionUserId }) => {
            try {
                const message = await MessageModel.findById(messageId)
                if (!message) return;


                const exitingIndex = message.reactions.findIndex(
                    (r) => r.user.toString() === reactionUserId
                )

                if (exitingIndex > -1) {
                    const exiting = message.reactions[exitingIndex];
                    if (exiting.emoji === emoji) {
                        //remove Same Reaction
                        message.reactions.splice(exitingIndex, 1)
                    } else {
                        //Change Emoji
                        message.reactions[exitingIndex].emoji = emoji;
                    }
                } else {
                    //add new reaction
                    message.reactions.push({ user: reactionUserId, emoji })
                }
                await message.save()

                const populatedMessage = await MessageModel.findById(messageId)
                    .populate("sender", "username profilePicture")
                    .populate("receiver", "username profilePicture")
                    .populate("reactions.user", "username")

                const reactionUpdated = {
                    messageId,
                    reaction: populatedMessage.reactions
                }

                const senderSocket = onlineUsers.get(populatedMessage.sender._id.toString());
                const receiverSocket = onlineUsers.get(populatedMessage.receiver._id.toString());

                if (senderSocket) io.to(senderSocket).emit("reaction_updated", reactionUpdated)

                if (receiverSocket) io.to(receiverSocket).emit("reaction_updated", reactionUpdated)

            } catch (error) {
                console.log("Error handling reaction", error);
            }
        })

        //handle Video Call Events
        handleVideoCallEvent(socket,io,onlineUsers)

        //handle disconnection and mark user offline
        const handleDisconnect = async () => {
            if (!userId) return;
            try {
                onlineUsers.delete(userId)

                //Clear all typing timeouts
                if (typingUsers.has(userId)) {
                    const userTyping = typingUsers.get(userId);
                    Object.keys(userTyping).forEach((key) => {
                        if (key.endsWith("_timeout")) clearTimeout(userTyping[key])
                    })
                    typingUsers.delete(userId)
                }
                await UserModel.findByIdAndUpdate(userId, {
                    isOnline: false,
                    lastSeen: new Date(),
                })

                io.emit("user_status", {
                    userId,
                    isOnline: false,
                    lastSeen: new Date(),
                })

                socket.leave(userId)
                console.log(`User ${userId} Disconnected`);
            } catch (error) {
                console.error("Error handling disconnection", error);
            }
        }

        //Disconnect Event
        socket.on("disconnect", handleDisconnect)
    });
    
    //Attach the online user map to the scoket server for external use
    io.socketUserMap = onlineUsers;
    return io;
};

export default initializeSocket;
