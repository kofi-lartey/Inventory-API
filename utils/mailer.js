import nodemailer from 'nodemailer';
import { SMTP_PASS, SMTP_USER } from '../config/env.js';



// Create a transporter for SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // upgrade later with STARTTLS
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// otp mail
export const sendOTPEmail = async (email, fullName, otp) => {
  try {
    const info = await transporter.sendMail({
      from: SMTP_USER,
      to: email,
      subject: "🔒 Verify Your Account - Your OTP is Here!",
      text: `Hello ${fullName},

Your One-Time Password (OTP) for account verification is: ${otp}

This code will expire in 1o minutes.

If you did not request this verification, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #222; background: #f9f9f9; padding: 24px; border-radius: 8px; line-height: 1.6;">
          <h2 style="color: #2d7ff9;">🔑 Account Verification for Kofi Inventory</h2>

          <p style="font-size: 16px;">Hello <strong>${fullName}</strong>,</p>

          <p style="font-size: 16px;">
            Please use the following One-Time Password (OTP) to verify your account:
          </p>
          <p style="font-size: 24px; font-weight: bold; color: #2d7ff9;">${otp}</p>

          <p style="font-size: 16px;">
            This OTP is valid for the next <strong>1 hour</strong>.
          </p>

          <p style="font-size: 14px; color: #888; margin-top: 24px;">
            If you did not initiate this verification request, please ignore this email.
          </p>
        </div>
      `,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("❌ Error while sending OTP email:", error);
    // You might want to throw the error to handle it in the calling function
    throw error;
  }
};

