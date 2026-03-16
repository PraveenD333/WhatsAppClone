const handleVideoCallEvent = (socket, io, onlineUsers) => {

    // Initiate Video Call
    socket.on("initiate_call", ({ callerId, receiverId, callType, callerInfo }) => {

        const receiverSocketId = onlineUsers.get(receiverId);

        if (receiverSocketId) {

            const callId = `${callerId}-${receiverId}-${Date.now()}`;

            io.to(receiverSocketId).emit("incoming_call", {
                callerId,
                callerName: callerInfo.username,
                callerAvatar: callerInfo.profilePicture,
                callId,
                callType
            })
        } else {
            console.log(`Server: Reciver${receiverId} is Offline`)
            socket.emit("call_failed", { reason: "User is Offline" })
        }
    })


    //Accept Call
    socket.on("accept_call", ({ callerId, callId, receiverInfo }) => {

        const callerSocketId = onlineUsers.get(callerId);

        if (callerSocketId) {

            io.to(callerSocketId).emit("call_accepted", {
                callerName: receiverInfo.username,
                callerAvatar: receiverInfo.profilePicture,
                callId
            })
        } else {
            console.log(`Server: Caller ${callerId} Not Found`)
        }
    })


    //Reject Call
    socket.on("reject_call", ({ callerId, callId }) => {

        const callerSocketId = onlineUsers.get(callerId);

        if (callerSocketId) {
            io.to(callerSocketId).emit("call_rejected", { callId })
        }
    })

    //end Call
    socket.on("end_call", ({ callId, participantId }) => {
        const participantSocketId = onlineUsers.get(participantId)
        if (participantSocketId) {
            io.to(participantSocketId).emit("call_ended", { callId })
        }
    });

    //webRTC signaling event with proper userId with senderId
    socket.on("webrtc_offer", ({ offer, receiverId, callId }) => {

        const receiverSocketId = onlineUsers.get(receiverId);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("webrtc_offer", {
                offer,
                senderId: socket.userId,
                callId
            })
            console.log(`Server Offer forwarded to ${receiverId}`);
        } else {
            console.log(`Server: Receiver ${receiverId} not found the offer`);
        }
    })

    //webRTC signaling event with proper userId with receiverId
    socket.on("webrtc_answer", ({ answer, receiverId, callId }) => {

        const receiverSocketId = onlineUsers.get(receiverId);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("webrtc_answer", {
                answer,
                senderId: socket.userId,
                callId
            })
            console.log(`Server anser forwarded to ${receiverId}`);
        } else {
            console.log(`Server: Receiver ${receiverId} not found the answer`);
        }
    })


    //webRTC signaling event with proper userId and peer to peer connection with senderId and receiverId
    socket.on("webrtc_ice_candidate", ({ candidate, receiverId, callId }) => {

        const receiverSocketId = onlineUsers.get(receiverId);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("webrtc_ice_candidate", {
                candidate,
                senderId: socket.userId,
                callId
            })
        } else {
            console.log(`Server: Receiver ${receiverId} not found the ICE candiadte`);
        }
    })
}

export default handleVideoCallEvent;