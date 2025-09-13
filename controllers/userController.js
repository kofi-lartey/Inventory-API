import { ADMIN_CODE, SECRET } from '../config/env.js';
import { loginSchema, otpSchema, userSchema } from '../schema/userSchema.js';
import { User } from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { otpGenerator } from '../utils/help.js';
import { sendOTPEmail } from '../utils/mailer.js';

export const signUp = async (req, res) => {
    try {
        // validate the user along joi
        const { error,value } = userSchema.validate(req.body);

        if(error){
            return res.status(400).json({ message: error.details[0].message })
        }

        const { fullName, email, password, role, adminCode } = value;

        // find user by name
        const findUserName = await User.findOne({ fullName})
        if (findUserName) {
            return res.status(409).json({ message: `Choose different UserName` });
        }

        // find user by role
        if (role === "admin") {
            if (adminCode !== ADMIN_CODE) {
                return res.status(401).json({ message: 'Invalid Admin Code' })
            }
        }

        // find if a similar email exist, if not create
        const findUser = await User.findOne({ email})

        if (findUser) {
            return res.status(409).json({ message: `Choose different Email` });
        } else {
            // hash the password
            const hashPassowrd = await bcrypt.hash(password, 12);
            console.log('hashPassword', hashPassowrd)

            // otp for verification of mail
            const otp = otpGenerator(6)
            const hashotp = await bcrypt.hash(otp, 12);
            console.log("hashotp", hashotp, otp)

            // create user
            const signUp = await User.create({
                ...value,
                password: hashPassowrd,
                otp: hashotp,
                otpExpiresAt: Date.now() + 10 * (60 * 1000) // 10 minutes from now
            })

            // send otp to mail
            const sendotpmail = await sendOTPEmail(email, fullName, otp);
            console.log('OTP MAIL', sendotpmail)

            // token
            const token = jwt.sign({ id: signUp._id }, SECRET, { expiresIn: '1d' })
            console.log("RegisterData", signUp)
            return res.status(201).json({ message: 'Successful registration',token, signUp })
        }

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// Resend OTP
export const resendOtp = async(req, res)=>{
    try {
        const UserID = req.user.id

        // find user by id from the token
        const user = await User.findById(UserID)
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        // generate new otp
        const otp = otpGenerator(6)
        const hashotp = await bcrypt.hash(otp, 12);
        console.log("hashotp", hashotp, otp)

        // update user otp and Expiring time by saving it
        user.otp = hashotp
        user.otpExpiresAt = Date.now() + 10 * (60 * 1000) // 10 minutes from now
        const updatedUser = await user.save()
        console.log('Updated User', updatedUser)

        // send otp to mail
        const sendotpmail = await sendOTPEmail(user.email, user.fullName, otp);
        console.log('OTP MAIL', sendotpmail)

        // return response
        return res.status(200).json({message:"Otp Sent to mail", updatedUser})
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}

export const verifyOtp = async (req, res) => {
    try {
        const { error, value } = otpSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { email, otp } = value;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Invalid Credentials" });
        }

        // Check if the user is already verified
        if (user.isVerified) {
            return res.status(400).json({ message: "Account is already verified." });
        }

        // Check if a verification process is active
        if (!user.otp) {
            return res.status(400).json({ message: "No active verification request found." });
        }

        // Correctly compare the plain-text OTP with the hashed OTP
        const isMatch = await bcrypt.compare(otp, user.otp);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Otp" });
        }

        // Check if otp has expired
        if (Date.now() > user.otpExpiresAt) {
            // It's a good practice to clear the expired OTP to prevent retries
            user.otp = null;
            user.otpExpiresAt = null;
            await user.save();
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // OTP is valid, proceed with verification
        user.isVerified = true;
        user.otp = null;
        user.otpExpiresAt = null;
        const verifiedUser = await user.save();
        console.log('Verified User', verifiedUser);

        return res.status(200).json({ message: "Account Verified", verifiedUser });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const {error, value} = loginSchema.validate(req.body)
        if(error){
            return res.status(400).json({message:error.details[0].message})
        }

        const{fullName, password} = value

        // find user by email
        const user = await User.findOne({fullName})
        if (!user) {
            return res.status(401).json({ message: 'Invalid Credentials' })
        }
        const findpassword = await bcrypt.compare(password, user.password)
        if (!findpassword) {
            return res.status(401).json({ message: 'Invalid Credentials' })
        }

        const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '1d' })
        return res.status(200).json({message:"Token",token, user})

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}