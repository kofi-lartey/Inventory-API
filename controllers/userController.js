import { ADMIN_CODE, SECRET } from '../config/env.js';
import { forgotPasswordOtpSchema, loginSchema, otpSchema, resetPasswordSchema, userSchema } from '../schema/userSchema.js';
import { User } from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { otpGenerator } from '../utils/help.js';
import { sendOTPEmail, sendPasswordResetEmail } from '../utils/mailer.js';

export const signUp = async (req, res) => {
    try {
        // validate the user along joi
        const { error, value } = userSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ message: error.details[0].message })
        }

        const { fullName, email, password, role, adminCode } = value;

        // find user by name
        const findUserName = await User.findOne({ fullName })
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
        const findUser = await User.findOne({ email })

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
            return res.status(201).json({ message: 'Successful registration', token, signUp })
        }

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// Resend OTP
export const resendOtp = async (req, res) => {
    try {
        const UserID = req.user.id

        // find user by id from the token
        const user = await User.findById(UserID)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
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
        return res.status(200).json({ message: "Otp Sent to mail", updatedUser })
    } catch (error) {
        return res.status(500).json({ message: error.message })
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

// Send otp to mail to help reset password
export const forgotPasswordOtp = async (req, res) => {
    try {
        const { error, value } = forgotPasswordOtpSchema.validate(req.body)
        if (error) {
            return res.status(400).json({ message: error.details[0].message })
        }

        // validate email or find user by email
        const { email } = value
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
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

        // send mail
        const sendotpmail = await sendPasswordResetEmail(user.email, user.fullName, otp);
        console.log('OTP MAIL', sendotpmail)

        // return response
        return res.status(200).json({ message: "Otp Sent to mail", updatedUser })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    };
};

// reset password
export const resetPassword = async (req, res) => {
    try {
        const { error, value } = resetPasswordSchema.validate(req.body)
        if (error) {
            return res.status(400).json({ message: error.details[0].message })
        }
        const { email, otp, newPassword } = value
        // find user by email
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        // Check if a reset process is active meaning otp exist
        if (!user.otp) {
            return res.status(400).json({ message: "No active reset request found." })
        }
        // Correctly compare the plain-text OTP with the hashed OTP
        const isMatch = await bcrypt.compare(otp, user.otp);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Otp" })
        }
        // Check if otp has expired
        if (Date.now() > user.otpExpiresAt){
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // clear the expired OTP to prevent retries after verification
        user.otp = null;
        user.otpExpiresAt = null;
        await user.save();

        // hash the new password
        const hashPassowrd = await bcrypt.hash(newPassword, 12);
        console.log('hashPassword', hashPassowrd)

        // update user password by saving it
        user.password = hashPassowrd
        const updatedUser = await user.save()
        console.log('Updated User', updatedUser)

        // return response
        return res.status(200).json({ message: "Password Reset Successful", updatedUser })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const login = async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body)
        if (error) {
            return res.status(400).json({ message: error.details[0].message })
        }

        const { fullName, password } = value

        // find user by email
        const user = await User.findOne({ fullName })
        if (!user) {
            return res.status(401).json({ message: 'Invalid Credentials' })
        }
        const findpassword = await bcrypt.compare(password, user.password)
        if (!findpassword) {
            return res.status(401).json({ message: 'Invalid Credentials' })
        }

        const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '1d' })
        return res.status(200).json({ message: "Token", token, user })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// Admins Endpoints

// get all users
export const getAllUsers = async(req, res)=>{
    try {
        const users = await User.find().select('-password -otp -otpExpiresAt');
        if(users.length === 0){
            return res.status(404).json({message: "No users found"})
        }
        return res.status(200).json({message: "All Users", users})
    } catch (error) {
        return res.status(500).json({ message: error.message })    
    }
}

// get user by id
export const getUserById = async(req,res)=>{
    try {
        const {id} = req.params;
        const user = await User.findById(id).select('-password -otp -otpExpiresAt');
        if(!user){
            return res.status(404).json({message: "User not found"})
        }
        return res.status(200).json({message: "User found", user})
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// get user by name,role and email
export const getUserByNameRoleandEmail = async(req,res)=>{
    try {
        const { fullName, role, email } = req.body;
        const body = {};
        if (fullName) {
            body.fullName = { $regex: fullName, $options: 'i' }; // case-insensitive search
        }
        if (role) {
            body.role = role;
        }
        if(email){
            body.email = email;
        }
        const users = await User.find(body).select('-password -otp -otpExpiresAt');
        if(users.length === 0){
            return res.status(404).json({message: "No users found matching the criteria"})
        }
        return res.status(200).json({message: "Users found", users})
        
    } catch (error) {
        return res.status(500).json({ message: error.message }) 
    }
}

// editing and deleting users can be added later
export const editUser = async(req,res)=>{
    try {
        const {id} = req.params;
        const {password,role, ...updateData} = req.body;
        const updateUser = await User.findByIdAndUpdate(
            id,
            updateData,
            {new:true}
        ).select('-password -otp -otpExpiresAt');
        if(!updateUser){
            return res.status(404).json({message: "User not found"})
        }
        return res.status(200).json({message: "User updated", updateUser})
    } catch (error) {
        return res.status(500).json({ message: error.message }) 
    }
}


// delete user
export const deleteUser = async(req,res)=>{
    try {
        const {id} = req.params;
        const deleteUser = await User.findByIdAndDelete(id).select('-password -otp -otpExpiresAt');
        if(!deleteUser){
            return res.status(404).json({message: "User not found"})
        }
        return res.status(200).json({message: "User deleted", deleteUser})
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}