import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Creates a marketplace order linking a business buyer to a gig.
export async function POST(req: Request) {
  try {
    const { gigId, buyerEmail } = await req.json();

    if (!gigId || !buyerEmail) {
      return NextResponse.json({ error: "gigId and buyerEmail are required" }, { status: 400 });
    }

    const buyer = await prisma.user.findUnique({ where: { email: String(buyerEmail) } });
    if (!buyer || buyer.role !== "business") {
      return NextResponse.json({ error: "Business account not found" }, { status: 404 });
    }

    const gig = await prisma.gig.findUnique({ where: { gig_id: Number(gigId) } });
    if (!gig || gig.status !== "active") {
      return NextResponse.json({ error: "Gig not available" }, { status: 404 });
    }

    const order = await prisma.order.create({
      data: {
        gig_id: gig.gig_id,
        buyer_id: buyer.user_id,
        status: "pending",
      },
    });

    return NextResponse.json({ message: "Order placed", orderId: order.order_id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to place order" }, { status: 500 });
  }
}
