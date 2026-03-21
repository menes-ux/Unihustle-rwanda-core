import { prisma } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/sendEmail"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { email, role } = await req.json()

        // basic validation
        if (!email || !role ) {
            return NextResponse.json(
                { error: "Email and role are required" },
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

        // send OTP email
        await sendVerificationEmail(email, code)

        return NextResponse.json({
            message: "Verification code sent."
        })
    } catch (error) {
        console.error(error)

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}