import { Router } from "express";
import { deleteUser, editUser, forgotPasswordOtp, getAllUsers, getUserById, getUserByNameRoleandEmail, login, resendOtp, resetPassword, signUp, verifyOtp } from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";


export const userRouter = Router();

// create user
userRouter.post('/signup', signUp)
// login user
userRouter.post('/login', login)

// otp
userRouter.post('/resend-otp', authenticate, resendOtp)
userRouter.post('/verify-otp', verifyOtp)

// password reset
userRouter.post('/request-passwordOTP', forgotPasswordOtp)
userRouter.post('/reset-password', resetPassword)

// get all users
userRouter.get('/all-users',getAllUsers)
userRouter.get('/:id',getUserById)
userRouter.get('/search/name',getUserByNameRoleandEmail)

// edit or delete user
userRouter.put('/edit/:id',editUser)
userRouter.delete('/delete/:id',deleteUser);