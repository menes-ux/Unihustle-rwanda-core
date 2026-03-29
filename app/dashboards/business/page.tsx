import { prisma }     from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect }   from "next/navigation";
import Link           from "next/link";

import ReleaseButton    from "./ReleaseButton";
import { logout }       from "@/app/dashboards/business/actions";
import EditProfileButton from "./EditProfileButton";

/**
 * Business Dashboard — Server Component (fully unified design)
 *
 * All charts are rendered inline as SVG/HTML so the entire page
 * shares one design system: same tokens, same card shells, same typography.
 * No recharts / external chart library imports needed.
 */
export default async function BusinessDashboard() {

  // ── Auth ─────────────────────────────────────────────────────────────────
  const session = await getSession();
  if (!session?.email)             redirect("/login");
  if (session.role !== "business") redirect("/dashboards/student");

  const userEmail = session.email;

  // ── Fetch business user ──────────────────────────────────────────────────
  const dbUser = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!dbUser) redirect("/login");

  // ── Fetch orders ─────────────────────────────────────────────────────────
  const dbOrders = await prisma.order.findMany({
    where:   { buyer_id: dbUser.user_id },
    include: { gig: { include: { student: true } } },
    orderBy: { order_id: "desc" },
  });

  // ── Fetch featured gigs ──────────────────────────────────────────────────
  const featuredGigs = await prisma.gig.findMany({
    where:   { status: "active" },
    include: { student: true },
    take:    3,
    orderBy: { gig_id: "desc" },
  });

  // ── Compute stats ────────────────────────────────────────────────────────
  const activeHires    = dbOrders.filter(o => o.status === "pending" || o.status === "in_progress");
  const completedHires = dbOrders.filter(o => o.status === "completed");
  const totalSpent     = completedHires.reduce((sum, o) => sum + o.gig.price, 0);
  const uniqueStudents = new Set(dbOrders.map(o => o.gig.student_id)).size;
  const agencyEstimate = Math.round(totalSpent * 3.1);
  const totalSaved     = agencyEstimate - totalSpent;
  const roiPct         = totalSpent > 0 ? Math.round((totalSaved / totalSpent) * 100) : 0;

  const hasEnterpriseName = dbUser.full_name && dbUser.full_name !== "EMPTY";
  const displayName       = hasEnterpriseName ? dbUser.full_name : "";
  const initials          = getInitials(dbUser.full_name ?? dbUser.email);

  // ── Analytics data ───────────────────────────────────────────────────────
  const spendByMonth = buildSpendByMonth(completedHires);

  const UNIVERSITY_DATA = [
    { name: "ALU Rwanda",           value: 80, color: "#F97316" },
    { name: "CMU Africa",           value: 15, color: "#292524" },
    { name: "University of Rwanda", value: 5,  color: "#D6D3D1" },
  ];

  const SKILLS_DATA = [
    { skill: "React / Next.js", count: 8, pct: 88 },
    { skill: "Figma / Design",  count: 6, pct: 67 },
    { skill: "Copywriting",     count: 4, pct: 44 },
    { skill: "Data Analysis",   count: 3, pct: 33 },
    { skill: "Video Editing",   count: 2, pct: 22 },
  ];

  // ── Chart dimensions ─────────────────────────────────────────────────────
  const BAR_W   = 540;   // SVG viewport width for bar chart
  const BAR_H   = 220;
  const PAD_L   = 52;
  const PAD_B   = 36;
  const PAD_T   = 16;
  const PAD_R   = 16;
  const plotW   = BAR_W - PAD_L - PAD_R;
  const plotH   = BAR_H - PAD_T - PAD_B;

  const maxVal  = Math.max(...spendByMonth.flatMap(d => [d.paid, d.agencyEst]), 1);
  const yMax    = Math.ceil(maxVal / 1000) * 1000 || 10000;
  const n       = spendByMonth.length;
  const groupW  = plotW / n;
  const barW    = Math.min(groupW * 0.28, 22);
  const yTicks  = [0, 0.25, 0.5, 0.75, 1].map(t => ({ val: Math.round(yMax * t), y: PAD_T + plotH * (1 - t) }));

  // Donut chart for university breakdown
  const DONUT_R = 52;
  const DONUT_CX = 64;
  const DONUT_CY = 64;
  const DONUT_STROKE = 22;
  const donutPaths = buildDonutPaths(UNIVERSITY_DATA, DONUT_CX, DONUT_CY, DONUT_R);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={s.root}>

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <Link href="/" style={s.logo}>
            <div style={s.logoMark}>
              <svg viewBox="0 0 24 24" fill="white" width={15} height={15}>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span style={s.logoText}>UniHustle</span>
          </Link>
          <div style={s.navRight}>
            <Link href="/marketplace" style={s.navChip}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
                <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Browse Gigs
            </Link>
            <Link href="#" style={s.navLink}>My Orders</Link>
            <div style={s.avatar}>{initials}</div>
            <form action={logout} style={{ margin: 0 }}>
              <button type="submit" style={s.logoutBtn}>Log Out</button>
            </form>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main style={s.main}>
        <div style={s.container}>

          {/* Greeting */}
          <div style={s.greeting}>
            <div>
              <p style={s.greetingSub}>Good morning</p>
              <h1 style={s.greetingName}>{displayName || "Enterprise"}</h1>
              <EditProfileButton businessEmail={userEmail} currentName={displayName} />
            </div>
            <Link href="/marketplace" style={s.primaryBtn}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" width={13} height={13}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Browse Student Gigs
            </Link>
          </div>

          {/* ── TOP STATS ─────────────────────────────────────── */}
          <div style={s.statsRow} className="stats-row">
            {[
              {
                icon: <BriefcaseIcon />,
                label: "Active Hires",
                value: activeHires.length,
                sub:   activeHires.length === 0 ? "No active orders" : "Work in progress",
              },
              {
                icon: <MoneyIcon />,
                label: "Total Spent",
                value: `${totalSpent.toLocaleString()} RWF`,
                sub:   `Across ${completedHires.length} completed hire${completedHires.length !== 1 ? "s" : ""}`,
              },
              {
                icon: <PeopleIcon />,
                label: "Students Hired",
                value: uniqueStudents,
                sub:   "Unique freelancers",
              },
            ].map(stat => (
              <div key={stat.label} style={s.statCard}>
                <div style={s.statIcon}>{stat.icon}</div>
                <div>
                  <p style={s.statLabel}>{stat.label}</p>
                  <p style={s.statValue}>{stat.value}</p>
                  <p style={s.statSub}>{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── ANALYTICS ─────────────────────────────────────── */}
          <div style={s.section}>
            <div style={s.sectionHead}>
              <div>
                <h2 style={s.sectionTitle}>Analytics Overview</h2>
                <p style={s.sectionDesc}>Based on your real hiring activity</p>
              </div>
              <span style={s.badge}>All time</span>
            </div>

            {/* Analytics KPI cards — same shell as stat cards above */}
            <div style={s.statsRow} className="stats-row">
              {[
                {
                  icon: <MoneyIcon />,
                  label: "Total Investment",
                  value: `${totalSpent.toLocaleString()} RWF`,
                  sub:   "Paid to student freelancers",
                },
                {
                  icon: <PeopleIcon />,
                  label: "Students Hired",
                  value: String(uniqueStudents),
                  sub:   "Unique student freelancers",
                },
                {
                  icon: <BriefcaseIcon />,
                  label: "Est. Agency Cost",
                  value: `${agencyEstimate.toLocaleString()} RWF`,
                  sub:   "What a traditional agency would charge",
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

              {/* ── Bar chart: Monthly Spend ── */}
              <div style={s.card}>
                <p style={s.cardTitle}>Monthly Spend vs Agency Estimate</p>
                <p style={s.cardSub}>
                  <span style={{ color: "#F97316", fontWeight: 700 }}>■</span> What you paid &nbsp;·&nbsp;
                  <span style={{ color: "#D6D3D1", fontWeight: 700 }}>■</span> Agency equivalent
                </p>
                <div style={{ marginTop: 20, overflowX: "auto" }}>
                  <svg
                    viewBox={`0 0 ${BAR_W} ${BAR_H}`}
                    width="100%"
                    style={{ display: "block", fontFamily: "inherit" }}
                  >
                    {/* Y gridlines + labels */}
                    {yTicks.map(t => (
                      <g key={t.val}>
                        <line
                          x1={PAD_L} y1={t.y}
                          x2={BAR_W - PAD_R} y2={t.y}
                          stroke="#F0EDEC" strokeWidth={1}
                        />
                        <text
                          x={PAD_L - 6} y={t.y + 4}
                          textAnchor="end"
                          fontSize={9}
                          fill="#C0B8B4"
                          fontFamily="inherit"
                        >
                          {t.val >= 1000 ? `${t.val / 1000}k` : t.val}
                        </text>
                      </g>
                    ))}

                    {/* Bars */}
                    {spendByMonth.map((d, i) => {
                      const cx     = PAD_L + i * groupW + groupW / 2;
                      const paidH  = (d.paid / yMax) * plotH;
                      const agcH   = (d.agencyEst / yMax) * plotH;
                      const paidY  = PAD_T + plotH - paidH;
                      const agcY   = PAD_T + plotH - agcH;
                      return (
                        <g key={d.month}>
                          {/* Agency bar (behind) */}
                          <rect
                            x={cx - barW * 0.55}
                            y={agcH > 0 ? agcY : PAD_T + plotH}
                            width={barW}
                            height={Math.max(agcH, 0)}
                            rx={3}
                            fill="#E7E5E4"
                          />
                          {/* Paid bar */}
                          <rect
                            x={cx + barW * 0.55 - barW}
                            y={paidH > 0 ? paidY : PAD_T + plotH}
                            width={barW}
                            height={Math.max(paidH, 0)}
                            rx={3}
                            fill="#F97316"
                          />
                          {/* X label */}
                          <text
                            x={cx}
                            y={BAR_H - 8}
                            textAnchor="middle"
                            fontSize={9.5}
                            fill="#A8A29E"
                            fontFamily="inherit"
                            fontWeight={600}
                          >
                            {d.month}
                          </text>
                        </g>
                      );
                    })}

                    {/* Baseline */}
                    <line
                      x1={PAD_L} y1={PAD_T + plotH}
                      x2={BAR_W - PAD_R} y2={PAD_T + plotH}
                      stroke="#E7E5E4" strokeWidth={1}
                    />
                  </svg>
                </div>
              </div>

              {/* ── Donut chart: University Breakdown ── */}
              <div style={s.card}>
                <p style={s.cardTitle}>University Breakdown</p>
                <p style={s.cardSub}>Hires by institution</p>
                <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 24 }}>
                  <svg
                    viewBox="0 0 128 128"
                    width={128}
                    height={128}
                    style={{ flexShrink: 0 }}
                  >
                    {/* Background circle */}
                    <circle
                      cx={DONUT_CX} cy={DONUT_CY} r={DONUT_R}
                      fill="none"
                      stroke="#F0EDEC"
                      strokeWidth={DONUT_STROKE}
                    />
                    {donutPaths.map((seg, i) => (
                      <circle
                        key={i}
                        cx={DONUT_CX}
                        cy={DONUT_CY}
                        r={DONUT_R}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={DONUT_STROKE}
                        strokeDasharray={`${seg.dashLen} ${seg.dashGap}`}
                        strokeDashoffset={seg.offset}
                        strokeLinecap="butt"
                        style={{ transform: "rotate(-90deg)", transformOrigin: `${DONUT_CX}px ${DONUT_CY}px` }}
                      />
                    ))}
                    {/* Centre label */}
                    <text x={DONUT_CX} y={DONUT_CY - 5} textAnchor="middle" fontSize={11} fontWeight={800} fill="#0C0A09" fontFamily="inherit">
                      {n > 0 ? dbOrders.length : "—"}
                    </text>
                    <text x={DONUT_CX} y={DONUT_CY + 9} textAnchor="middle" fontSize={8} fill="#A8A29E" fontFamily="inherit">
                      hires
                    </text>
                  </svg>

                  {/* Legend */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {UNIVERSITY_DATA.map(u => (
                      <div key={u.name} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: u.color, flexShrink: 0, marginTop: 3 }} />
                        <div>
                          <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#1C1917", lineHeight: 1.3 }}>{u.name}</p>
                          <p style={{ fontSize: "0.7rem", color: "#A8A29E", marginTop: 1 }}>{u.value}% of hires</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Skills breakdown ── */}
            <div style={s.card}>
              <p style={s.cardTitle}>Top Skills Hired</p>
              <p style={s.cardSub}>Based on completed and active orders</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 20 }}>
                {SKILLS_DATA.map(item => (
                  <div key={item.skill} style={{ display: "grid", gridTemplateColumns: "160px 1fr 70px", alignItems: "center", gap: 16 }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1C1917" }}>{item.skill}</span>
                    <div style={{ height: 6, background: "#F5F5F4", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${item.pct}%`, background: "#F97316", borderRadius: 999 }} />
                    </div>
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#A8A29E", textAlign: "right" }}>
                      {item.count} hire{item.count !== 1 ? "s" : ""}
                    </span>
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
                  <p style={s.sectionDesc}>How much you saved vs traditional agencies</p>
                </div>
              </div>
              <div style={s.roiCard} className="roi-card">
                <div style={s.roiLeft}>
                  <p style={s.statLabel}>Total Saved</p>
                  <p style={{ fontSize: "2rem", fontWeight: 800, color: "#0C0A09", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 12 }}>
                    {totalSaved.toLocaleString()} RWF
                  </p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 999, padding: "5px 12px", fontSize: "0.78rem", fontWeight: 700, color: "#16A34A", marginBottom: 14 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                    {roiPct}% ROI vs agency rates
                  </div>
                  <p style={{ fontSize: "0.73rem", color: "#A8A29E", lineHeight: 1.6 }}>
                    Agency-equivalent cost estimated at 3.1× the student rate, based on typical Kigali market pricing.
                  </p>
                </div>
                <div style={{ width: 1, background: "#E7E5E4", alignSelf: "stretch", flexShrink: 0 }} className="roi-divider" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0C0A09", marginBottom: 16 }}>Your spending breakdown</p>
                  {completedHires.slice(0, 5).map(order => {
                    const agency = Math.round(order.gig.price * 3.1);
                    const saved  = agency - order.gig.price;
                    const pct    = Math.round((saved / agency) * 100);
                    return (
                      <div key={order.order_id} style={{ display: "grid", gridTemplateColumns: "160px 1fr", alignItems: "center", gap: 16, marginBottom: 14 }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1C1917" }}>
                          {order.gig.title.slice(0, 28)}{order.gig.title.length > 28 ? "…" : ""}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ flex: 1, height: 6, background: "#F5F5F4", borderRadius: 999, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: "#16A34A", borderRadius: 999 }} />
                          </div>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#16A34A", whiteSpace: "nowrap", width: 110, textAlign: "right" }}>
                            +{saved.toLocaleString()} RWF
                          </span>
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>

            {activeHires.length === 0 ? (
              <div style={s.emptyCanvas}>
                <div style={s.emptyIcon}><BriefcaseIconLg /></div>
                <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "#0C0A09" }}>No active hires yet</p>
                <p style={{ fontSize: "0.8rem", color: "#A8A29E", lineHeight: 1.6, maxWidth: 380 }}>
                  Browse the marketplace and book a student gig to get started.
                </p>
                <Link href="/marketplace" style={s.primaryBtn}>Browse Gigs</Link>
              </div>
            ) : (
              <div style={s.table}>
                <div style={s.tableHead} className="table-head">
                  <span>Order</span><span>Student</span><span>Gig</span>
                  <span>Deadline</span><span>Status</span><span>Amount</span><span></span>
                </div>
                {activeHires.map((order, i) => {
                  const studentName     = order.gig.student.full_name;
                  const studentInitials = getInitials(studentName, order.gig.student.email);
                  const deadlineStr     = order.deadline ? formatDeadline(order.deadline) : "No deadline set";
                  return (
                    <div
                      key={order.order_id}
                      style={{ ...s.tableRow, ...(i === activeHires.length - 1 ? { borderBottom: "none" } : {}) }}
                    >
                      <span style={{ fontWeight: 700, color: "#F97316", fontSize: "0.8rem" }}>
                        #{String(order.order_id).slice(-6).toUpperCase()}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={s.microAvatar}>{studentInitials}</div>
                        <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>{studentName}</span>
                      </div>
                      <span style={{ fontWeight: 600, color: "#0C0A09", fontSize: "0.83rem" }}>{order.gig.title}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.78rem", color: "#78716C", fontWeight: 500 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={12} height={12}>
                          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {deadlineStr}
                      </div>
                      <span style={{
                        fontSize: "0.68rem", fontWeight: 700, padding: "3px 10px",
                        borderRadius: 999, width: "fit-content",
                        ...(order.status === "pending"
                          ? { background: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A" }
                          : { background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE" }),
                      }}>
                        {order.status === "pending" ? "Pending" : "In Progress"}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: "0.83rem" }}>
                        {order.gig.price.toLocaleString()} RWF
                      </span>
                      <ReleaseButton orderId={order.order_id} buyerEmail={userEmail} />
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
              <Link href="/marketplace" style={{ ...s.sectionAction, color: "#F97316" }}>
                Browse all gigs
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>

            {featuredGigs.length === 0 ? (
              <div style={s.emptyCanvas}>
                <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "#0C0A09" }}>No gigs available yet</p>
                <p style={{ fontSize: "0.8rem", color: "#A8A29E", lineHeight: 1.6 }}>Students are still setting up their profiles. Check back soon.</p>
              </div>
            ) : (
              <div style={s.gigsGrid} className="gigs-grid">
                {featuredGigs.map(gig => {
                  const sellerName     = gig.student.full_name;
                  const sellerInitials = getInitials(sellerName, gig.student.email);
                  return (
                    <div key={gig.gig_id} style={s.gigCard}>
                      <div style={s.gigThumb}>
                        <span style={s.gigThumbLabel}>{gig.category}</span>
                      </div>
                      <div style={s.gigBody}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                          <div style={s.gigAvatar}>{sellerInitials}</div>
                          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#44403C" }}>{sellerName}</span>
                        </div>
                        <p style={s.gigTitle}>{gig.title}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: "0.72rem", color: "#A8A29E" }}>From </span>
                          <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#0C0A09" }}>{gig.price.toLocaleString()} RWF</span>
                        </div>
                      </div>
                      <div style={{ padding: "0 16px 14px" }}>
                        <Link href={`/marketplace/gigs/${gig.gig_id}`} style={s.bookBtn}>
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
          .charts-row { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 960px) {
          .stats-row   { grid-template-columns: 1fr 1fr !important; }
          .gigs-grid   { grid-template-columns: 1fr 1fr !important; }
          .table-head  { display: none !important; }
          .roi-card    { flex-direction: column !important; }
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

// ─── Inline icon components ────────────────────────────────────────────────────

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  );
}

function BriefcaseIconLg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#D6D3D1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={30} height={30}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

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
  if (diff < 0)   return "Overdue";
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  return `Due in ${diff} days`;
}

function buildSpendByMonth(completedOrders: any[]): { month: string; paid: number; agencyEst: number }[] {
  const months: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("en-GB", { month: "short" });
    months[key] = 0;
  }
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

/**
 * Builds strokeDasharray / strokeDashoffset values for a CSS-only donut chart.
 * Each segment is drawn as a <circle> with a partial stroke.
 */
function buildDonutPaths(
  data: { name: string; value: number; color: string }[],
  cx: number, cy: number, r: number,
) {
  const circumference = 2 * Math.PI * r;
  const total         = data.reduce((s, d) => s + d.value, 0);
  let   cumulPct      = 0;

  return data.map(d => {
    const pct     = d.value / total;
    const dashLen = circumference * pct - 1; // -1px gap between segments
    const offset  = -circumference * cumulPct;
    cumulPct     += pct;
    return { color: d.color, dashLen, dashGap: circumference - dashLen, offset };
  });
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  // Layout
  root:       { minHeight: "100vh", background: "#F5F5F4", fontFamily: "'Plus Jakarta Sans', sans-serif", WebkitFontSmoothing: "antialiased", color: "#0C0A09" },
  nav:        { position: "sticky", top: 0, zIndex: 100, background: "white", borderBottom: "1px solid #E7E5E4" },
  navInner:   { maxWidth: 1160, margin: "0 auto", padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" },
  main:       { padding: "36px 0 80px" },
  container:  { maxWidth: 1160, margin: "0 auto", padding: "0 28px" },

  // Nav
  logo:       { display: "flex", alignItems: "center", gap: 8 },
  logoMark:   { width: 28, height: 28, background: "#F97316", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" },
  logoText:   { fontWeight: 800, fontSize: "0.95rem", color: "#0C0A09", letterSpacing: "-0.02em" },
  navRight:   { display: "flex", alignItems: "center", gap: 12 },
  navChip:    { display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, fontSize: "0.82rem", fontWeight: 600, color: "#44403C", border: "1px solid #E7E5E4", marginRight: 6, marginLeft: 32 },
  navLink:    { padding: "6px 12px", borderRadius: 8, fontSize: "0.82rem", fontWeight: 600, color: "#44403C" },
  avatar:     { width: 32, height: 32, borderRadius: 999, background: "#0C0A09", color: "white", fontSize: "0.62rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 8 },
  logoutBtn:  { background: "none", border: "none", padding: "6px 4px", fontSize: "0.82rem", fontWeight: 600, color: "#EF4444" },

  // Greeting
  greeting:     { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap" as const, gap: 12 },
  greetingSub:  { fontSize: "0.8rem", fontWeight: 500, color: "#A8A29E", marginBottom: 3 },
  greetingName: { fontSize: "1.6rem", fontWeight: 800, color: "#0C0A09", letterSpacing: "-0.03em" },
  primaryBtn:   { display: "inline-flex", alignItems: "center", gap: 6, background: "#F97316", color: "white", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: "0.85rem", fontWeight: 700 },

  // ── Unified card shell ── used by stat cards AND chart cards ──────────────
  statCard:   { background: "white", border: "1px solid #E7E5E4", borderRadius: 12, padding: "20px 22px", display: "flex", alignItems: "flex-start", gap: 14 },
  statIcon:   { width: 38, height: 38, borderRadius: 9, background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  statLabel:  { fontSize: "0.72rem", fontWeight: 600, color: "#A8A29E", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 4 },
  statValue:  { fontSize: "1.3rem", fontWeight: 800, color: "#0C0A09", letterSpacing: "-0.025em", lineHeight: 1, marginBottom: 4 },
  statSub:    { fontSize: "0.73rem", color: "#A8A29E", fontWeight: 500 },

  // Chart cards (same border-radius, same border, same background as stat cards)
  card:       { background: "white", border: "1px solid #E7E5E4", borderRadius: 12, padding: "20px 22px" },
  cardTitle:  { fontSize: "0.88rem", fontWeight: 700, color: "#0C0A09" },
  cardSub:    { fontSize: "0.73rem", color: "#A8A29E", marginTop: 3 },

  // Grid layouts
  statsRow:   { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 14 },
  chartsRow:  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 },
  section:    { marginBottom: 32 },
  sectionHead:{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 12 },
  sectionTitle: { fontSize: "0.95rem", fontWeight: 700, color: "#0C0A09", letterSpacing: "-0.01em" },
  sectionDesc:  { fontSize: "0.78rem", color: "#A8A29E", marginTop: 2 },
  sectionAction:{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem", fontWeight: 600, color: "#78716C", flexShrink: 0 },
  badge:      { fontSize: "0.72rem", fontWeight: 600, color: "#78716C", background: "#F5F5F4", border: "1px solid #E7E5E4", borderRadius: 999, padding: "4px 12px", flexShrink: 0 },

  // ROI
  roiCard:    { background: "white", border: "1px solid #E7E5E4", borderRadius: 12, padding: "28px", display: "flex", gap: 40, alignItems: "flex-start" },
  roiLeft:    { flexShrink: 0, width: 220 },

  // Table
  table:      { background: "white", border: "1px solid #E7E5E4", borderRadius: 12, overflow: "hidden" },
  tableHead:  { display: "grid", gridTemplateColumns: "80px 160px 1fr 130px 110px 120px 80px", gap: 12, padding: "11px 20px", background: "#FAFAFA", borderBottom: "1px solid #E7E5E4", fontSize: "0.68rem", fontWeight: 700, color: "#A8A29E", textTransform: "uppercase" as const, letterSpacing: "0.07em" },
  tableRow:   { display: "grid", gridTemplateColumns: "80px 160px 1fr 130px 110px 120px 80px", gap: 12, padding: "15px 20px", alignItems: "center", borderBottom: "1px solid #F5F5F4" },
  microAvatar:{ width: 26, height: 26, borderRadius: 999, background: "#F5F5F4", border: "1px solid #E7E5E4", color: "#44403C", fontSize: "0.58rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },

  // Empty state
  emptyCanvas: { background: "white", border: "1px dashed #E7E5E4", borderRadius: 12, padding: "48px 24px", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 8, textAlign: "center" as const },
  emptyIcon:   { width: 52, height: 52, borderRadius: 12, background: "#F5F5F4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 },

  // Gig cards
  gigsGrid:   { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 },
  gigCard:    { background: "white", border: "1px solid #E7E5E4", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" as const },
  gigThumb:   { height: 120, background: "#F5F5F4", display: "flex", alignItems: "flex-end", padding: "10px 12px", borderBottom: "1px solid #E7E5E4" },
  gigThumbLabel: { fontSize: "0.65rem", fontWeight: 700, color: "#78716C", textTransform: "uppercase" as const, letterSpacing: "0.07em", background: "white", border: "1px solid #E7E5E4", borderRadius: 999, padding: "3px 10px" },
  gigBody:    { padding: "14px 16px 12px", flex: 1 },
  gigAvatar:  { width: 22, height: 22, borderRadius: 999, background: "#0C0A09", color: "white", fontSize: "0.55rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" },
  gigTitle:   { fontSize: "0.84rem", fontWeight: 600, color: "#0C0A09", lineHeight: 1.45, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" },
  bookBtn:    { display: "block", textAlign: "center" as const, width: "100%", background: "#F97316", color: "white", borderRadius: 8, padding: "9px", fontSize: "0.82rem", fontWeight: 700 },
};