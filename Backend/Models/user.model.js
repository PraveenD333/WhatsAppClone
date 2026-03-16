import { model, Schema } from "mongoose";

const userSchema = new Schema({
    phoneNumber: { type: String, unique: true, sparse: true },
    phoneSufix: { type: String },
    username: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, unique: true, trim: true,match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/},
    emailOtp: { type: String },
    emailOtpExpiry: { type: Date },
    profilePicture: { type: String },
    about: { type: String, default: "Hi There! I am Using WhatsApp 😊" },
    lastSeen: { type: Date },
    isOnline: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    agreed: { type: Boolean, default: false }

}, { timestamps: true });

const UserModel = model('User', userSchema);

export default UserModel;