import { prisma } from "@/lib/db";
import Link from 'next/link';
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PortfolioProject {
  id: number;
  title: string;
  description: string;
  type: 'GitHub' | 'Behance' | 'Live' | 'Figma';
  url: string;
  tags: string[];
}

// ─── Static placeholder portfolio ─────────────────────────────────────────────
// These will be replaced once portfolio_projects is added to the Prisma schema.

const PORTFOLIO: PortfolioProject[] = [
  { id: 1, title: 'UniHustle Rwanda', description: 'A full-stack freelance marketplace for ALU students and local businesses.', type: 'GitHub', url: 'https://github.com', tags: ['Next.js', 'Supabase', 'TypeScript'] },
  { id: 2, title: 'Kigali Events App', description: 'Mobile-first event discovery app for Kigali.', type: 'Live', url: 'https://example.com', tags: ['React Native', 'Node.js', 'Maps API'] },
  { id: 3, title: 'Brand System — TechHub RW', description: 'Complete brand identity system including logo, typography, and UI kit.', type: 'Figma', url: 'https://figma.com', tags: ['Figma', 'Branding', 'UI Kit'] },
];

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

export default async function StudentDashboard({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const userEmail = params.email || "m.adisso@alustudent.com";

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
          </div>
        </div>
      </nav>

      <main style={s.main}>
        <div style={s.container}></div>

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
                <button style={s.editProfileBtn}>
                  <Icon.Edit /> Edit Profile
                </button>
              </div>
            </div>
          )}

{/* ── STATS ROW ──────────────────────────────────────
              All four values are derived directly from dbOrders and dbUser.
              Nothing here is hardcoded.
          */}
          <div style={s.statsRow}>

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
                <div style={s.tableHead}>
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
                      <button style={s.deliverBtn}>Deliver</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>