import { uploadFileToCloudinary } from "../Database/cloudinaryConfig.js";
import StatusModel from "../Models/status.model.js";
import { errorresponse, successresponse } from "../Utils/response.js";


export const createStatus = async (req, res) => {
    try {
        const { content, contentType } = req.body;
        const userId = req.user.userId;
        const file = req.file;

        let mediaUrl = null;
        let finalContentType = contentType || 'text';


        //Handel file Upload
        if (file) {
            const uploadFile = await uploadFileToCloudinary(file);

            if (!uploadFile?.secure_url) {
                return errorresponse(res, "Internal Server Error", 500);
            }
            mediaUrl = uploadFile.secure_url;

            if (file.mimetype.startsWith('image')) {
                finalContentType = 'image';
            } else if (file.mimetype.startsWith('video')) {
                finalContentType = 'video';
            } else {
                return errorresponse(res, "Invalid file type", 400);
            }
        } else if (content?.trim()) {
            finalContentType = 'text';
        } else {
            return errorresponse(res, "Content is required", 400);
        }

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const status = new StatusModel({
            user: userId,
            content: mediaUrl || content,
            contentType: finalContentType,
            expiresAt,
        });
        await status.save();
        const populatedStatus = await StatusModel.findById(status._id)
            .populate("user", "username profilePicture")
            .populate("viewers", "username profilePicture ")

        //Emit Socket Event
        if (req.io && req.socketUserMap) {
            //Brodcast to All Connecting Users except the Creator
            for (const [connectingUserId, socketId] of req.socketUserMap) {
                if (connectingUserId !== userId) {
                    req.io.to(socketId).emit("new_status", populatedStatus);
                }
            }
        }

        return successresponse(res, "Status Created successfully", 201, populatedStatus);
    } catch (error) {
        return errorresponse(res, "Internal Server Error", 500, error);
    }
}

export const getStatuses = async (req, res) => {
    try {
        const statuses = await StatusModel.find({
            expiresAt: { $gt: new Date() }
        }).populate("user", "username profilePicture")
            .populate("viewers", "username profilePicture")
            .sort({ createdAt: -1 });

        return successresponse(res, "Statuses retrived successfully", 200, statuses);
    } catch (error) {
        return errorresponse(res, "Internal Server Error", 500, error);
    }
}

export const viewStatus = async (req, res) => {
    const { statusId } = req.params;
    const userId = req.user.userId;
    try {
        const status = await StatusModel.findById(statusId);
        if (!status) {
            return errorresponse(res, "Status not found", 404);
        }
        if (!status.viewers.includes(userId)) {
            status.viewers.push(userId);
            await status.save();

            const updatedStatus = await StatusModel.findById(statusId)
                .populate("user", "username profilePicture")
                .populate("viewers", "username profilePicture")

            //Emit Socket Event
            if (req.io && req.socketUserMap) {
                //Brodcast to All Connecting Users except the Creator
                const statusOwnerSocketId = req.socketUserMap.get(status.user.toString());
                if (statusOwnerSocketId) {
                    const viewData = {
                        statusId,
                        viewerId: userId,
                        totalViewers: updatedStatus.viewers.length,
                        viewers: updatedStatus.viewers,
                    }
                    req.io.to(statusOwnerSocketId).emit("status_viewed", viewData)
                } else {
                    console.log("Status Owener not Connected");
                }
            }
        } else {
            console.log("User Alredy viewed the Status");
        }
        return successresponse(res, "Status viewed successfully", 200);
    } catch (error) {
        return errorresponse(res, "Internal Server Error", 500, error);
    }
}

export const deleteStatus = async (req, res) => {
    const { statusId } = req.params;
    const userId = req.user.userId;
    try {
        const status = await StatusModel.findById(statusId);
        if (!status) {
            return errorresponse(res, "Status not found", 404);
        }
        if (status.user.toString() !== userId) {
            return errorresponse(res, "Not authorized to delete this status", 403);
        }
        await status.deleteOne();

        //Emit Socket Event
        if (req.io && req.socketUserMap) {
            //Brodcast to All Connecting Users except the Creator
            for (const [connectingUserId, socketId] of req.socketUserMap) {
                if (connectingUserId !== userId) {
                    req.io.to(socketId).emit("status_deleted", statusId);
                }
            }
        }
        return successresponse(res, "Status deleted successfully", 200);
    } catch (error) {
        return errorresponse(res, "Internal Server Error", 500, error);
    }
}