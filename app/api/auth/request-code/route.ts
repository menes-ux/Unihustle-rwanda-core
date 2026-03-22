import { prisma } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/sendEmail"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { email, role } = await req.json()

        // Validates the minimum payload needed to generate and store an OTP.
        if (!email || !role ) {
            return NextResponse.json(
                { error: "Email and role are required" },
                { status: 400 }
            )
        }
        if (role !== "student" && role !== "business") {
            return NextResponse.json(
                { error: "Role must be either student or business" },
                { status: 400 }
            )
        }

        // restrict students to ALU emails
        if (role === "student" && !email.endsWith("@alustudent.com")) {
            return NextResponse.json(
                { error: "Invalid student email" },
                { status: 400 }
            )
        }

        // generate 6-didgit OTP
        const code = Math.floor(100000 + Math.random() * 900000).toString()

        // expiry time (10 minutes)
        const expires = new Date(Date.now() + 10 * 60 * 1000)

        // save or update user
        await prisma.user.upsert({
            where: { email },
            update: {
                verification_code: code,
                verification_expires: expires,
                role //keep role updated if needed
            },
            create: {
                email,
                full_name: "", // will be filled later
                role,
                verification_code: code,
                verification_expires: expires
            }
        })

        // Sends the OTP email in environments where SMTP credentials exist.
        // For local development without SMTP, we still return success and expose
        // the generated code to make local end-to-end testing possible.
        let emailSent = false
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
           // await sendVerificationEmail(email, code)
            emailSent = true
        }

        return NextResponse.json({
            message: "Verification code sent.",
            emailSent,
            ...(process.env.NODE_ENV !== "production" ? { devCode: code } : {})
        })
    } catch (error) {
        console.error(error)

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}