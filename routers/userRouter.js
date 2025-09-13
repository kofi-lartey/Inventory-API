import { Router } from "express";
import { login, resendOtp, signUp, verifyOtp } from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";


export const userRouter = Router();

// create user
userRouter.post('/signup', signUp)
// login user
userRouter.post('/login', login)

// otp
userRouter.post('/resend-otp', authenticate, resendOtp)
userRouter.post('/verify-otp', verifyOtp)