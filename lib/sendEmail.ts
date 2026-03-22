// first install nodemailer: npm install nodemailer

import "dotenv/config"
import nodemailer from "nodemailer"

export async function sendVerificationEmail(email: string, code: string) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify you UniHustle account",
        text: `Your verification code is: ${code}`
    })
}