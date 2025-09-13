import Joi from "joi";

export const userSchema = Joi.object({
    fullName:Joi.string().min(3).max(30).required(),
    email:Joi.string().email().required(),
    password:Joi.string().min(6).required(),
    role:Joi.string().valid("user","admin").default("user"),
    adminCode:Joi.string().optional().allow(null,"")
})

export const loginSchema = Joi.object({
    fullName:Joi.string().required(),
    password:Joi.string().required()
})

export const otpSchema = Joi.object({
    email:Joi.string().email().required(),
    otp:Joi.string().length(6).required()
})