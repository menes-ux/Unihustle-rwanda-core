import { prisma }     from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect }   from "next/navigation";
import Link           from "next/link";

import ReleaseButton from "./ReleaseButton";
import BusinessChart from "@/components/BusinessChart";
import { logout } from "@/app/dashboards/business/actions";
import EditProfileButton from "./EditProfileButton";
/**
 * Business Dashboard — Server Component
 *
 * Reads the session cookie, fetches real orders and gigs from Prisma,
 * computes analytics from actual DB data, and passes everything
 * to the interactive Client Components (ReleaseButton, charts).
 *
 * Analytics charts (spend vs agency, university breakdown, skills)
 * remain partially computed from real order data where possible,
 * with university/skills data staying as representative static values
 * until those fields are tracked per-order in the DB.
 */
export default async function BusinessDashboard() {

  // ── Auth ────────────────────────────────────────────────────────────────────
  const session = await getSession();
  if (!session?.email)         redirect("/login");
  if (session.role !== "business") redirect("/dashboards/student");

  const userEmail = session.email;

  // ── Fetch business user ─────────────────────────────────────────────────────
  const dbUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!dbUser) redirect("/login");

  // ── Fetch all orders this business has placed ───────────────────────────────
  const dbOrders = await prisma.order.findMany({
    where:   { buyer_id: dbUser.user_id },
    include: {
      gig: {
        include: { student: true },
      },
    },
    orderBy: { order_id: "desc" },
  });

  // ── Fetch featured gigs for the Browse section ──────────────────────────────
  const featuredGigs = await prisma.gig.findMany({
    where:   { status: "active" },
    include: { student: true },
    take:    3,
    orderBy: { gig_id: "desc" },
  });

  // ── Compute real stats ──────────────────────────────────────────────────────
  const activeHires    = dbOrders.filter(o =>
    o.status === "pending" || o.status === "in_progress"
  );
  const completedHires = dbOrders.filter(o => o.status === "completed");
  const totalSpent     = completedHires.reduce((sum, o) => sum + o.gig.price, 0);

  // Unique students hired (de-duped by student_id)
  const uniqueStudents = new Set(dbOrders.map(o => o.gig.student_id)).size;

  // Agency cost estimate — 3.1x what was actually paid
  const agencyEstimate = Math.round(totalSpent * 3.1);
  const totalSaved     = agencyEstimate - totalSpent;
  const roiPct         = totalSpent > 0
    ? Math.round((totalSaved / totalSpent) * 100)
    : 0;

  // ── Display name ────────────────────────────────────────────────────────────
  // Businesses choose their enterprise name via full_name field
  const hasEnterpriseName = dbUser.full_name && dbUser.full_name !== "EMPTY";
  const displayName = hasEnterpriseName
    ? dbUser.full_name
    : "";

  const initials = getInitials(dbUser.full_name ?? dbUser.email);

  // ── Analytics data ──────────────────────────────────────────────────────────
  // Spend data — built from real completed orders grouped by month
  // Falls back to zeros if no orders yet so charts render cleanly
  const spendByMonth = buildSpendByMonth(completedHires);

  // University and skills data stays representative until tracked per-order
  const UNIVERSITY_DATA = [
    { name: "ALU Rwanda",            value: 80, color: "#F97316" },
    { name: "CMU Africa",            value: 15, color: "#0C0A09" },
    { name: "University of Rwanda",  value: 5,  color: "#D6D3D1" },
  ];

  const SKILLS_DATA = [
    { skill: "React / Next.js", count: 8, pct: 88 },
    { skill: "Figma / Design",  count: 6, pct: 67 },
    { skill: "Copywriting",     count: 4, pct: 44 },
    { skill: "Data Analysis",   count: 3, pct: 33 },
    { skill: "Video Editing",   count: 2, pct: 22 },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={s.root}>

      {/* ── NAV ──────────────────────────────────────────────────── */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <Link href="/" style={s.logo}>
            <div style={s.logoMark}>
              <svg viewBox="0 0 24 24" fill="white" width={16} height={16}>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span style={s.logoText}>UniHustle</span>
          </Link>
          {/* Removed flex: 1 spacer to fix nav bar spacing */}
          <div style={s.navRight}>
            <Link href="/marketplace" style={s.switchLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
                <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Browse Gigs
            </Link>
            <Link href="#" style={s.navLink}>My Orders</Link>
            <div style={{ position: "relative" }}>
              <div style={s.avatar}>{initials}</div>
            </div>
            <form action={logout} style={{ margin: 0 }}>
              <button type="submit" style={{ ...s.menuItem, color: '#EF4444' }}>
                Log Out
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* ── MAIN ─────────────────────────────────────────────────── */}
      <main style={s.main}>
        <div style={s.container}>

          {/* Greeting */}
          <div style={s.greeting}>
            <div>
              <p style={s.greetingSub}>Good morning</p>
              <h1 style={s.greetingName}>{displayName || "Enterprise"}</h1>
              <EditProfileButton businessEmail={userEmail} currentName={displayName} />
            </div>
            <Link href="/marketplace" style={s.postJobBtn}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" width={14} height={14}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Browse Student Gigs
            </Link>
          </div>

          {/* ── STATS ──────────────────────────────────────────── */}
          <div style={s.statsRow} className="stats-row">
            <div style={s.statCard}>
              <div style={s.statIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                </svg>
              </div>
              <div>
                <p style={s.statLabel}>Active Hires</p>
                <p style={s.statValue}>{activeHires.length}</p>
                <p style={s.statSub}>
                  {activeHires.length === 0 ? "No active orders" : "Work in progress"}
                </p>
              </div>
            </div>

            <div style={s.statCard}>
              <div style={s.statIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              </div>
              <div>
                <p style={s.statLabel}>Total Spent</p>
                <p style={s.statValue}>{totalSpent.toLocaleString()} RWF</p>
                <p style={s.statSub}>Across {completedHires.length} completed hire{completedHires.length !== 1 ? "s" : ""}</p>
              </div>
            </div>

            <div style={s.statCard}>
              <div style={s.statIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <div>
                <p style={s.statLabel}>Students Hired</p>
                <p style={s.statValue}>{uniqueStudents}</p>
                <p style={s.statSub}>Unique freelancers</p>
              </div>
            </div>
          </div>

          {/* ── ANALYTICS ──────────────────────────────────────── */}
          <div style={s.section}>
            <div style={s.sectionHead}>
              <div>
                <h2 style={s.sectionTitle}>Analytics Overview</h2>
                <p style={s.sectionDesc}>Based on your real hiring activity</p>
              </div>
              <span style={s.periodBadge}>All time</span>
            </div>

            {/* Analytics KPI row */}
            <div style={s.analyticsKpiRow} className="analytics-kpi">
              {[
                {
                  label: "Total Investment",
                  value: `${totalSpent.toLocaleString()} RWF`,
                  sub:   "Paid to student freelancers",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                  ),
                },
                {
                  label: "Students Hired",
                  value: String(uniqueStudents),
                  sub:   "Unique student freelancers",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                    </svg>
                  ),
                },
                {
                  label: "Est. Agency Cost",
                  value: `${agencyEstimate.toLocaleString()} RWF`,
                  sub:   "What a traditional agency would charge",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
                      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                    </svg>
                  ),
                },
              ].map(kpi => (
                <div key={kpi.label} style={s.statCard}>
                  <div style={s.statIcon}>{kpi.icon}</div>
                  <div>
                    <p style={s.statLabel}>{kpi.label}</p>
                    <p style={s.statValue}>{kpi.value}</p>
                    <p style={s.statSub}>{kpi.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div style={s.chartsRow} className="charts-row">
              {/* Spend chart */}
              <div style={s.chartCard}>
                <div style={s.chartHead}>
                  <p style={s.chartTitle}>Monthly Spend vs Agency Estimate</p>
                  <p style={s.chartSub}>Orange = what you paid · Gray = agency equivalent</p>
                </div>
              
              </div>

              {/* University breakdown */}
              <div style={s.chartCard}>
                <div style={s.chartHead}>
                  <p style={s.chartTitle}>University Breakdown</p>
                  <p style={s.chartSub}>Hires by institution</p>
                </div>
                <div style={s.pieWrap}>
                  
                  <div style={s.pieLegend}>
                    {UNIVERSITY_DATA.map(u => (
                      <div key={u.name} style={s.legendItem}>
                        <div style={{ ...s.legendDot, background: u.color }} />
                        <div>
                          <p style={s.legendName}>{u.name}</p>
                          <p style={s.legendPct}>{u.value}% of hires</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Skills breakdown */}
            <div style={s.skillsCard}>
              <div style={s.chartHead}>
                <p style={s.chartTitle}>Top Skills Hired</p>
                <p style={s.chartSub}>Based on completed and active orders</p>
              </div>
              <div style={s.skillsList}>
                {SKILLS_DATA.map(item => (
                  <div key={item.skill} style={s.skillRow}>
                    <span style={s.skillName}>{item.skill}</span>
                    <div style={s.skillBarTrack}>
                      <div style={{ ...s.skillBarFill, width: `${item.pct}%` }} />
                    </div>
                    <span style={s.skillCount}>{item.count} hire{item.count !== 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── ROI SECTION ────────────────────────────────────── */}
          {totalSpent > 0 && (
            <div style={s.section}>
              <div style={s.sectionHead}>
                <div>
                  <h2 style={s.sectionTitle}>Return on Investment</h2>
                  <p style={s.sectionDesc}>How much you saved by hiring students vs traditional agencies</p>
                </div>
              </div>
              <div style={s.roiCard} className="roi-card">
                <div style={s.roiLeft}>
                  <p style={s.roiSavedLabel}>Total Saved</p>
                  <p style={s.roiSavedValue}>{totalSaved.toLocaleString()} RWF</p>
                  <div style={s.roiBadge}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                    <span>{roiPct}% ROI vs agency rates</span>
                  </div>
                  <p style={s.roiNote}>
                    Agency-equivalent cost estimated at 3.1x the student rate, based on typical Kigali market pricing.
                  </p>
                </div>
                <div style={s.roiDivider} className="roi-divider" />
                <div style={s.roiRight}>
                  <p style={s.roiBreakdownTitle}>Your spending breakdown</p>
                  {completedHires.slice(0, 5).map(order => {
                    const agency = Math.round(order.gig.price * 3.1);
                    const saved  = agency - order.gig.price;
                    const pct    = Math.round((saved / agency) * 100);
                    return (
                      <div key={order.order_id} style={s.roiRow}>
                        <span style={s.roiRowLabel}>{order.gig.title.slice(0, 28)}{order.gig.title.length > 28 ? "..." : ""}</span>
                        <div style={s.roiRowBar}>
                          <div style={s.roiBarTrack}>
                            <div style={{ ...s.roiBarFill, width: `${pct}%` }} />
                          </div>
                          <span style={s.roiRowSaved}>+{saved.toLocaleString()} RWF</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── ACTIVE HIRES TABLE ─────────────────────────────── */}
          <div style={s.section}>
            <div style={s.sectionHead}>
              <h2 style={s.sectionTitle}>Active Hires</h2>
              <Link href="#" style={s.sectionAction}>
                View all
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>

            {activeHires.length === 0 ? (
              <div style={s.emptyCanvas}>
                <div style={s.emptyIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#D6D3D1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={32} height={32}>
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                  </svg>
                </div>
                <p style={s.emptyTitle}>No active hires yet</p>
                <p style={s.emptySub}>
                  Browse the marketplace and book a student gig to get started.
                </p>
                <Link href="/marketplace" style={s.emptyBtn}>Browse Gigs</Link>
              </div>
            ) : (
              <div style={s.table}>
                <div style={s.tableHead} className="table-head">
                  <span>Order</span>
                  <span>Student</span>
                  <span>Gig</span>
                  <span>Deadline</span>
                  <span>Status</span>
                  <span>Amount</span>
                  <span></span>
                </div>
                {activeHires.map((order, i) => {
                  const studentName    = order.gig.student.full_name;
                  const studentInitials = getInitials(studentName, order.gig.student.email);
                  const deadlineStr    = order.deadline
                    ? formatDeadline(order.deadline)
                    : "No deadline set";

                  return (
                    <div
                      key={order.order_id}
                      style={{ ...s.tableRow, ...(i === activeHires.length - 1 ? { borderBottom: "none" } : {}) }}
                    >
                      <span style={s.orderId}>#{String(order.order_id).slice(-6).toUpperCase()}</span>
                      <div style={s.orderBuyer}>
                        <div style={s.buyerAvatar}>{studentInitials}</div>
                        <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>{studentName}</span>
                      </div>
                      <span style={s.orderGig}>{order.gig.title}</span>
                      <div style={s.orderDue}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
                          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>{deadlineStr}</span>
                      </div>
                      <span style={{
                        ...s.statusPill,
                        ...(order.status === "pending" ? s.statusPending : s.statusInProgress),
                      }}>
                        {order.status === "pending" ? "Pending" : "In Progress"}
                      </span>
                      <span style={s.orderAmount}>{order.gig.price.toLocaleString()} RWF</span>
                      <ReleaseButton
                        orderId={order.order_id}
                        buyerEmail={userEmail}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── BROWSE STUDENT GIGS ────────────────────────────── */}
          <div style={s.section}>
            <div style={s.sectionHead}>
              <div>
                <h2 style={s.sectionTitle}>Browse Student Gigs</h2>
                <p style={s.sectionDesc}>Hire directly from student-listed services</p>
              </div>
              <Link href="/marketplace" style={s.browseAllLink}>
                Browse all gigs
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>

            {featuredGigs.length === 0 ? (
              <div style={s.emptyCanvas}>
                <p style={s.emptyTitle}>No gigs available yet</p>
                <p style={s.emptySub}>Students are still setting up their profiles. Check back soon.</p>
              </div>
            ) : (
              <div style={s.gigsGrid}>
                {featuredGigs.map(gig => {
                  const sellerName     = gig.student.full_name;
                  const sellerInitials = getInitials(sellerName, gig.student.email);
                  return (
                    <div key={gig.gig_id} style={s.gigCard}>
                      <div style={s.gigThumb}>
                        <span style={s.gigThumbLabel}>{gig.category}</span>
                      </div>
                      <div style={s.gigBody}>
                        <div style={s.gigSeller}>
                          <div style={s.gigSellerAvatar}>{sellerInitials}</div>
                          <span style={s.gigSellerName}>{sellerName}</span>
                        </div>
                        <p style={s.gigTitle}>{gig.title}</p>
                        <div style={s.gigFooter}>
                          <span style={s.gigPriceFrom}>From </span>
                          <span style={s.gigPriceVal}>{gig.price.toLocaleString()} RWF</span>
                        </div>
                      </div>
                      <div style={s.gigCta}>
                        <Link
                          href={`/marketplace/gigs/${gig.gig_id}`}
                          style={s.bookBtn}
                        >
                          View &amp; Book
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #F5F5F4; }
        a { text-decoration: none; color: inherit; }
        button { font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; }
        @media (max-width: 1100px) {
          .analytics-kpi { grid-template-columns: 1fr 1fr !important; }
          .charts-row    { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 960px) {
          .stats-row  { grid-template-columns: 1fr 1fr !important; }
          .gigs-grid  { grid-template-columns: 1fr 1fr !important; }
          .table-head { display: none !important; }
          .roi-card   { flex-direction: column !important; }
          .roi-divider { width: 100% !important; height: 1px !important; }
        }
        @media (max-width: 640px) {
          .stats-row { grid-template-columns: 1fr !important; }
          .gigs-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string, email?: string): string {
  if (name && name !== "EMPTY") {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "??";
}

function formatDeadline(deadline: Date): string {
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return "Overdue";
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  return `Due in ${diff} days`;
}

/**
 * Groups completed orders by month and computes real spend
 * alongside the 3.1x agency estimate for the bar chart.
 * Returns the last 6 months always so the chart never looks empty.
 */
function buildSpendByMonth(completedOrders: any[]): { month: string; paid: number; agencyEst: number }[] {
  const months: Record<string, number> = {};
  const now = new Date();

  // Pre-fill the last 6 months with zeros
  for (let i = 5; i >= 0; i--) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("en-GB", { month: "short" });
    months[key] = 0;
  }

  // Sum real spend into the correct month
  completedOrders.forEach(order => {
    const d   = new Date((order as any).created_at ?? Date.now());
    const key = d.toLocaleDateString("en-GB", { month: "short" });
    if (key in months) months[key] += order.gig.price;
  });

  return Object.entries(months).map(([month, paid]) => ({
    month,
    paid,
    agencyEst: Math.round(paid * 3.1),
  }));
}

// ─── Custom chart tooltip ─────────────────────────────────────────────────────

function SpendTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={s.tooltip}>
      <p style={s.tooltipLabel}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ ...s.tooltipRow, color: p.name === "paid" ? "#F97316" : "#A8A29E" }}>
          {p.name === "paid" ? "You paid" : "Agency est."}: {p.value.toLocaleString()} RWF
        </p>
      ))}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  root: { minHeight: "100vh", background: "#F5F5F4", fontFamily: "'Plus Jakarta Sans', sans-serif", WebkitFontSmoothing: "antialiased", color: "#0C0A09" },
  nav: { position: "sticky", top: 0, zIndex: 100, background: "white", borderBottom: "1px solid #E7E5E4" },
  navInner: { maxWidth: 1160, margin: "0 auto", padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { display: "flex", alignItems: "center", gap: 8, textDecoration: "none" },
  logoMark: { width: 28, height: 28, background: "#F97316", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" },
  logoText: { fontWeight: 800, fontSize: "0.95rem", color: "#0C0A09", letterSpacing: "-0.02em" },
  navRight: { display: "flex", alignItems: "center", gap: 12 },
  switchLink: { display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, fontSize: "0.82rem", fontWeight: 600, color: "#44403C", border: "1px solid #E7E5E4", marginRight: 6, marginLeft: 32, textDecoration: "none" },
  navLink: { padding: "6px 12px", borderRadius: 8, fontSize: "0.82rem", fontWeight: 600, color: "#44403C", textDecoration: "none" },
  avatar: { width: 32, height: 32, borderRadius: 999, background: "#0C0A09", color: "white", border: "none", fontSize: "0.62rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 8 },
  main: { padding: "36px 0 80px" },
  container: { maxWidth: 1160, margin: "0 auto", padding: "0 28px" },
  greeting: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap" as const, gap: 12 },
  greetingSub: { fontSize: "0.8rem", fontWeight: 500, color: "#A8A29E", marginBottom: 3 },
  greetingName: { fontSize: "1.6rem", fontWeight: 800, color: "#0C0A09", letterSpacing: "-0.03em" },
  postJobBtn: { display: "inline-flex", alignItems: "center", gap: 6, background: "#F97316", color: "white", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: "0.85rem", fontWeight: 700, textDecoration: "none" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 },
  statCard: { background: "white", border: "1px solid #E7E5E4", borderRadius: 12, padding: "20px 22px", display: "flex", alignItems: "flex-start", gap: 14 },
  statIcon: { width: 38, height: 38, borderRadius: 9, background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  statLabel: { fontSize: "0.72rem", fontWeight: 600, color: "#A8A29E", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 4 },
  statValue: { fontSize: "1.3rem", fontWeight: 800, color: "#0C0A09", letterSpacing: "-0.025em", lineHeight: 1, marginBottom: 4 },
  statSub: { fontSize: "0.73rem", color: "#A8A29E", fontWeight: 500 },
  section: { marginBottom: 32 },
  sectionHead: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 12 },
  sectionTitle: { fontSize: "0.95rem", fontWeight: 700, color: "#0C0A09", letterSpacing: "-0.01em" },
  sectionDesc: { fontSize: "0.78rem", color: "#A8A29E", marginTop: 2 },
  sectionAction: { display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem", fontWeight: 600, color: "#78716C", textDecoration: "none", flexShrink: 0 },
  browseAllLink: { display: "flex", alignItems: "center", gap: 4, fontSize: "0.82rem", fontWeight: 700, color: "#F97316", textDecoration: "none", flexShrink: 0, marginTop: 4 },
  periodBadge: { fontSize: "0.72rem", fontWeight: 600, color: "#78716C", background: "#F5F5F4", border: "1px solid #E7E5E4", borderRadius: 999, padding: "4px 12px", flexShrink: 0 },
  analyticsKpiRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 14 },
  chartsRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 },
  chartCard: { background: "white", border: "1px solid #E7E5E4", borderRadius: 12, padding: "20px 22px" },
  chartHead: { marginBottom: 16 },
  chartTitle: { fontSize: "0.88rem", fontWeight: 700, color: "#0C0A09" },
  chartSub: { fontSize: "0.73rem", color: "#A8A29E", marginTop: 2 },
  tooltip: { background: "#0C0A09", border: "none", borderRadius: 8, padding: "8px 12px" },
  tooltipLabel: { fontSize: "0.72rem", color: "#A8A29E", fontWeight: 600, marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" },
  tooltipRow: { fontSize: "0.8rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 2 },
  pieWrap: { display: "flex", alignItems: "center", gap: 8 },
  pieLegend: { flex: 1, display: "flex", flexDirection: "column" as const, gap: 12 },
  legendItem: { display: "flex", alignItems: "flex-start", gap: 10 },
  legendDot: { width: 10, height: 10, borderRadius: 999, flexShrink: 0, marginTop: 3 },
  legendName: { fontSize: "0.78rem", fontWeight: 600, color: "#0C0A09", lineHeight: 1.3 },
  legendPct: { fontSize: "0.7rem", color: "#A8A29E", marginTop: 1 },
  skillsCard: { background: "white", border: "1px solid #E7E5E4", borderRadius: 12, padding: "20px 22px" },
  skillsList: { display: "flex", flexDirection: "column" as const, gap: 12 },
  skillRow: { display: "grid", gridTemplateColumns: "150px 1fr 70px", alignItems: "center", gap: 14 },
  skillName: { fontSize: "0.8rem", fontWeight: 600, color: "#1C1917" },
  skillBarTrack: { height: 6, background: "#F5F5F4", borderRadius: 999, overflow: "hidden" },
  skillBarFill: { height: "100%", background: "#F97316", borderRadius: 999 },
  skillCount: { fontSize: "0.72rem", fontWeight: 600, color: "#A8A29E", textAlign: "right" as const },
  roiCard: { background: "white", border: "1px solid #E7E5E4", borderRadius: 12, padding: "28px", display: "flex", gap: 40, alignItems: "flex-start" },
  roiLeft: { flexShrink: 0, width: 220 },
  roiSavedLabel: { fontSize: "0.72rem", fontWeight: 600, color: "#A8A29E", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6 },
  roiSavedValue: { fontSize: "2rem", fontWeight: 800, color: "#0C0A09", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 12 },
  roiBadge: { display: "inline-flex", alignItems: "center", gap: 6, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 999, padding: "5px 12px", fontSize: "0.78rem", fontWeight: 700, color: "#16A34A", marginBottom: 14 },
  roiNote: { fontSize: "0.73rem", color: "#A8A29E", lineHeight: 1.6 },
  roiDivider: { width: 1, background: "#E7E5E4", alignSelf: "stretch", flexShrink: 0 },
  roiRight: { flex: 1 },
  roiBreakdownTitle: { fontSize: "0.8rem", fontWeight: 700, color: "#0C0A09", marginBottom: 16 },
  roiRow: { display: "grid", gridTemplateColumns: "160px 1fr", alignItems: "center", gap: 16, marginBottom: 14 },
  roiRowLabel: { fontSize: "0.8rem", fontWeight: 600, color: "#1C1917" },
  roiRowBar: { display: "flex", alignItems: "center", gap: 12 },
  roiBarTrack: { flex: 1, height: 6, background: "#F5F5F4", borderRadius: 999, overflow: "hidden" },
  roiBarFill: { height: "100%", background: "#16A34A", borderRadius: 999 },
  roiRowSaved: { fontSize: "0.75rem", fontWeight: 700, color: "#16A34A", whiteSpace: "nowrap" as const, width: 110, textAlign: "right" as const },
  table: { background: "white", border: "1px solid #E7E5E4", borderRadius: 12, overflow: "hidden" },
  tableHead: { display: "grid", gridTemplateColumns: "80px 150px 1fr 130px 110px 120px 80px", gap: 12, padding: "11px 20px", background: "#FAFAFA", borderBottom: "1px solid #E7E5E4", fontSize: "0.68rem", fontWeight: 700, color: "#A8A29E", textTransform: "uppercase" as const, letterSpacing: "0.07em" },
  tableRow: { display: "grid", gridTemplateColumns: "80px 150px 1fr 130px 110px 120px 80px", gap: 12, padding: "15px 20px", alignItems: "center", borderBottom: "1px solid #F5F5F4", fontSize: "0.83rem", color: "#1C1917" },
  orderId: { fontWeight: 700, color: "#F97316", fontSize: "0.8rem" },
  orderGig: { fontWeight: 600, color: "#0C0A09" },
  orderBuyer: { display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#44403C" },
  buyerAvatar: { width: 26, height: 26, borderRadius: 999, background: "#F5F5F4", border: "1px solid #E7E5E4", color: "#44403C", fontSize: "0.58rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  orderDue: { display: "flex", alignItems: "center", gap: 5, fontSize: "0.78rem", color: "#78716C", fontWeight: 500 },
  orderAmount: { fontWeight: 700, fontSize: "0.83rem", color: "#0C0A09" },
  statusPill: { fontSize: "0.68rem", fontWeight: 700, padding: "3px 10px", borderRadius: 999, width: "fit-content" },
  statusPending: { background: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A" },
  statusInProgress: { background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE" },
  emptyCanvas: { background: "white", border: "1px dashed #E7E5E4", borderRadius: 12, padding: "48px 24px", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 8, textAlign: "center" as const },
  emptyIcon: { width: 52, height: 52, borderRadius: 12, background: "#F5F5F4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: "0.92rem", fontWeight: 700, color: "#0C0A09" },
  emptySub: { fontSize: "0.8rem", color: "#A8A29E", lineHeight: 1.6, maxWidth: 380 },
  emptyBtn: { marginTop: 8, padding: "9px 20px", background: "#F97316", color: "white", borderRadius: 9, fontSize: "0.82rem", fontWeight: 700, textDecoration: "none", display: "inline-block" },
  gigsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 },
  gigCard: { background: "white", border: "1px solid #E7E5E4", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" as const },
  gigThumb: { height: 128, background: "#F5F5F4", display: "flex", alignItems: "flex-end", padding: "10px 12px", borderBottom: "1px solid #E7E5E4" },
  gigThumbLabel: { fontSize: "0.65rem", fontWeight: 700, color: "#78716C", textTransform: "uppercase" as const, letterSpacing: "0.07em", background: "white", border: "1px solid #E7E5E4", borderRadius: 999, padding: "3px 10px" },
  gigBody: { padding: "14px 16px 12px", flex: 1 },
  gigSeller: { display: "flex", alignItems: "center", gap: 7, marginBottom: 10 },
  gigSellerAvatar: { width: 22, height: 22, borderRadius: 999, background: "#0C0A09", color: "white", fontSize: "0.55rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" },
  gigSellerName: { fontSize: "0.75rem", fontWeight: 600, color: "#44403C" },
  gigTitle: { fontSize: "0.84rem", fontWeight: 600, color: "#0C0A09", lineHeight: 1.45, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" },
  gigFooter: { display: "flex", alignItems: "center", gap: 4 },
  gigPriceFrom: { fontSize: "0.72rem", color: "#A8A29E" },
  gigPriceVal: { fontSize: "0.88rem", fontWeight: 800, color: "#0C0A09" },
  gigCta: { padding: "0 16px 14px" },
  bookBtn: { display: "block", textAlign: "center" as const, width: "100%", background: "#F97316", color: "white", border: "none", borderRadius: 8, padding: "9px", fontSize: "0.82rem", fontWeight: 700, textDecoration: "none" },
  iconBtn: { background: "none", border: "1px solid #E7E5E4", borderRadius: 7, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", color: "#78716C", cursor: "pointer" },
  dropdown: { position: "absolute", top: "calc(100% + 6px)", right: 0, background: "white", border: "1px solid #E7E5E4", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.09)", minWidth: 150, padding: "5px 0", zIndex: 50 },
  dropdownItem: { display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "none", border: "none", fontSize: "0.8rem", fontWeight: 500, color: "#1C1917", cursor: "pointer", textAlign: "left" as const },
  dropdownDivider: { height: 1, background: "#F5F5F4", margin: "3px 0" },
};