import { cookies } from "next/headers";

const SESSION_COOKIE = "unihustle_session";

/**
 * Writes the user's email and role into a secure HTTP-only cookie.
 * Called once after successful OTP verification.
 *
 * HttpOnly = JavaScript on the page cannot read it (XSS protection).
 * Secure   = only sent over HTTPS in production.
 * SameSite = only sent on same-site requests (CSRF protection).
 * Path     = available on all routes.
 */
export async function createSession(email: string, role: string) {
  const cookieStore = await cookies();

  // We store a simple JSON payload — no encryption needed for email/role
  // since these are not sensitive secrets. The HttpOnly flag prevents
  // client-side JS from reading or tampering with the cookie.
  const payload = JSON.stringify({ email, role });

  cookieStore.set(SESSION_COOKIE, payload, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:     "/",
    maxAge:   60 * 60 * 24 * 7, // 7 days in seconds
  });
}

/**
 * Reads the session cookie and returns the parsed payload.
 * Returns null if the cookie doesn't exist or can't be parsed —
 * callers should treat null as "not logged in" and redirect to /login.
 */
export async function getSession(): Promise<{ email: string; role: string } | null> {
  const cookieStore = await cookies();
  const cookie      = cookieStore.get(SESSION_COOKIE);

  if (!cookie?.value) return null;

  try {
    return JSON.parse(cookie.value) as { email: string; role: string };
  } catch {
    // Cookie exists but is malformed — treat as no session
    return null;
  }
}

/**
 * Deletes the session cookie.
 * Called from the Log Out button Server Action.
 */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}