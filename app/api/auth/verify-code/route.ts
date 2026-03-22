// verifies OTP code

import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST (req: Request) {
    try {
        const { email, code } = await req.json()

        // validate input
        if (!email || !code) {
            return NextResponse.json(
                { error: "Email and code are required" },
                { status: 400 }
            )
        }

        // find user
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // check code match
        if (user.verification_code !== code) {
            return NextResponse.json(
                { error: "Invalid verification code" },
                { status: 400 }
            )
        }

        // check expiration
        if (!user.verification_expires || user.verification_expires < new Date()) {
            return NextResponse.json(
                { error: "Verification code has expired" },
                { status: 400 }
            )
        }

        // mark user as verified
        await prisma.user.update({
            where: { email },
            data: {
                is_verified: true,
                verification_code: null,
                verification_expires: null
            }
        })

        return NextResponse.json({
            message: "Email successfully verified",
            user: {
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        console.error(error)

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}