import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type GigCategory =
  | "Development"
  | "Design"
  | "Writing"
  | "Marketing"
  | "Education"
  | "Data";

function toCategoryLabel(input: string): GigCategory {
  const normalized = input.trim().toLowerCase();
  if (normalized === "development") return "Development";
  if (normalized === "design") return "Design";
  if (normalized === "writing") return "Writing";
  if (normalized === "marketing") return "Marketing";
  if (normalized === "education") return "Education";
  return "Data";
}

// Lists marketplace gigs with seller information and active order counts.
export async function GET() {
  try {
    const gigs = await prisma.gig.findMany({
      where: { status: "active" },
      orderBy: { gig_id: "desc" },
      include: {
        student: true,
        orders: {
          where: { status: { in: ["pending", "in_progress"] } },
        },
      },
    });

    const payload = gigs.map((gig) => ({
      id: gig.gig_id,
      title: gig.title,
      category: toCategoryLabel(gig.category),
      price: gig.price,
      deliveryDays: 7,
      tags: [gig.category],
      seller: gig.student.full_name || gig.student.email.split("@")[0],
      sellerEmail: gig.student.email,
      university: gig.student.school || "ALU Rwanda",
      cohortYear: 2025,
      activeOrders: gig.orders.length,
    }));

    return NextResponse.json({ gigs: payload });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to fetch gigs" }, { status: 500 });
  }
}

// Creates a new student gig from dashboard form input.
export async function POST(req: Request) {
  try {
    const { email, title, category, price } = await req.json();

    if (!email || !title || !category || typeof price !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const student = await prisma.user.findUnique({ where: { email } });
    if (!student || student.role !== "student") {
      return NextResponse.json({ error: "Student account not found" }, { status: 404 });
    }

    const gig = await prisma.gig.create({
      data: {
        title: String(title).trim(),
        category: toCategoryLabel(String(category)),
        price: Math.max(0, Math.floor(price)),
        status: "active",
        student_id: student.user_id,
      },
    });

    return NextResponse.json({ message: "Gig created", gigId: gig.gig_id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to create gig" }, { status: 500 });
  }
}
