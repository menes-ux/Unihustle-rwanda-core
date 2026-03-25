import { prisma }      from "@/lib/db";
import { getSession }  from "@/lib/session";
import { NextResponse } from "next/server";

/**
 * POST /api/orders
 *
 * Creates a new order when a business books a student gig.
 * Email notification is intentionally skipped for now —
 * add Resend integration later when ready.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to book a gig" },
        { status: 401 }
      );
    }

    if (session.role !== "business") {
      return NextResponse.json(
        { error: "Only business accounts can book gigs" },
        { status: 403 }
      );
    }

    const { gig_id, delivery_days } = await req.json();

    if (!gig_id) {
      return NextResponse.json(
        { error: "gig_id is required" },
        { status: 400 }
      );
    }

    const [buyer, gig] = await Promise.all([
      prisma.user.findUnique({ where: { email: session.email } }),
      prisma.gig.findUnique({
        where:   { gig_id: parseInt(gig_id) },
        include: { student: true },
      }),
    ]);

    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }

    if (gig.status !== "active") {
      return NextResponse.json(
        { error: "This gig is not currently available" },
        { status: 400 }
      );
    }

    if (gig.student_id === buyer.user_id) {
      return NextResponse.json(
        { error: "You cannot book your own gig" },
        { status: 400 }
      );
    }

    const days     = (gig as any).delivery_days ?? delivery_days ?? 3;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);

    const order = await prisma.order.create({
      data: {
        gig_id:   gig.gig_id,
        buyer_id: buyer.user_id,
        status:   "pending",
        deadline,
      },
    });

    return NextResponse.json({ order_id: order.order_id }, { status: 201 });

  } catch (err) {
    console.error("POST /api/orders error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}