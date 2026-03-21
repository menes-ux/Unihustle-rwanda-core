'use client';

import { useState } from 'react';
import Link from 'next/link';

type Mode = 'login' | 'register';
type Role = 'student' | 'business';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState<Role>('student');
  const [showPassword, setShowPassword] = useState(false);

  const isRegister = mode === 'register';
  const isStudent = role === 'student';

  return (
    <div className="auth-root">
      {/* ── LEFT PANEL ─────────────────────────────────────── */}
      <div className="auth-left">
        {/* Subtle grid texture */}
        <div className="auth-left-grid" aria-hidden />

        {/* Logo */}
        <Link href="/" className="auth-logo">
          <div className="auth-logo-mark">
            <svg viewBox="0 0 24 24" fill="white" width={18} height={18}>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span>UniHustle</span>
        </Link>

        {/* Main quote */}
        <div className="auth-left-content">
          <div className="auth-left-tag">ALU Rwanda · 2026 Pilot</div>
          <blockquote className="auth-quote">
            "Break the experience paradox. Build your portfolio{' '}
            <em>before graduation.</em>"
          </blockquote>
          <p className="auth-left-sub">
            The merit-based freelance marketplace built exclusively for ALU students and Rwandan businesses.
          </p>

          {/* Floating stat pills */}
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
              <span className="auth-stat-label">avg. rating</span>
            </div>
          </div>
        </div>

        {/* Bottom ALU badge */}
        <div className="auth-left-footer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Verified @alustudent.com accounts only
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────── */}
      <div className="auth-right">
        <div className="auth-form-wrap">

          {/* Mode toggle: Login / Register */}
          <div className="auth-mode-tabs">
            <button
              className={`auth-mode-tab${mode === 'login' ? ' active' : ''}`}
              onClick={() => setMode('login')}
            >
              Log In
            </button>
            <button
              className={`auth-mode-tab${mode === 'register' ? ' active' : ''}`}
              onClick={() => setMode('register')}
            >
              Sign Up
            </button>
          </div>

          {/* Heading */}
          <div className="auth-form-head">
            <h1 className="auth-form-title">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="auth-form-sub">
              {isRegister
                ? 'Join the community — it only takes a minute.'
                : 'Log in to your UniHustle dashboard.'}
            </p>
          </div>

          {/* Role toggle (register only) */}
          {isRegister && (
            <div className="auth-role-toggle">
              <button
                className={`auth-role-btn${isStudent ? ' active' : ''}`}
                onClick={() => setRole('student')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                Student
              </button>
              <button
                className={`auth-role-btn${!isStudent ? ' active' : ''}`}
                onClick={() => setRole('business')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                </svg>
                Business
              </button>
            </div>
          )}

          {/* Form */}
          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>

            {/* Register-only: name fields */}
            {isRegister && (
              <>
                {isStudent ? (
                  <div className="auth-field">
                    <label className="auth-label">Full Name</label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="Your full name"
                      autoComplete="name"
                    />
                  </div>
                ) : (
                  <div className="auth-field">
                    <label className="auth-label">Company Name</label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="Your company name"
                      autoComplete="organization"
                    />
                  </div>
                )}
              </>
            )}

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label">
                {isRegister && !isStudent ? 'Work Email' : 'Email'}
              </label>
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
                    isRegister && !isStudent
                      ? 'you@company.com'
                      : 'yourname@alustudent.com'
                  }
                  autoComplete="email"
                />
              </div>
              {/* Trust badge — student only */}
              {(!isRegister || isStudent) && (
                <div className="auth-trust-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={11} height={11}>
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Requires verified ALU student email
                </div>
              )}
            </div>

            {/* Password */}
            <div className="auth-field">
              <div className="auth-label-row">
                <label className="auth-label">Password</label>
                {!isRegister && (
                  <a href="#" className="auth-forgot">Forgot password?</a>
                )}
              </div>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input has-icon has-toggle"
                  placeholder={isRegister ? 'Create a strong password' : 'Enter your password'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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
            </div>

            {/* Register: confirm password */}
            {isRegister && (
              <div className="auth-field">
                <label className="auth-label">Confirm Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    className="auth-input has-icon"
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {/* Register: terms */}
            {isRegister && (
              <label className="auth-terms">
                <input type="checkbox" className="auth-checkbox" />
                <span>
                  I agree to the{' '}
                  <a href="#" className="auth-link">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="auth-link">Privacy Policy</a>
                </span>
              </label>
            )}

            {/* Submit */}
            <button type="submit" className="auth-submit">
              {isRegister
                ? isStudent
                  ? 'Create Student Account'
                  : 'Create Business Account'
                : 'Log In to UniHustle'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            {/* Divider */}
            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            {/* OAuth */}
            <div className="auth-oauth">
              <button type="button" className="auth-oauth-btn">
                {/* Google */}
                <svg viewBox="0 0 24 24" width={18} height={18}>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button type="button" className="auth-oauth-btn">
                {/* LinkedIn */}
                <svg viewBox="0 0 24 24" fill="#0A66C2" width={18} height={18}>
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
                LinkedIn
              </button>
            </div>
          </form>

          {/* Mode switch link */}
          <p className="auth-switch">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              className="auth-switch-btn"
              onClick={() => setMode(isRegister ? 'login' : 'register')}
            >
              {isRegister ? 'Log in' : 'Sign up free'}
            </button>
          </p>
        </div>
      </div>

      {/* ── STYLES ─────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          display: flex;
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* ── LEFT ── */
        .auth-left {
          position: relative;
          width: 45%;
          background: #0C0A09;
          display: flex;
          flex-direction: column;
          padding: 36px 48px 36px;
          overflow: hidden;
        }
        @media (max-width: 900px) { .auth-left { display: none; } }

        /* subtle dot-grid texture */
        .auth-left-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }
        /* orange glow */
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
          width: 32px;
          height: 32px;
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
        .auth-quote em {
          color: #F97316;
          font-style: italic;
        }

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
        .auth-stat-num {
          font-weight: 800;
          font-size: 0.95rem;
          color: white;
        }
        .auth-stat-label {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.4);
        }

        .auth-left-footer {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.28);
        }

        /* ── RIGHT ── */
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

        /* Mode tabs */
        .auth-mode-tabs {
          display: flex;
          background: #F5F5F4;
          border-radius: 999px;
          padding: 4px;
          margin-bottom: 32px;
        }
        .auth-mode-tab {
          flex: 1;
          padding: 9px;
          border-radius: 999px;
          border: none;
          background: transparent;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          color: #78716C;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s;
        }
        .auth-mode-tab.active {
          background: white;
          color: #0C0A09;
          box-shadow: 0 1px 6px rgba(0,0,0,0.1);
        }

        .auth-form-head {
          margin-bottom: 24px;
        }
        .auth-form-title {
          font-size: 1.55rem;
          font-weight: 800;
          color: #0C0A09;
          letter-spacing: -0.03em;
          margin-bottom: 5px;
        }
        .auth-form-sub {
          font-size: 0.85rem;
          color: #78716C;
        }

        /* Role toggle */
        .auth-role-toggle {
          display: flex;
          gap: 10px;
          margin-bottom: 22px;
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

        .auth-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .auth-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #1C1917;
          letter-spacing: 0.01em;
        }

        .auth-forgot {
          font-size: 0.78rem;
          font-weight: 600;
          color: #F97316;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .auth-forgot:hover { opacity: 0.75; }

        .auth-input-wrap {
          position: relative;
        }
        .auth-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
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
        .auth-input.has-toggle { padding-right: 42px; }
        .auth-input::placeholder { color: #A8A29E; }
        .auth-input:focus {
          border-color: #F97316;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.12);
        }

        .auth-pw-toggle {
          position: absolute;
          right: 13px;
          top: 50%;
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

        /* Trust badge */
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

        /* Terms */
        .auth-terms {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.8rem;
          color: #78716C;
          line-height: 1.55;
          cursor: pointer;
        }
        .auth-checkbox {
          width: 15px;
          height: 15px;
          margin-top: 1px;
          flex-shrink: 0;
          accent-color: #F97316;
          cursor: pointer;
        }
        .auth-link {
          color: #F97316;
          text-decoration: none;
          font-weight: 600;
        }
        .auth-link:hover { text-decoration: underline; }

        /* Submit */
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
        .auth-submit:hover {
          background: #EA580C;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(249,115,22,0.35);
        }
        .auth-submit:active { transform: translateY(0); }

        /* Divider */
        .auth-divider {
          position: relative;
          text-align: center;
          margin: 4px 0;
        }
        .auth-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0; right: 0;
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

        /* OAuth */
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

        /* Switch link */
        .auth-switch {
          text-align: center;
          margin-top: 22px;
          font-size: 0.82rem;
          color: #78716C;
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
        .auth-switch-btn:hover { opacity: 0.75; }
      `}</style>
    </div>
  );
}