import { uploadFileToCloudinary } from "../Database/cloudinaryConfig.js";
import ConversationModel from "../Models/conversation.model.js";
import UserModel from "../Models/user.model.js";
import sendOtpToEmail from "../Services/emai.serv.js";
import { sendotpToPhone } from "../Services/phone.serv.js";
import { verifyOtp } from "../Services/phone.serv.js";
import otpGenerator from "../Utils/otpGenerater.js";
import { errorresponse, successresponse } from "../Utils/response.js";
import generateToke from "../Utils/token.js";


export const sendOtp = async (req, res) => {
    const { phoneNumber, phoneSufix, email } = req.body;
    const otp = otpGenerator();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);  //5min
    let user;

    try {
        if (email) {
            user = await UserModel.findOne({ email })

            if (!user) {
                user = new UserModel({ email })
            }
            user.emailOtp = otp;
            user.emailOtpExpiry = expiry;
            await user.save();
            await sendOtpToEmail(email, otp);
            return successresponse(res, "OTP sent your email successfully", 200, { email });
        }
        if (!phoneNumber || !phoneSufix) {
            return errorresponse(res, "Phone number & Phone Sufix are required", 400);
        }
        user = await UserModel.findOne({ phoneNumber, phoneSufix });
        if (!user) {
            user = new UserModel({ phoneNumber, phoneSufix });
        }

        const fullphoneNumber = `${phoneSufix}${phoneNumber}`;
        await sendotpToPhone(fullphoneNumber);
        await user.save();
        return successresponse(res, "OTP sent your phone successfully", 201, user)

    } catch (error) {
        return errorresponse(res, "Internal Server Error", 500, error)
    }
}

export const verificationOtp = async (req, res) => {
    const { phoneNumber, phoneSufix, email, otp } = req.body;

    try {
        let user;
        if (email) {
            user = await UserModel.findOne({ email })
            if (!user) {
                return errorresponse(res, "User not found", 404);
            }
            const now = new Date();
            if (!user.emailOtp || String(user.emailOtp) !== String(otp) || now > new Date(user.emailOtpExpiry)) {
                return errorresponse(res, "Invalid OTP", 400);
            }
            user.isVerified = true;
            user.emailOtp = null;
            user.emailOtpExpiry = null;
            await user.save();
        }
        else {
            if (!phoneNumber || !phoneSufix) {
                return errorresponse(res, "Phone number & Phone Sufix are required", 400);
            }
            const fullphoneNumber = `${phoneSufix}${phoneNumber}`;
            user = await UserModel.findOne({ phoneNumber });
            if (!user) {
                return errorresponse(res, "User not found", 404);
            }
            const result = await verifyOtp(fullphoneNumber, otp);
            if (result.status !== "approved") {
                return errorresponse(res, "Invalid OTP", 400);
            }
            user.isVerified = true;
            await user.save();
        }
        const token = generateToke(user._id);
        res.cookie("auth_token", token, {
        httpOnly: true, // prevents JS from accessing cookie
        secure: true, // only HTTPS in prod
        sameSite: "none", // cross-site for prod, lax for local
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        res.setHeader("Authorization", `Bearer ${token}`);
        return successresponse(res, "OTP verified successfully", 200, { user, token });
    } catch (error) {
        return errorresponse(res, "Internal Server Error", 500, error)
    }
}

export const updateProfile = async (req, res) => {
    const { username, agreed, about } = req.body;
    const userId = req.user.userId;
    try {
        const user = await UserModel.findById(userId);
        const file = req.file;
        if (file) {
            const uploadResult = await uploadFileToCloudinary(file);
            user.profilePicture = uploadResult?.secure_url;
        } else if (req.body.profilePicture) {
            user.profilePicture = req.body.profilePicture;
        }
        if (username) user.username = username;
        if (agreed) user.agreed = agreed;
        if (about) user.about = about;
        await user.save();
        return successresponse(res, "Profile updated successfully", 200, user);
    } catch (error) {
        return errorresponse(res, "Internal Server Error", 500, error)
    }
}

export const checkAuthenticated = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return errorresponse(res, "Unauthorized !please login before access our App", 401);
        }
        const user = await UserModel.findById(userId);
        if (!user) {
            return errorresponse(res, "User not found", 404);
        }
        return successresponse(res, "User retrived successfully & Allowed to use Whatsapp", 200, user);
    } catch (error) {
        return errorresponse(res, "Internal Server Error", 500, error);
    }
}

export const getAlluser = async (req, res) => {
    const loggedInUser = req.user.userId;
    try {
        const user = await UserModel.find({ _id: { $ne: loggedInUser } }) //find all User not loggedInUser
            .select("username profilePicture about lastSeen isOnline phoneSufix phoneNumber") //only show this contents
            .lean(); //same structure mongoose document to plain JS Object
        const userWithConversation = await Promise.all(
            user.map(async (user) => {
                const conversation = await ConversationModel.findOne(
                    { participants: { $all: [loggedInUser, user?._id] } }).populate({
                        path: "lastMessage",
                        select: "content createdAt sender receiver"
                    }).lean();

                return { ...user, Conversation: conversation || null }
            })
        )
        return successresponse(res, "Users retrived successfully", 200, userWithConversation);
    } catch (error) {
        return errorresponse(res, "Internal Server Error", 500, error);
    }
}

export const logOut = (req, res) => {
    try {
        res.cookie("auth_token", "", { expires: new Date(0) });
        return successresponse(res, "Logged out successfully", 200);
    } catch (error) {
        return errorresponse(res, "Internal Server Error", 500, error)
    }
}
