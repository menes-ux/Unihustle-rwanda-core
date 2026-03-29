import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return Response.json({ logged_in: false }, { status: 200 });
  }

  return Response.json({
    logged_in: true,
    email: session.email,
    role: session.role,
  });
}
