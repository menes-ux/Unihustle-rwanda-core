import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, full_name } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!full_name) {
      return NextResponse.json(
        { error: "Enterprise name is required" },
        { status: 400 }
      );
    }

    // Update the user's full_name (enterprise name)
    const user = await prisma.user.update({
      where: { email },
      data: { full_name },
    });

    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
