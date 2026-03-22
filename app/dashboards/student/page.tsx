import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { revalidatePath } from "next/cache";
import DeliverButton from "./DeliverButton";
import EditProfileButton from "./EditProfileButton";
import PortfolioSection from "./PortfolioSection";
import ReviewsSection from "./ReviewsSection";
import { logout } from "./actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PortfolioProject {
  id: number;
  title: string;
  description: string;
  type: 'GitHub' | 'Behance' | 'Live' | 'Figma';
  url: string;
  tags: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns colour tokens for the GPA badge.
 * Green = Dean's List (3.7+), Amber = Good Standing (3.0+), Red = below 3.0.
 */
function getGpaStyle(gpa: number): { color: string; bg: string; border: string; label: string } {
  if (gpa >= 3.7) return { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', label: "Dean's List" };
  if (gpa >= 3.0) return { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'Good Standing' };
  return { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', label: 'Needs Attention' };
}

/**
 * Turns "pending" → "Pending", "in_progress" → "In Progress", etc.
 * Used to make raw DB status strings readable in the orders table.
 */
function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Derives two-letter initials from a full name or email prefix.
 * "Menes Adisso" → "MA", "m.adisso@..." → "MA"
 */
function getInitials(nameOrEmail: string): string {
  const base = nameOrEmail.includes('@') ? nameOrEmail.split('@')[0] : nameOrEmail;
  const parts = base.trim().split(/[\s.]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icon = {
  Logo:         () => <svg viewBox="0 0 24 24" fill="white" width={16} height={16}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
  Switch:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" /></svg>,
  Orders:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" /></svg>,
  Plus:         () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" width={14} height={14}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Dots:         () => <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>,
  Edit:         () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  Trash:        () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>,
  Calendar:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  ChevronRight: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><polyline points="9 18 15 12 9 6" /></svg>,
  ExternalLink: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>,
  Github:       () => <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>,
  Figma:        () => <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}><path d="M5 5.5A3.5 3.5 0 018.5 2H12v7H8.5A3.5 3.5 0 015 5.5zm7-3.5h3.5a3.5 3.5 0 110 7H12V2zm0 8.5h3.5a3.5 3.5 0 110 7H12v-7zm-7 3.5A3.5 3.5 0 018.5 10.5H12v7H8.5A3.5 3.5 0 015 14zm3.5 3.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" /></svg>,
  Globe:        () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>,
  Verified:     () => <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
};

// ─── Portfolio Card ───────────────────────────────────────────────────────────

function PortfolioCard({ project }: { project: PortfolioProject }) {
  const typeConfig: Record<PortfolioProject['type'], { icon: React.ReactNode; label: string; color: string; bg: string }> = {
    GitHub:  { icon: <Icon.Github />,  label: 'GitHub',  color: '#0C0A09', bg: '#F5F5F4' },
    Figma:   { icon: <Icon.Figma />,   label: 'Figma',   color: '#8B5CF6', bg: '#F5F3FF' },
    Live:    { icon: <Icon.Globe />,   label: 'Live',    color: '#16A34A', bg: '#F0FDF4' },
    Behance: { icon: <Icon.Globe />,   label: 'Behance', color: '#0061FF', bg: '#EFF6FF' },
  };
  const cfg = typeConfig[project.type];
  return (
    <div style={s.portfolioCard}>
      <div style={s.portfolioCardTop}>
        <span style={{ ...s.portfolioTypeBadge, color: cfg.color, background: cfg.bg }}>
          {cfg.icon}{cfg.label}
        </span>
        <a href={project.url} target="_blank" rel="noopener noreferrer" style={s.portfolioLink}>
          <Icon.ExternalLink />
        </a>
      </div>
      <p style={s.portfolioTitle}>{project.title}</p>
      <p style={s.portfolioDesc}>{project.description}</p>
      <div style={s.portfolioTags}>
        {project.tags.map(tag => <span key={tag} style={s.portfolioTag}>{tag}</span>)}
      </div>
    </div>
  );
}

// ─── Page (Server Component) ──────────────────────────────────────────────────

export default async function StudentDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");
  const userEmail = session.email;

  // ── Fetch user from DB ──────────────────────────────────────────────────────
  const dbUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  // If the email isn't in the DB yet, show a clean error card
  if (!dbUser) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F5F5F4' }}>
        <div style={{ background: 'white', padding: 40, borderRadius: 14, textAlign: 'center', border: '1px solid #E7E5E4', maxWidth: 400 }}>
          <h2 style={{ color: '#DC2626', fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Profile Not Found</h2>
          <p style={{ color: '#78716C', fontSize: '0.85rem' }}>We could not find <strong>{userEmail}</strong> in the database.</p>
          <Link href="/login" style={{ display: 'inline-block', marginTop: 20, background: '#F97316', color: 'white', padding: '9px 20px', borderRadius: 9, fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // ── Server Action — update full_name ────────────────────────────────────────
  // DO NOT TOUCH: this logic is intentionally left exactly as-is.
  async function updateProfileName(formData: FormData) {
    "use server";
    const newName = formData.get("fullName") as string;
    if (!newName) return;
    await prisma.user.update({
      where: { email: userEmail },
      data: { full_name: newName },
    });
    revalidatePath("/dashboards/student");
  }

  // ── Fetch gigs with their active order count ────────────────────────────────
  const dbGigs = await prisma.gig.findMany({
    where: { student_id: dbUser.user_id },
    include: {
      orders: {
        where: { status: { in: ["pending", "in_progress"] } },
      },
    },
    orderBy: { gig_id: "desc" },
  });

  // ── Fetch all orders for this student (as the seller) ──────────────────────
  const dbOrders = await prisma.order.findMany({
    where: { gig: { student_id: dbUser.user_id } },
    include: { buyer: true, gig: true },
    orderBy: { order_id: "desc" },
  });

  // ── Fetch portfolio items for this student ──────────────────────────────────
  const dbPortfolio = await prisma.portfolioItem.findMany({
    where: { student_id: dbUser.user_id },
    orderBy: { portfolio_id: "desc" },
  });

  // ── Fetch reviews for this student ──────────────────────────────────────────
  const dbReviews = await prisma.review.findMany({
    where: { student_id: dbUser.user_id },
    include: {
      reviewer: true, // the business that left the review
      gig:      true, // which gig it was for
    },
    orderBy: { review_id: "desc" },
  });

  // Calculate the average rating once, pass it as a prop
  const avgRating = dbReviews.length > 0
    ? dbReviews.reduce((sum, r) => sum + r.rating, 0) / dbReviews.length
    : undefined;

  // ── Derive computed stats from real DB data ─────────────────────────────────

  // Only orders with these statuses are "active" — shown in the table
  const activeOrders = dbOrders.filter(o =>
    o.status === "pending" || o.status === "in_progress"
  );

  // Earnings and job count come only from fully completed orders
  const completedOrders = dbOrders.filter(o => o.status === "completed");
  const totalEarnings   = completedOrders.reduce((sum, o) => sum + o.gig.price, 0);
  const completedJobs   = completedOrders.length;

  // ── Derive display values from the DB user record ──────────────────────────
  // We use the stored full_name if available, otherwise parse the email prefix.
  const hasName    = dbUser.full_name && dbUser.full_name !== "EMPTY";
  const displayName = hasName
    ? dbUser.full_name!
    : dbUser.email.split('@')[0].split('.').map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

  const initials   = getInitials(dbUser.full_name ?? dbUser.email);
  const hustleScore = dbUser.hustle_score ?? 0;
  const isVerified  = dbUser.is_verified ?? false;

  // GPA is stored on the user record; fall back to null if not set yet
  const gpa      = (dbUser as any).gpa ?? null;
  const gpaStyle = gpa !== null ? getGpaStyle(gpa) : null;

  // Static profile fields — these will come from the DB once the schema
  // has university, cohort, major, bio, and skills columns added.
  const UNIVERSITY = 'African Leadership University';
  const COHORT     = 'Class of 2026';
  const YEAR       = 'Year 2';
  const MAJOR      = 'BSc. Software Engineering';
  const BIO        = 'Full-stack developer with a focus on scalable web applications. Passionate about building products that solve real African problems.';
  const SKILLS     = ['React', 'Next.js', 'PostgreSQL', 'Node.js', 'Figma', 'TypeScript'];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={s.root}>

      {/* ── NAV ──────────────────────────────────────────────── */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <Link href="/" style={s.logo}>
            <div style={s.logoMark}><Icon.Logo /></div>
            <span style={s.logoText}>UniHustle</span>
          </Link>
          <div style={s.navRight}>
            <Link href="#" style={s.switchLink}>
              <Icon.Switch /> Switch to Buying
            </Link>
            <Link href="#" style={s.navLink}>
              <Icon.Orders />
              Orders
              {activeOrders.length > 0 && (
                <span style={s.navBadge}>{activeOrders.length}</span>
              )}
            </Link>
            <button style={s.avatar} aria-label="Profile">{initials}</button>
            <form action={logout} style={{ margin: 0 }}>
              <button type="submit" style={{ ...s.menuItem, color: '#EF4444' }}>
                Log Out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main style={s.main}>
        <div style={s.container}>

          {/* ── PROFILE HEADER ─────────────────────────────────
              Two states:
              1. No name yet → show the "Complete Your Profile" onboarding card
              2. Name exists → show the full styled profile card
          */}
          {!hasName ? (

            // ── ONBOARDING STATE: student hasn't set their name yet ──
            <div style={s.profileCard}>
              <div style={s.profileCardLeft}>
                <div style={{ ...s.profileBigAvatar, background: '#F5F5F4', color: '#A8A29E', fontSize: '1.8rem' }}>
                  ?
                </div>
                <div style={s.profileDetails}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0C0A09', marginBottom: 4 }}>
                    Complete Your Profile
                  </h2>
                  <p style={{ fontSize: '0.83rem', color: '#78716C', marginBottom: 16 }}>
                    What should we call you on UniHustle? This name will be visible to businesses.
                  </p>
                  {/* Server Action form — logic untouched, only styled */}
                  <form action={updateProfileName} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="e.g. Menes Adisso"
                      required
                      style={{
                        padding: '10px 14px',
                        border: '1.5px solid #E7E5E4',
                        borderRadius: 10,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: '0.875rem',
                        color: '#0C0A09',
                        background: 'white',
                        outline: 'none',
                        width: 260,
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: '#F97316', color: 'white', border: 'none',
                        borderRadius: 9, padding: '10px 20px',
                        fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      Save Name
                    </button>
                  </form>
                </div>
              </div>
            </div>

          ) : (

            // ── FULL PROFILE STATE: name is set, show the complete card ──
            <div style={s.profileCard}>
              <div style={s.profileCardLeft}>
                <div style={s.profileBigAvatar}>{initials}</div>
                <div style={s.profileDetails}>
                  <div style={s.profileNameRow}>
                    <h1 style={s.profileDisplayName}>{displayName}</h1>
                    {isVerified && (
                      <div style={s.verifiedPill}>
                        <Icon.Verified />
                        <span>Verified Student</span>
                      </div>
                    )}
                  </div>
                  <div style={s.profileUniRow}>
                    <span style={s.profileUni}>{UNIVERSITY}</span>
                    <span style={s.profileDot}>·</span>
                    <span style={s.profileCohort}>{COHORT}</span>
                    <span style={s.profileDot}>·</span>
                    <span style={s.profileMajor}>{MAJOR}</span>
                  </div>
                  <p style={s.profileBio}>{BIO}</p>
                  <div style={s.profileSkills}>
                    {SKILLS.map(skill => (
                      <span key={skill} style={s.skillPill}>{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={s.profileCardRight}>
                <EditProfileButton
                  studentEmail={userEmail}
                  current={{
                    full_name:     dbUser.full_name ?? "",
                    bio:           (dbUser as any).bio ?? "",
                    major:         (dbUser as any).major ?? "",
                    cohort:        (dbUser as any).cohort ?? "",
                    year_of_study: (dbUser as any).year_of_study ?? "",
                    gpa:           (dbUser as any).gpa?.toString() ?? "",
                    skills:        dbUser.skills ?? [],
                    school:        dbUser.school ?? "",
                  }}
                />
              </div>
            </div>
          )}

          {/* ── STATS ROW ──────────────────────────────────────
              All four values are derived directly from dbOrders and dbUser.
              Nothing here is hardcoded.
          */}
          <div style={s.statsRow} className="stats-row">

            {/* Active Orders — count of pending + in_progress orders */}
            <div style={s.statCard}>
              <div style={s.statIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                  <path d="M9 12h6M9 16h4" />
                </svg>
              </div>
              <div>
                <p style={s.statLabel}>Active Orders</p>
                <p style={s.statValue}>{activeOrders.length}</p>
                <p style={s.statSub}>
                  {activeOrders.length === 0 ? 'Nothing in progress' : 'Currently in progress'}
                </p>
              </div>
            </div>

            {/* Total Earnings — sum of completed order prices */}
            <div style={s.statCard}>
              <div style={s.statIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              </div>
              <div>
                <p style={s.statLabel}>Total Earnings</p>
                <p style={s.statValue}>{totalEarnings.toLocaleString()} RWF</p>
                <p style={s.statSub}>All time</p>
              </div>
            </div>

            {/* Jobs Completed — count of completed orders */}
            <div style={s.statCard}>
              <div style={s.statIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <p style={s.statLabel}>Jobs Completed</p>
                <p style={s.statValue}>{completedJobs}</p>
                <p style={s.statSub}>Paid and delivered</p>
              </div>
            </div>

            {/* Academic GPA — from dbUser.gpa, colour-coded */}
            <div style={s.statCard}>
              <div style={s.statIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <div>
                <p style={s.statLabel}>Academic GPA</p>
                {gpa !== null && gpaStyle ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <p style={s.statValue}>{gpa.toFixed(2)}</p>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 700, borderRadius: 999,
                        padding: '2px 9px', whiteSpace: 'nowrap' as const,
                        color: gpaStyle.color, background: gpaStyle.bg,
                        border: `1px solid ${gpaStyle.border}`,
                      }}>
                        {gpaStyle.label}
                      </span>
                    </div>
                    <p style={s.statSub}>Hustle score: {hustleScore}</p>
                  </>
                ) : (
                  <>
                    <p style={{ ...s.statValue, fontSize: '0.85rem', color: '#A8A29E', fontWeight: 500 }}>Not set</p>
                    <p style={s.statSub}>Add GPA in profile settings</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── ACTIVE ORDERS TABLE ────────────────────────────
              Maps directly over `activeOrders` (the filtered dbOrders array).
              Shows an empty state if no active orders exist.
          */}
          <div style={s.section}>
            <div style={s.sectionHead}>
              <h2 style={s.sectionTitle}>Active Orders</h2>
              <Link href="#" style={s.sectionAction}>
                View all <Icon.ChevronRight />
              </Link>
            </div>

            {activeOrders.length === 0 ? (
              // Empty state — shown when the student has no active orders
              <div style={s.emptyCanvas}>
                <div style={s.emptyCanvasIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#D6D3D1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={32} height={32}>
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                    <path d="M9 12h6M9 16h4" />
                  </svg>
                </div>
                <p style={s.emptyCanvasTitle}>No active orders yet</p>
                <p style={s.emptyCanvasSub}>
                  When a business books one of your gigs, their order will appear here.
                </p>
              </div>
            ) : (
              <div style={s.table}>
                <div style={s.tableHead} className="table-head">
                  <span>Order ID</span>
                  <span>Gig</span>
                  <span>Buyer</span>
                  <span>Status</span>
                  <span>Amount</span>
                  <span></span>
                </div>
                {activeOrders.map((order, i) => {
                  const buyerName = order.buyer.full_name || order.buyer.email.split('@')[0];
                  const buyerInitials = getInitials(order.buyer.full_name ?? order.buyer.email);
                  return (
                    <div
                      key={order.order_id}
                      style={{ ...s.tableRow, ...(i === activeOrders.length - 1 ? { borderBottom: 'none' } : {}) }}
                    >
                      <span style={s.orderId}>#{String(order.order_id).slice(-6).toUpperCase()}</span>
                      <span style={s.orderGig}>{order.gig.title}</span>
                      <div style={s.orderBuyer}>
                        <div style={s.buyerAvatar}>{buyerInitials}</div>
                        <span>{buyerName}</span>
                      </div>
                      <div style={s.orderDue}>
                        <Icon.Calendar />
                        <span>{formatStatus(order.status)}</span>
                      </div>
                      <span style={s.orderAmount}>{order.gig.price.toLocaleString()} RWF</span>
                      <DeliverButton orderId={order.order_id} studentEmail={userEmail} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── MY GIGS ────────────────────────────────────────
              Maps directly over `dbGigs` from Prisma.
              Each card shows real title, category, price,
              and a live count of active orders on that gig.
              Shows an empty state with a CTA if no gigs exist.
          */}
          <div style={s.section}>
            <div style={s.sectionHead}>
              <h2 style={s.sectionTitle}>My Marketplace Gigs</h2>
              <Link
                href={`/dashboards/student/post-gig?email=${encodeURIComponent(userEmail)}`}
                style={s.createBtn}
              >
                <Icon.Plus /> Create a New Gig
              </Link>
            </div>

            {dbGigs.length === 0 ? (
              // Empty state — shown to students who haven't listed a gig yet
              <div style={s.emptyCanvas}>
                <div style={s.emptyCanvasIcon}>
                  <Icon.Plus />
                </div>
                <p style={s.emptyCanvasTitle}>No gigs yet</p>
                <p style={s.emptyCanvasSub}>
                  Create your first gig to start receiving orders from businesses.
                </p>
                <Link
                  href={`/dashboards/student/post-gig?email=${encodeURIComponent(userEmail)}`}
                  style={{
                    marginTop: 8, padding: '9px 20px',
                    background: '#F97316', color: 'white',
                    borderRadius: 9, fontSize: '0.82rem',
                    fontWeight: 700, textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <Icon.Plus /> Post Your First Gig
                </Link>
              </div>
            ) : (
              <div style={s.gigsGrid} className="gigs-grid">
                {dbGigs.map(gig => {
                  const activeGigOrders = gig.orders.length; // already filtered to active statuses
                  return (
                    <div key={gig.gig_id} style={s.gigCard}>
                      <div style={s.gigThumb}>
                        <span style={s.gigThumbLabel}>{gig.category}</span>
                      </div>
                      <div style={s.gigBody}>
                        <p style={s.gigTitle}>{gig.title}</p>
                        <div style={s.gigMeta}>
                          <span style={{
                            ...s.gigOrderPill,
                            ...(activeGigOrders > 0 ? s.gigOrderPillActive : {}),
                          }}>
                            {activeGigOrders > 0
                              ? `${activeGigOrders} active order${activeGigOrders > 1 ? 's' : ''}`
                              : 'No orders yet'}
                          </span>
                        </div>
                      </div>
                      <div style={s.gigFooter}>
                        <div>
                          <span style={s.gigPriceFrom}>Starting at</span>
                          <span style={s.gigPriceVal}>{gig.price.toLocaleString()} RWF</span>
                        </div>
                        <button style={s.iconBtn} aria-label="Options">
                          <Icon.Dots />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── REVIEW CANVAS ──────────────────────────────────
              Dynamically populated from reviews in the database.
          */}
          <div style={s.section}>
            <ReviewsSection
              reviews={dbReviews.map(r => ({
                review_id:   r.review_id,
                comment:     r.comment,
                rating:      r.rating,
                reviewer_id: r.reviewer_id,
                gig_id:      r.gig_id,
                reviewer: {
                  full_name: r.reviewer.full_name,
                  email:     r.reviewer.email,
                  school:    r.reviewer.school,
                },
                gig: {
                  title: r.gig.title,
                },
                created_at: r.created_at,
              }))}
              avgRating={avgRating}
            />
          </div>

          {/* ── ZERO-TO-ONE PORTFOLIO ──────────────────────────
              Dynamically populated from portfolio items in the database.
          */}
          <div style={s.section}>
            <PortfolioSection
              studentEmail={userEmail}
              items={dbPortfolio.map(item => ({
                portfolio_id: item.portfolio_id,
                title:        item.title,
                link:         item.link,
                description:  item.description,
                type:         item.type,
                tags:         item.tags,
              }))}
            />
          </div>

        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #F5F5F4; }
        a { text-decoration: none; color: inherit; }
        button { font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; }
        @media (max-width: 1100px) { .stats-row { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 960px) {
          .gigs-grid { grid-template-columns: 1fr 1fr !important; }
          .portfolio-grid { grid-template-columns: 1fr 1fr !important; }
          .table-head { display: none !important; }
        }
        @media (max-width: 640px) {
          .stats-row { grid-template-columns: 1fr !important; }
          .gigs-grid { grid-template-columns: 1fr !important; }
          .portfolio-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  root: { minHeight: '100vh', background: '#F5F5F4', fontFamily: "'Plus Jakarta Sans', sans-serif", WebkitFontSmoothing: 'antialiased', color: '#0C0A09' },
  nav: { position: 'sticky', top: 0, zIndex: 100, background: 'white', borderBottom: '1px solid #E7E5E4' },
  navInner: { maxWidth: 1160, margin: '0 auto', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' },
  logoMark: { width: 28, height: 28, background: '#F97316', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontWeight: 800, fontSize: '0.95rem', color: '#0C0A09', letterSpacing: '-0.02em' },
  navRight: { display: 'flex', alignItems: 'center', gap: 4 },
  switchLink: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, color: '#44403C', border: '1px solid #E7E5E4', marginRight: 6, textDecoration: 'none' },
  navLink: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, color: '#44403C', textDecoration: 'none' },
  navBadge: { background: '#F97316', color: 'white', fontSize: '0.62rem', fontWeight: 800, borderRadius: 999, padding: '1px 6px' },
  menuItem: { display: 'inline-flex', alignItems: 'center', border: 'none', background: 'transparent', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', marginLeft: 8 },
  avatar: { width: 32, height: 32, borderRadius: 999, background: '#0C0A09', color: 'white', border: 'none', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: 8 },
  main: { padding: '32px 0 80px' },
  container: { maxWidth: 1160, margin: '0 auto', padding: '0 28px' },
  profileCard: { background: 'white', border: '1px solid #E7E5E4', borderRadius: 14, padding: '28px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 },
  profileCardLeft: { display: 'flex', alignItems: 'flex-start', gap: 20, flex: 1, minWidth: 0 },
  profileCardRight: { flexShrink: 0 },
  profileBigAvatar: { width: 64, height: 64, borderRadius: 999, background: '#0C0A09', color: 'white', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  profileDetails: { flex: 1, minWidth: 0 },
  profileNameRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5, flexWrap: 'wrap' as const },
  profileDisplayName: { fontSize: '1.25rem', fontWeight: 800, color: '#0C0A09', letterSpacing: '-0.025em' },
  verifiedPill: { display: 'inline-flex', alignItems: 'center', gap: 5, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 999, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700, color: '#16A34A' },
  profileUniRow: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, flexWrap: 'wrap' as const },
  profileUni: { fontSize: '0.82rem', fontWeight: 700, color: '#44403C' },
  profileDot: { fontSize: '0.72rem', color: '#D6D3D1' },
  profileCohort: { fontSize: '0.78rem', fontWeight: 600, color: '#F97316' },
  profileMajor: { fontSize: '0.78rem', color: '#A8A29E' },
  profileBio: { fontSize: '0.83rem', color: '#78716C', lineHeight: 1.6, marginBottom: 14, maxWidth: 560 },
  profileSkills: { display: 'flex', flexWrap: 'wrap' as const, gap: 6 },
  skillPill: { fontSize: '0.72rem', fontWeight: 600, color: '#44403C', background: '#F5F5F4', border: '1px solid #E7E5E4', borderRadius: 999, padding: '3px 11px' },
  editProfileBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #E7E5E4', borderRadius: 8, padding: '7px 14px', fontSize: '0.8rem', fontWeight: 600, color: '#44403C' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 },
  statCard: { background: 'white', border: '1px solid #E7E5E4', borderRadius: 12, padding: '20px 22px', display: 'flex', alignItems: 'flex-start', gap: 14 },
  statIcon: { width: 38, height: 38, borderRadius: 9, background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  statLabel: { fontSize: '0.72rem', fontWeight: 600, color: '#A8A29E', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 },
  statValue: { fontSize: '1.3rem', fontWeight: 800, color: '#0C0A09', letterSpacing: '-0.025em', lineHeight: 1, marginBottom: 4 },
  statSub: { fontSize: '0.73rem', color: '#A8A29E', fontWeight: 500 },
  section: { marginBottom: 32 },
  sectionHead: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 12 },
  sectionTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#0C0A09', letterSpacing: '-0.01em' },
  sectionDesc: { fontSize: '0.78rem', color: '#A8A29E', marginTop: 2 },
  sectionAction: { display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 600, color: '#78716C', textDecoration: 'none', flexShrink: 0 },
  createBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F97316', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700, flexShrink: 0, textDecoration: 'none' },
  table: { background: 'white', border: '1px solid #E7E5E4', borderRadius: 12, overflow: 'hidden' },
  tableHead: { display: 'grid', gridTemplateColumns: '90px 1fr 180px 150px 130px 90px', gap: 12, padding: '11px 20px', background: '#FAFAFA', borderBottom: '1px solid #E7E5E4', fontSize: '0.68rem', fontWeight: 700, color: '#A8A29E', textTransform: 'uppercase' as const, letterSpacing: '0.07em' },
  tableRow: { display: 'grid', gridTemplateColumns: '90px 1fr 180px 150px 130px 90px', gap: 12, padding: '15px 20px', alignItems: 'center', borderBottom: '1px solid #F5F5F4', fontSize: '0.83rem', color: '#1C1917' },
  orderId: { fontWeight: 700, color: '#F97316', fontSize: '0.8rem' },
  orderGig: { fontWeight: 600, color: '#0C0A09' },
  orderBuyer: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#44403C' },
  buyerAvatar: { width: 26, height: 26, borderRadius: 999, background: '#F5F5F4', border: '1px solid #E7E5E4', color: '#44403C', fontSize: '0.58rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  orderDue: { display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#78716C', fontWeight: 500 },
  orderAmount: { fontWeight: 700, fontSize: '0.83rem', color: '#0C0A09' },
  deliverBtn: { background: '#0C0A09', color: 'white', border: 'none', borderRadius: 7, padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700 },
  gigsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  gigCard: { background: 'white', border: '1px solid #E7E5E4', borderRadius: 12, overflow: 'hidden' },
  gigThumb: { height: 130, background: '#F5F5F4', display: 'flex', alignItems: 'flex-end', padding: '10px 12px', borderBottom: '1px solid #E7E5E4' },
  gigThumbLabel: { fontSize: '0.65rem', fontWeight: 700, color: '#78716C', textTransform: 'uppercase' as const, letterSpacing: '0.07em', background: 'white', border: '1px solid #E7E5E4', borderRadius: 999, padding: '3px 10px' },
  gigBody: { padding: '14px 16px 10px' },
  gigTitle: { fontSize: '0.86rem', fontWeight: 600, color: '#0C0A09', lineHeight: 1.45, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' },
  gigMeta: { display: 'flex', alignItems: 'center' },
  gigOrderPill: { fontSize: '0.68rem', fontWeight: 600, padding: '3px 9px', borderRadius: 999, background: '#F5F5F4', color: '#78716C', border: '1px solid #E7E5E4' },
  gigOrderPillActive: { background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' },
  gigFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 14px', borderTop: '1px solid #F5F5F4' },
  gigPriceFrom: { fontSize: '0.68rem', color: '#A8A29E', display: 'block', marginBottom: 1 },
  gigPriceVal: { fontSize: '0.9rem', fontWeight: 800, color: '#0C0A09' },
  iconBtn: { background: 'none', border: '1px solid #E7E5E4', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#78716C', cursor: 'pointer' },
  emptyCanvas: { background: 'white', border: '1px dashed #E7E5E4', borderRadius: 12, padding: '48px 24px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8, textAlign: 'center' as const },
  emptyCanvasIcon: { width: 52, height: 52, borderRadius: 12, background: '#F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4, color: '#D6D3D1' },
  emptyCanvasTitle: { fontSize: '0.92rem', fontWeight: 700, color: '#0C0A09' },
  emptyCanvasSub: { fontSize: '0.8rem', color: '#A8A29E', lineHeight: 1.6, maxWidth: 380 },
  reviewsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 },
  reviewCard: { background: 'white', border: '1px solid #E7E5E4', borderRadius: 12, padding: '18px' },
  reviewTop: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  reviewAvatar: { width: 32, height: 32, borderRadius: 999, background: '#F5F5F4', border: '1px solid #E7E5E4', fontSize: '0.62rem', fontWeight: 800, color: '#44403C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  reviewCompany: { fontSize: '0.82rem', fontWeight: 700, color: '#0C0A09' },
  reviewRole: { fontSize: '0.72rem', color: '#A8A29E', marginTop: 1 },
  reviewDate: { fontSize: '0.72rem', color: '#A8A29E', marginLeft: 'auto' },
  reviewText: { fontSize: '0.82rem', color: '#44403C', lineHeight: 1.6 },
  portfolioGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  portfolioCard: { background: 'white', border: '1px solid #E7E5E4', borderRadius: 12, padding: '18px', display: 'flex', flexDirection: 'column' as const, gap: 10 },
  portfolioCardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  portfolioTypeBadge: { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', fontWeight: 700, borderRadius: 999, padding: '3px 10px', border: '1px solid currentColor' },
  portfolioLink: { width: 28, height: 28, borderRadius: 7, border: '1px solid #E7E5E4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#78716C', textDecoration: 'none' },
  portfolioTitle: { fontSize: '0.88rem', fontWeight: 700, color: '#0C0A09', lineHeight: 1.35 },
  portfolioDesc: { fontSize: '0.8rem', color: '#78716C', lineHeight: 1.6, flex: 1 },
  portfolioTags: { display: 'flex', flexWrap: 'wrap' as const, gap: 5 },
  portfolioTag: { fontSize: '0.65rem', fontWeight: 600, color: '#78716C', background: '#F5F5F4', border: '1px solid #E7E5E4', borderRadius: 6, padding: '2px 8px' },
  portfolioAddCard: { background: 'none', border: '1.5px dashed #E7E5E4', borderRadius: 12, padding: '24px 18px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', textAlign: 'center' as const },
  portfolioAddIcon: { width: 36, height: 36, borderRadius: 999, background: '#F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A8A29E' },
  portfolioAddText: { fontSize: '0.83rem', fontWeight: 600, color: '#44403C' },
  portfolioAddSub: { fontSize: '0.73rem', color: '#A8A29E' },
};