import dotenv from 'dotenv'

dotenv.config()

export const PORT = process.env.PORT || 6588
export const MONGOURI = process.env.MONGO_URI

// Node Mailer configuration
export const SMTP_USER = process.env.SMTP_USER
export const SMTP_PASS = process.env.SMTP_PASS

// cloudinary keys
export const CLOUD_NAME = process.env.CLOUD_NAME
export const CLOUD_API_KEY = process.env.CLOUD_API_KEY
export const CLOUD_API_SECRET = process.env.CLOUD_API_SECRET
export const CLIENT_URL = process.env.CLIENT_URL

// AUTH DETAILS
export const SECRET = process.env.JWT_SECRET

// paystack keys
export const PayStack_Test_Secret_Key = process.env.PayStack_Test_Secret_Key
export const PayStack_Test_Public_Key = process.env.PayStack_Test_Public_Key