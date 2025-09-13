import { model, Schema } from "mongoose";
import normalize from "normalize-mongoose";

export const userModal = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    adminCode: {
        type: String,
        default: null
    },
    otp: {
        type: String,
    },
    otpExpiresAt: {
        type: Date,
    },
    isVerified: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true })
userModal.plugin(normalize)
export const User = model("User", userModal);