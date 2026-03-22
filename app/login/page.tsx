"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
type VerifyCodeResponse = {
  message?: string;
  error?: string;
  user?: {
    role: "student" | "business";
  };
};

/**
 * The main authentication page for UniHustle.
 *
 * There is no traditional "sign up" or "log in" distinction here.
 * The backend handles everything automatically:
 * - If the email is new, a user account is created on the fly.
 * - If the email already exists, the user is simply logged back in.
 *
 * Both paths end up at the same place: a 6-digit OTP sent to the user's inbox.
 *
 * The only thing we ask upfront is the user's role (Student or Business)
 * so we can route them to the right dashboard after verification,
 * and apply the correct email validation rules.
 */
export default function AuthPage() {
  const router = useRouter();

  // ── Form state ─────────────────────────────────────────────────────────────

  // We track the email and role before the code is sent,
  // and the OTP code itself after it arrives.
  const [email, setEmail]   = useState("");
  const [role, setRole]     = useState<"student" | "business">("student");
  const [code, setCode]     = useState("");

  // ── UI state ───────────────────────────────────────────────────────────────

  // step 1 = email entry, step 2 = OTP entry.
  // We keep it as a number so it's easy to extend if needed.
  const [step, setStep]           = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");
  const [devCodeHint, setDevCodeHint] = useState("");
  const [showPassword, setShowPassword] = useState(false); // toggles OTP visibility

  // ── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Clears the error banner and goes back to step 1 so the user
   * can change their email if they made a typo.
   */
  const handleGoBack = () => {
    setError("");
    setCode("");
    setStep(1);
  };

  // ── Step 1: Send the OTP ───────────────────────────────────────────────────

  /**
   * Fires when the user submits their email.
   *
   * Sends a POST to /api/auth/request-code with the email and role.
   * The backend will:
   *   - Check if the email exists in the User table.
   *   - Create a new row if not (auto-signup).
   *   - Generate a 6-digit code, save it to the DB, and email it.
   *
   * On success we just move to step 2. No need to tell the user
   * whether they're "new" or "returning" — it doesn't matter to them.
   */
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setDevCodeHint("");

    try {
      const res = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        // The backend sends back a human-readable error string.
        // This could be "Invalid ALU email" or "Server error", etc.
        throw new Error(data.error || "Failed to send code. Please try again.");
      }

      if (data.devCode) {
        setDevCodeHint(`Local dev code: ${data.devCode}`);
      }
      setStep(2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to send verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Verify the OTP ─────────────────────────────────────────────────

  /**
   * Fires when the user submits their 6-digit code.
   *
   * Sends a POST to /api/auth/verify-code with the email and code.
   * The backend will:
   *   - Look up the user by email.
   *   - Compare the submitted code to the one stored in verification_code.
   *   - Clear the code from the DB once verified (one-time use).
   *   - Return a session token or set an auth cookie.
   *
   * On success we redirect based on role.
   * Students go to their seller dashboard, businesses to the buyer dashboard.
   */
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res  = await fetch("/api/auth/verify-code", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Cookie is now set — redirect based on role from DB
      router.push(data.role === "business"
        ? "/dashboards/business"
        : "/dashboards/student"
      );

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="auth-root">

      {/* ── LEFT PANEL ─────────────────────────────────────────────────────────
          Decorative panel — only visible on screens wider than 900px.
          Contains the brand quote, stats, and the ALU verified note.
      */}
      <div className="auth-left">
        <div className="auth-left-grid" aria-hidden />

        <Link href="/" className="auth-logo">
          <div className="auth-logo-mark">
            <svg viewBox="0 0 24 24" fill="white" width={18} height={18}>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span>UniHustle</span>
        </Link>

        <div className="auth-left-content">
          <div className="auth-left-tag">ALU Rwanda · 2026 Pilot</div>
          <blockquote className="auth-quote">
            &ldquo;Break the experience paradox. Build your portfolio{" "}
            <em>before graduation.</em>&rdquo;
          </blockquote>
          <p className="auth-left-sub">
            The merit-based freelance marketplace built exclusively for ALU students
            and Rwandan businesses.
          </p>
          <div className="auth-stats">
            <div className="auth-stat-pill">
              <span className="auth-stat-num">200+</span>
              <span className="auth-stat-label">ALU students</span>
            </div>
            <div className="auth-stat-pill">
              <span className="auth-stat-num">85+</span>
              <span className="auth-stat-label">businesses</span>
            </div>
            <div className="auth-stat-pill">
              <span className="auth-stat-num">4.9</span>
              <span className="auth-stat-label">avg. satisfaction</span>
            </div>
          </div>
        </div>

        <div className="auth-left-footer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Verified @alustudent.com accounts only
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────────────
          The actual form lives here.
          It renders two distinct views based on `step`:
            Step 1 → Role selector + Email input
            Step 2 → 6-digit OTP input
      */}
      <div className="auth-right">
        <div className="auth-form-wrap">

          {/* Brand mark — visible on mobile where the left panel is hidden */}
          <div className="auth-mobile-logo">
            <div className="auth-logo-mark">
              <svg viewBox="0 0 24 24" fill="white" width={16} height={16}>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span>UniHustle</span>
          </div>

          {/* ── ERROR BANNER ─────────────────────────────────────────────────
              Appears above the form whenever the API returns an error.
              Cleared automatically when the user starts a new request.
          */}
          {error && (
            <div className="auth-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}
          {devCodeHint && (
            <div className="auth-email-badge" style={{ marginBottom: 12 }}>
              <span>{devCodeHint}</span>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              STEP 1 — Email & Role
              The user picks their role and types their email.
              No password. No "create account" vs "log in" distinction.
              Everything is handled by the backend from here.
          ════════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <>
              <div className="auth-form-head">
                <h1 className="auth-form-title">Welcome to UniHustle</h1>
                <p className="auth-form-sub">
                  Enter your email to get started. We&rsquo;ll send you a quick verification
                  code — no password needed.
                </p>
              </div>

              {/* Role selector — students need an @alustudent.com address,
                  businesses can use any work email. This drives both the
                  email placeholder text and the post-verification redirect. */}
              <div className="auth-role-toggle">
                <button
                  className={`auth-role-btn${role === "student" ? " active" : ""}`}
                  onClick={() => setRole("student")}
                  type="button"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                  I&rsquo;m a Student
                </button>
                <button
                  className={`auth-role-btn${role === "business" ? " active" : ""}`}
                  onClick={() => setRole("business")}
                  type="button"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                  </svg>
                  I&rsquo;m a Business
                </button>
              </div>

              <form className="auth-form" onSubmit={handleSendCode}>
                <div className="auth-field">
                  <label className="auth-label">Email Address</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      className="auth-input has-icon"
                      placeholder={
                        role === "student" ? "yourname@alustudent.com" : "you@company.com"
                      }
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>

                  {/* Shown only for students — a small reassurance that
                      the ALU email requirement is intentional and enforced. */}
                  {role === "student" && (
                    <div className="auth-trust-badge">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={11} height={11}>
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Requires a verified @alustudent.com email
                    </div>
                  )}
                </div>

                <button type="submit" className="auth-submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="auth-spinner" />
                      Sending code...
                    </>
                  ) : (
                    <>
                      Send Verification Code
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>

                {/* Divider + OAuth
                    These are supplementary sign-in options.
                    They should hit the same backend logic — just via OAuth tokens
                    instead of email codes. */}
                <div className="auth-divider"><span>or continue with</span></div>
                <div className="auth-oauth">
                  <button type="button" className="auth-oauth-btn">
                    <svg viewBox="0 0 24 24" width={18} height={18}>
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>
                  <button type="button" className="auth-oauth-btn">
                    <svg viewBox="0 0 24 24" fill="#0A66C2" width={18} height={18}>
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                    LinkedIn
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ════════════════════════════════════════════════════════════════
              STEP 2 — OTP Verification
              The user receives a 6-digit code by email and types it here.
              We show which address we sent it to for clarity.
              The "back" link lets them correct a typo without refreshing.
          ════════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <>
              <div className="auth-form-head">
                <h1 className="auth-form-title">Check your inbox</h1>
                <p className="auth-form-sub">
                  We sent a 6-digit code to{" "}
                  <strong style={{ color: "#0C0A09" }}>{email}</strong>.
                  It expires in 10 minutes.
                </p>
              </div>

              {/* Visual indicator of which email the code went to */}
              <div className="auth-email-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>{email}</span>
                {/* Go back lets the user fix a typo in their email
                    without having to hard-refresh the page. */}
                <button type="button" className="auth-change-email" onClick={handleGoBack}>
                  Change
                </button>
              </div>

              <form className="auth-form" onSubmit={handleVerifyCode}>
                <div className="auth-field">
                  <label className="auth-label">Verification Code</label>
                  <div className="auth-input-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="auth-input auth-otp-input has-toggle"
                      placeholder="· · · · · ·"
                      value={code}
                      onChange={(e) => {
                        // Only allow digits, max 6 characters
                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setCode(val);
                      }}
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      autoFocus
                      required
                    />
                    {/* Toggle to reveal the code digits — useful on mobile
                        where fat-finger errors are common. */}
                    <button
                      type="button"
                      className="auth-pw-toggle"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide code" : "Show code"}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Character counter — gives the user a clear signal
                      of how many digits they have left to type. */}
                  <p className="auth-code-hint">{code.length} / 6 digits entered</p>
                </div>

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={isLoading || code.length < 6}
                >
                  {isLoading ? (
                    <>
                      <span className="auth-spinner" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify &amp; Continue
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>

                {/* Resend option — calls handleSendCode again on the same email.
                    We reuse the same function to avoid duplicating the API call logic. */}
                <p className="auth-resend">
                  Didn&rsquo;t receive it?{" "}
                  <button
                    type="button"
                    className="auth-switch-btn"
                    onClick={handleSendCode}
                    disabled={isLoading}
                  >
                    Resend code
                  </button>
                </p>
              </form>
            </>
          )}

        </div>
      </div>

      {/* ── STYLES ─────────────────────────────────────────────────────────────
          All styles are scoped inside this component via a <style> tag.
          We use BEM-inspired class names (auth-*) to avoid conflicts with
          the rest of the app, which uses Tailwind.
      */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          display: flex;
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* ── LEFT PANEL ── */
        .auth-left {
          position: relative;
          width: 45%;
          background: #0C0A09;
          display: flex;
          flex-direction: column;
          padding: 36px 48px;
          overflow: hidden;
        }
        @media (max-width: 900px) { .auth-left { display: none; } }

        .auth-left-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }
        .auth-left::after {
          content: '';
          position: absolute;
          bottom: -120px;
          left: -80px;
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, rgba(249,115,22,0.13) 0%, transparent 65%);
          pointer-events: none;
        }

        .auth-logo {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 9px;
          text-decoration: none;
          font-weight: 800;
          font-size: 1rem;
          color: white;
          letter-spacing: -0.02em;
        }
        .auth-logo-mark {
          width: 32px; height: 32px;
          background: #F97316;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .auth-left-content {
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .auth-left-tag {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #F97316;
          margin-bottom: 24px;
        }

        .auth-quote {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(1.9rem, 2.8vw, 2.8rem);
          line-height: 1.18;
          letter-spacing: -0.025em;
          color: white;
          font-style: normal;
          margin-bottom: 20px;
        }
        .auth-quote em { color: #F97316; font-style: italic; }

        .auth-left-sub {
          font-size: 0.88rem;
          line-height: 1.7;
          color: rgba(255,255,255,0.38);
          max-width: 340px;
          margin-bottom: 40px;
        }

        .auth-stats {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .auth-stat-pill {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 999px;
          padding: 8px 18px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .auth-stat-num { font-weight: 800; font-size: 0.95rem; color: white; }
        .auth-stat-label { font-size: 0.75rem; color: rgba(255,255,255,0.4); }

        .auth-left-footer {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.28);
        }

        /* ── RIGHT PANEL ── */
        .auth-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          padding: 40px 24px;
        }

        .auth-form-wrap {
          width: 100%;
          max-width: 420px;
        }

        /* Mobile logo — only shows when the left panel is hidden */
        .auth-mobile-logo {
          display: none;
          align-items: center;
          gap: 9px;
          font-weight: 800;
          font-size: 1rem;
          color: #0C0A09;
          letter-spacing: -0.02em;
          margin-bottom: 32px;
        }
        @media (max-width: 900px) { .auth-mobile-logo { display: flex; } }

        /* Error banner */
        .auth-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #DC2626;
          font-size: 0.82rem;
          font-weight: 500;
          padding: 10px 14px;
          border-radius: 10px;
          margin-bottom: 20px;
        }

        .auth-form-head { margin-bottom: 24px; }
        .auth-form-title {
          font-size: 1.55rem;
          font-weight: 800;
          color: #0C0A09;
          letter-spacing: -0.03em;
          margin-bottom: 6px;
        }
        .auth-form-sub { font-size: 0.85rem; color: #78716C; line-height: 1.6; }

        /* Role toggle */
        .auth-role-toggle {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
        }
        .auth-role-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 10px 16px;
          border-radius: 10px;
          border: 1.5px solid #E7E5E4;
          background: white;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          color: #78716C;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .auth-role-btn.active {
          border-color: #F97316;
          color: #F97316;
          background: #FFF7ED;
        }

        /* Form */
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .auth-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #1C1917;
          letter-spacing: 0.01em;
        }
        .auth-input-wrap { position: relative; }
        .auth-input-icon {
          position: absolute;
          left: 14px; top: 50%;
          transform: translateY(-50%);
          color: #A8A29E;
          pointer-events: none;
          display: flex;
          align-items: center;
        }
        .auth-input {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #E7E5E4;
          border-radius: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.875rem;
          color: #0C0A09;
          background: white;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .auth-input.has-icon { padding-left: 42px; }
        .auth-input.has-toggle { padding-right: 44px; }
        .auth-input::placeholder { color: #A8A29E; }
        .auth-input:focus {
          border-color: #F97316;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.12);
        }

        /* OTP input — large centered digits */
        .auth-otp-input {
          text-align: center;
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: 0.22em;
          padding: 14px 44px 14px 14px;
          color: #0C0A09;
        }

        .auth-code-hint {
          font-size: 0.72rem;
          color: #A8A29E;
          font-weight: 500;
        }

        .auth-pw-toggle {
          position: absolute;
          right: 13px; top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #A8A29E;
          display: flex;
          align-items: center;
          padding: 2px;
          transition: color 0.15s;
        }
        .auth-pw-toggle:hover { color: #0C0A09; }

        /* Email-sent badge shown on step 2 */
        .auth-email-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #FFF7ED;
          border: 1px solid #FED7AA;
          border-radius: 10px;
          padding: 11px 14px;
          margin-bottom: 20px;
          font-size: 0.83rem;
          font-weight: 600;
          color: #44403C;
        }
        .auth-change-email {
          margin-left: auto;
          background: none;
          border: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          color: #F97316;
          cursor: pointer;
        }

        /* Trust badge for student emails */
        .auth-trust-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          font-weight: 600;
          color: #16A34A;
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          padding: 3px 9px;
          border-radius: 999px;
          width: fit-content;
        }

        /* Submit button */
        .auth-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 13px;
          background: #F97316;
          color: white;
          border: none;
          border-radius: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(249,115,22,0.28);
          margin-top: 4px;
        }
        .auth-submit:hover:not(:disabled) {
          background: #EA580C;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(249,115,22,0.35);
        }
        .auth-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        /* Loading spinner inside the button */
        .auth-spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: white;
          border-radius: 50%;
          animation: auth-spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes auth-spin { to { transform: rotate(360deg); } }

        /* Divider */
        .auth-divider {
          position: relative;
          text-align: center;
          margin: 4px 0;
        }
        .auth-divider::before {
          content: '';
          position: absolute;
          top: 50%; left: 0; right: 0;
          height: 1px;
          background: #E7E5E4;
        }
        .auth-divider span {
          position: relative;
          background: white;
          padding: 0 12px;
          font-size: 0.75rem;
          color: #A8A29E;
          font-weight: 500;
        }

        /* OAuth buttons */
        .auth-oauth {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .auth-oauth-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          border: 1.5px solid #E7E5E4;
          border-radius: 10px;
          background: white;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.83rem;
          font-weight: 600;
          color: #1C1917;
          cursor: pointer;
          transition: border-color 0.2s, background 0.15s;
        }
        .auth-oauth-btn:hover {
          border-color: #A8A29E;
          background: #FAFAFA;
        }

        /* Resend + switch links */
        .auth-resend {
          text-align: center;
          font-size: 0.82rem;
          color: #78716C;
          margin-top: 4px;
        }
        .auth-switch-btn {
          background: none;
          border: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          color: #F97316;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .auth-switch-btn:hover:not(:disabled) { opacity: 0.75; }
        .auth-switch-btn:disabled { opacity: 0.45; cursor: not-allowed; }
      `}</style>
    </div>
  );
}