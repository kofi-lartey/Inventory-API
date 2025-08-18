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
export const sendIDEmail = async (email, fullName, staffID, role) => {
  try {
    const info = await transporter.sendMail({
      from: SMTP_USER,
      to: email,
      subject: "👋 Welcome to Suku Technologies – Your ID is Here!",
      text: `Hello ${fullName}, welcome to Suku Technologies!

Your Unique ID is: ${staffID}
Role: ${role}

Use this ID to check in and out whenever you arrive at or leave the workplace.

If you did not sign up with us, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #222; background: #f9f9f9; padding: 24px; border-radius: 8px; line-height: 1.6;">
          <h2 style="color: #2d7ff9;">👋 Welcome to Suku Technologies, ${fullName}!</h2>

          <p style="font-size: 16px;">We're excited to have you on board as a <strong>${role}</strong>.</p>

          <p style="font-size: 16px;">Your ID for Checking In and Out:</p>
          <p style="font-size: 24px; font-weight: bold; color: #2d7ff9;">${staffID}</p>

          <p style="font-size: 16px;">
            You will use this ID to <strong>Check In</strong> and <strong>Check Out</strong> whenever you come in or leave the office.
          </p>

          <p style="font-size: 14px; color: #888; margin-top: 24px;">
            If you did not register with Suku Technologies, please ignore this email or contact our support team.
          </p>
        </div>
      `,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("❌ Error while sending welcome email", error);
  }
};
