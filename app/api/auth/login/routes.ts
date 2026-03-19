// only allwos verifies users to login in

import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { email } = await req.json()

        // validate input
        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
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

        // check verification
        if (!user.is_verified) {
            return NextResponse.json(
                { error: "Please verify your email before logging in" },
                { status: 403 }    
            )
        }

        //successful login 
        return NextResponse.json({
            message: "Login successful",
            user
        })
    } catch (error) {
        console.error(error)

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}