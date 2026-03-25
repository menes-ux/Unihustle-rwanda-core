import { prisma }      from "@/lib/db";
import { getSession }  from "@/lib/session";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * POST /api/orders/release
 *
 * Called when a business clicks "Release" after reviewing
 * the student's delivered work.
 *
 * Verifies the buyer owns the order before marking it complete
 * so businesses can't release each other's orders.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { order_id } = await req.json();

    if (!order_id) {
      return NextResponse.json({ error: "order_id is required" }, { status: 400 });
    }

    // Verify the order exists and belongs to this buyer
    const buyer = await prisma.user.findUnique({
      where: { email: session.email },
    });

    if (!buyer) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const order = await prisma.order.findFirst({
      where: {
        order_id: parseInt(order_id),
        buyer_id: buyer.user_id,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or not owned by this account" },
        { status: 404 }
      );
    }

    // Mark as completed
    await prisma.order.update({
      where: { order_id: order.order_id },
      data:  { status: "completed" },
    });

    revalidatePath("/dashboards/business");

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("release order error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}