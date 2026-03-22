'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Job {
  id: number;
  title: string;
  category: string;
  budget: number;
  applicants: number;
  posted: string;
  status: 'open' | 'closed';
}

interface ActiveHire {
  id: string;
  student: string;
  initials: string;
  gig: string;
  due: string;
  amount: number;
  progress: number;
}

interface FeaturedGig {
  id: number;
  title: string;
  seller: string;
  initials: string;
  rating: number;
  reviews: number;
  price: number;
  category: string;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const JOBS: Job[] = [
  { id: 1, title: 'Need a React developer to build our company landing page', category: 'Development', budget: 80000, applicants: 7, posted: '3 days ago', status: 'open' },
  { id: 2, title: 'Looking for a graphic designer for our rebranding project', category: 'Design', budget: 40000, applicants: 4, posted: '1 week ago', status: 'open' },
  { id: 3, title: 'French translator needed for our product documentation', category: 'Writing', budget: 12000, applicants: 2, posted: '2 weeks ago', status: 'closed' },
];

const HIRES: ActiveHire[] = [
  { id: '#1042', student: 'David Achibiri',  initials: 'DA', gig: 'PostgreSQL Database Setup', due: 'Due in 2 days', amount: 15000, progress: 70 },
  { id: '#1039', student: 'Manuelle Ackun',  initials: 'MA', gig: 'Brand Identity & Logo',     due: 'Due in 6 days', amount: 20000, progress: 40 },
];

const FEATURED_GIGS: FeaturedGig[] = [
  { id: 1, title: 'I will build a full-stack web application with Next.js', seller: 'David Achibiri', initials: 'DA', rating: 4.9, reviews: 12, price: 60000, category: 'Development' },
  { id: 2, title: 'I will create a complete social media content calendar',  seller: 'Jean Nepo M.',  initials: 'JN', rating: 4.8, reviews: 9,  price: 25000, category: 'Marketing'   },
  { id: 3, title: 'I will design pitch deck slides for your startup',        seller: 'Manuelle Ackun',initials: 'MA', rating: 5.0, reviews: 6,  price: 35000, category: 'Design'       },
];

// ─── Analytics Data ───────────────────────────────────────────────────────────

const SPEND_DATA = [
  { month: 'Oct', paid: 12000, agencyEst: 38000 },
  { month: 'Nov', paid: 18500, agencyEst: 57000 },
  { month: 'Dec', paid: 14000, agencyEst: 43000 },
  { month: 'Jan', paid: 27000, agencyEst: 83000 },
  { month: 'Feb', paid: 22000, agencyEst: 68000 },
  { month: 'Mar', paid: 35000, agencyEst: 108000 },
];

const UNIVERSITY_DATA = [
  { name: 'ALU Rwanda',           value: 80, color: '#F97316' },
  { name: 'CMU Africa',           value: 15, color: '#0C0A09' },
  { name: 'University of Rwanda', value: 5,  color: '#D6D3D1' },
];

const SKILLS_DATA = [
  { skill: 'React / Next.js', count: 8, pct: 88 },
  { skill: 'Figma / Design',  count: 6, pct: 67 },
  { skill: 'Copywriting',     count: 4, pct: 44 },
  { skill: 'Data Analysis',   count: 3, pct: 33 },
  { skill: 'Video Editing',   count: 2, pct: 22 },
];

const totalPaid      = SPEND_DATA.reduce((s, d) => s + d.paid, 0);
const totalAgencyEst = SPEND_DATA.reduce((s, d) => s + d.agencyEst, 0);
const totalSaved     = totalAgencyEst - totalPaid;
const roiPct         = Math.round((totalSaved / totalPaid) * 100);

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function SpendTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={s.tooltip}>
      <p style={s.tooltipLabel}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ ...s.tooltipRow, color: p.name === 'paid' ? '#F97316' : '#A8A29E' }}>
          {p.name === 'paid' ? 'You paid' : 'Agency est.'}: {p.value.toLocaleString()} RWF
        </p>
      ))}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icon = {
  Logo: () => (
    <svg viewBox="0 0 24 24" fill="white" width={16} height={16}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Switch: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
      <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" width={14} height={14}>
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Briefcase: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  ),
  Dollar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="#F97316" width={13} height={13}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Dots: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}>
      <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  Applicants: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="23" y1="11" x2="17" y2="11" /><line x1="20" y1="8" x2="20" y2="14" />
    </svg>
  ),
  TrendUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
};

// ─── Job Card ─────────────────────────────────────────────────────────────────

function JobCard({ job }: { job: Job }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div style={s.jobCard}>
      <div style={s.jobCardTop}>
        <div style={s.jobCardLeft}>
          <div style={s.jobCatPill}>{job.category}</div>
          <p style={s.jobTitle}>{job.title}</p>
          <p style={s.jobPosted}>Posted {job.posted}</p>
        </div>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button style={s.iconBtn} onClick={() => setMenuOpen(v => !v)} aria-label="Options">
            <Icon.Dots />
          </button>
          {menuOpen && (
            <div style={s.dropdown}>
              <button style={s.dropdownItem}>Edit job</button>
              <button style={s.dropdownItem}>{job.status === 'open' ? 'Close job' : 'Reopen job'}</button>
              <div style={s.dropdownDivider} />
              <button style={{ ...s.dropdownItem, color: '#EF4444' }}>Delete</button>
            </div>
          )}
        </div>
      </div>
      <div style={s.jobCardFooter}>
        <div style={s.jobMeta}>
          <div style={s.jobMetaItem}>
            <Icon.Applicants />
            <span>{job.applicants} applicant{job.applicants !== 1 ? 's' : ''}</span>
          </div>
          <div style={s.jobMetaItem}>
            <Icon.Dollar />
            <span style={{ fontSize: '0.78rem', color: '#78716C' }}>
              Budget: <strong style={{ color: '#0C0A09' }}>{job.budget.toLocaleString()} RWF</strong>
            </span>
          </div>
        </div>
        <div style={s.jobCardActions}>
          <span style={{ ...s.statusPill, ...(job.status === 'open' ? s.statusOpen : s.statusClosed) }}>
            {job.status === 'open' ? 'Open' : 'Closed'}
          </span>
          {job.status === 'open' && job.applicants > 0 && (
            <button style={s.reviewBtn}>Review Applicants</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BusinessDashboard() {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div style={s.root}>

      {/* ── NAV ──────────────────────────────────────────────────── */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <Link href="/" style={s.logo}>
            <div style={s.logoMark}><Icon.Logo /></div>
            <span style={s.logoText}>UniHustle</span>
          </Link>
          <div style={s.navRight}>
            <Link href="#" style={s.switchLink}>
              <Icon.Switch />
              Switch to Hiring
            </Link>
            <Link href="#" style={s.navLink}>Browse Students</Link>
            <Link href="#" style={s.navLink}>My Jobs</Link>
            <div style={{ position: 'relative' }}>
              <button style={s.avatar} onClick={() => setProfileOpen(v => !v)} aria-label="Profile">
                SH
              </button>
              {profileOpen && (
                <div style={s.profileMenu}>
                  <div style={s.profileHead}>
                    <div style={s.profileAvatar}>SH</div>
                    <div>
                      <div style={s.profileName}>StartupHub Rwanda</div>
                      <div style={s.profileSub}>Business Account</div>
                    </div>
                  </div>
                  <div style={s.menuDivider} />
                  {['Company Profile', 'Billing', 'Settings'].map(item => (
                    <button key={item} style={s.menuItem}>{item}</button>
                  ))}
                  <div style={s.menuDivider} />
                  <button style={{ ...s.menuItem, color: '#EF4444' }}>Log Out</button>
                </div>
              )}
            </div>
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
              <h1 style={s.greetingName}>StartupHub Rwanda</h1>
            </div>
            <button style={s.postJobBtn}>
              <Icon.Plus />
              Post a New Job
            </button>
          </div>

          {/* ── STATS ──────────────────────────────────────────── */}
          <div style={s.statsRow}>
            {[
              { label: 'Posted Jobs',   value: '3',            sub: '2 currently open',    icon: <Icon.Briefcase /> },
              { label: 'Total Spent',   value: '35,000 RWF',   sub: 'Across 3 hires',      icon: <Icon.Dollar />    },
              { label: 'Active Hires',  value: '2',            sub: 'Work in progress',     icon: <Icon.Users />     },
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

          {/* ── ANALYTICS SECTION ──────────────────────────────── */}
          <div style={s.section}>
            <div style={s.sectionHead}>
              <div>
                <h2 style={s.sectionTitle}>Analytics Overview</h2>
                <p style={s.sectionDesc}>Last 6 months of hiring activity</p>
              </div>
              <span style={s.periodBadge}>Oct 2024 — Mar 2025</span>
            </div>

            {/* Analytics KPI row */}
            <div style={s.analyticsKpiRow}>
              {[
                {
                  label: 'Total Investment',
                  value: `${totalPaid.toLocaleString()} RWF`,
                  sub: 'Paid to student freelancers',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                  ),
                },
                {
                  label: 'Students Hired',
                  value: '9',
                  sub: 'Unique student freelancers',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                    </svg>
                  ),
                },
                {
                  label: 'Est. Agency Cost',
                  value: `${totalAgencyEst.toLocaleString()} RWF`,
                  sub: 'What a traditional agency would charge',
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
            <div style={s.chartsRow}>

              {/* Spend vs Agency bar chart */}
              <div style={s.chartCard}>
                <div style={s.chartHead}>
                  <div>
                    <p style={s.chartTitle}>Monthly Spend vs Agency Estimate</p>
                    <p style={s.chartSub}>Orange = what you paid · Gray = agency equivalent</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={SPEND_DATA} barSize={14} barGap={4} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontFamily: "'Plus Jakarta Sans', sans-serif", fill: '#A8A29E', fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: "'Plus Jakarta Sans', sans-serif", fill: '#A8A29E' }} tickFormatter={v => `${v / 1000}k`} />
                    <Tooltip content={<SpendTooltip />} cursor={{ fill: '#F9F9F8' }} />
                    <Bar dataKey="paid"      fill="#F97316" radius={[4, 4, 0, 0]} name="paid" />
                    <Bar dataKey="agencyEst" fill="#E7E5E4" radius={[4, 4, 0, 0]} name="agencyEst" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* University breakdown */}
              <div style={s.chartCard}>
                <div style={s.chartHead}>
                  <p style={s.chartTitle}>University Breakdown</p>
                  <p style={s.chartSub}>Hires by institution</p>
                </div>
                <div style={s.pieWrap}>
                  <ResponsiveContainer width="50%" height={180}>
                    <PieChart>
                      <Pie data={UNIVERSITY_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={76} paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {UNIVERSITY_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
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
                    <span style={s.skillCount}>{item.count} hire{item.count !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── ROI SECTION ────────────────────────────────────── */}
          <div style={s.section}>
            <div style={s.sectionHead}>
              <div>
                <h2 style={s.sectionTitle}>Return on Investment</h2>
                <p style={s.sectionDesc}>How much you saved by hiring students vs traditional agencies</p>
              </div>
            </div>

            <div style={s.roiCard}>
              {/* Left: big saving number */}
              <div style={s.roiLeft}>
                <p style={s.roiSavedLabel}>Total Saved</p>
                <p style={s.roiSavedValue}>{totalSaved.toLocaleString()} RWF</p>
                <div style={s.roiBadge}>
                  <Icon.TrendUp />
                  <span>{roiPct}% ROI vs agency rates</span>
                </div>
                <p style={s.roiNote}>
                  Agency-equivalent cost estimated at 3.1x the student rate, based on typical Kigali market pricing for equivalent skills.
                </p>
              </div>

              {/* Divider */}
              <div style={s.roiDivider} />

              {/* Right: breakdown rows */}
              <div style={s.roiRight}>
                <p style={s.roiBreakdownTitle}>Savings by service type</p>
                {[
                  { label: 'Web Development',  paid: 75000,  agency: 232500 },
                  { label: 'Design & Branding', paid: 55000,  agency: 170500 },
                  { label: 'Translation',       paid: 8000,   agency: 24800  },
                  { label: 'Marketing',         paid: 30000,  agency: 93000  },
                  { label: 'Data & Analytics',  paid: 12000,  agency: 37200  },
                ].map(row => {
                  const saved = row.agency - row.paid;
                  const pct   = Math.round((saved / row.agency) * 100);
                  return (
                    <div key={row.label} style={s.roiRow}>
                      <span style={s.roiRowLabel}>{row.label}</span>
                      <div style={s.roiRowBar}>
                        <div style={s.roiBarTrack}>
                          <div style={{ ...s.roiBarFill, width: `${pct}%` }} />
                        </div>
                        <span style={s.roiRowSaved}>
                          +{saved.toLocaleString()} RWF
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── ACTIVE HIRES ───────────────────────────────────── */}
          <div style={s.section}>
            <div style={s.sectionHead}>
              <h2 style={s.sectionTitle}>Active Hires</h2>
              <Link href="#" style={s.sectionAction}>View all <Icon.ChevronRight /></Link>
            </div>
            <div style={s.table}>
              <div style={s.tableHead}>
                <span>Order</span>
                <span>Student</span>
                <span>Gig / Work</span>
                <span>Deadline</span>
                <span>Progress</span>
                <span>Amount</span>
                <span></span>
              </div>
              {HIRES.map((hire, i) => (
                <div key={hire.id} style={{ ...s.tableRow, ...(i === HIRES.length - 1 ? { borderBottom: 'none' } : {}) }}>
                  <span style={s.orderId}>{hire.id}</span>
                  <div style={s.orderBuyer}>
                    <div style={s.buyerAvatar}>{hire.initials}</div>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{hire.student}</span>
                  </div>
                  <span style={s.orderGig}>{hire.gig}</span>
                  <div style={s.orderDue}>
                    <Icon.Calendar />
                    <span>{hire.due}</span>
                  </div>
                  <div style={s.progressWrap}>
                    <div style={s.progressBar}>
                      <div style={{ ...s.progressFill, width: `${hire.progress}%` }} />
                    </div>
                    <span style={s.progressLabel}>{hire.progress}%</span>
                  </div>
                  <span style={s.orderAmount}>{hire.amount.toLocaleString()} RWF</span>
                  <button style={s.releaseBtn}>Release</button>
                </div>
              ))}
            </div>
          </div>

          {/* ── MY POSTED JOBS ─────────────────────────────────── */}
          <div style={s.section}>
            <div style={s.sectionHead}>
              <h2 style={s.sectionTitle}>My Posted Jobs</h2>
              <Link href="#" style={s.sectionAction}>View all <Icon.ChevronRight /></Link>
            </div>
            <div style={s.jobsGrid}>
              {JOBS.map(job => <JobCard key={job.id} job={job} />)}
            </div>
          </div>

          {/* ── BROWSE STUDENT GIGS ────────────────────────────── */}
          <div style={s.section}>
            <div style={s.sectionHead}>
              <div>
                <h2 style={s.sectionTitle}>Browse Student Gigs</h2>
                <p style={s.sectionDesc}>Hire directly from student-listed services</p>
              </div>
              <Link href="#" style={s.browseAllLink}>Browse all gigs <Icon.ChevronRight /></Link>
            </div>
            <div style={s.searchWrap}>
              <span style={s.searchIcon}><Icon.Search /></span>
              <input type="text" placeholder="Search for a skill or service..." style={s.searchInput} />
            </div>
            <div style={s.gigsGrid}>
              {FEATURED_GIGS.map(gig => (
                <div key={gig.id} style={s.gigCard}>
                  <div style={s.gigThumb}>
                    <span style={s.gigThumbLabel}>{gig.category}</span>
                  </div>
                  <div style={s.gigBody}>
                    <div style={s.gigSeller}>
                      <div style={s.gigSellerAvatar}>{gig.initials}</div>
                      <span style={s.gigSellerName}>{gig.seller}</span>
                    </div>
                    <p style={s.gigTitle}>{gig.title}</p>
                    <div style={s.gigFooter}>
                      <div style={s.gigRating}>
                        <Icon.Star />
                        <span style={s.gigRatingNum}>{gig.rating.toFixed(1)}</span>
                        <span style={s.gigRatingCount}>({gig.reviews})</span>
                      </div>
                      <div>
                        <span style={s.gigPriceFrom}>From </span>
                        <span style={s.gigPriceVal}>{gig.price.toLocaleString()} RWF</span>
                      </div>
                    </div>
                  </div>
                  <div style={s.gigCta}>
                    <button style={s.bookBtn}>Book this Gig</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #F5F5F4; }
        a { text-decoration: none; color: inherit; }
        button { font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; }
        @media (max-width: 960px) {
          .jobs-grid { grid-template-columns: 1fr !important; }
          .gigs-grid { grid-template-columns: 1fr 1fr !important; }
          .table-head { display: none !important; }
        }
        @media (max-width: 640px) {
          .gigs-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  root: { minHeight: '100vh', background: '#F5F5F4', fontFamily: "'Plus Jakarta Sans', sans-serif", WebkitFontSmoothing: 'antialiased', color: '#0C0A09' },

  // NAV
  nav: { position: 'sticky', top: 0, zIndex: 100, background: 'white', borderBottom: '1px solid #E7E5E4' },
  navInner: { maxWidth: 1160, margin: '0 auto', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' },
  logoMark: { width: 28, height: 28, background: '#F97316', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontWeight: 800, fontSize: '0.95rem', color: '#0C0A09', letterSpacing: '-0.02em' },
  navRight: { display: 'flex', alignItems: 'center', gap: 4 },
  switchLink: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, color: '#44403C', border: '1px solid #E7E5E4', marginRight: 6, textDecoration: 'none' },
  navLink: { padding: '6px 12px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, color: '#44403C', textDecoration: 'none' },
  avatar: { width: 32, height: 32, borderRadius: 999, background: '#0C0A09', color: 'white', border: 'none', fontSize: '0.62rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: 8, letterSpacing: '0.02em' },
  profileMenu: { position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', border: '1px solid #E7E5E4', minWidth: 210, padding: '6px 0', zIndex: 200 },
  profileHead: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' },
  profileAvatar: { width: 32, height: 32, borderRadius: 999, background: '#0C0A09', color: 'white', fontSize: '0.62rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  profileName: { fontWeight: 700, fontSize: '0.85rem', color: '#0C0A09' },
  profileSub: { fontSize: '0.72rem', color: '#A8A29E', marginTop: 1 },
  menuDivider: { height: 1, background: '#F5F5F4', margin: '4px 0' },
  menuItem: { display: 'block', width: '100%', padding: '8px 14px', background: 'none', border: 'none', fontSize: '0.82rem', fontWeight: 500, color: '#1C1917', textAlign: 'left' as const, cursor: 'pointer' },

  // MAIN
  main: { padding: '36px 0 80px' },
  container: { maxWidth: 1160, margin: '0 auto', padding: '0 28px' },
  greeting: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap' as const, gap: 12 },
  greetingSub: { fontSize: '0.8rem', fontWeight: 500, color: '#A8A29E', marginBottom: 3 },
  greetingName: { fontSize: '1.6rem', fontWeight: 800, color: '#0C0A09', letterSpacing: '-0.03em' },
  postJobBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F97316', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: '0.85rem', fontWeight: 700 },

  // Stats
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 },
  statCard: { background: 'white', border: '1px solid #E7E5E4', borderRadius: 12, padding: '20px 22px', display: 'flex', alignItems: 'flex-start', gap: 14 },
  statIcon: { width: 38, height: 38, borderRadius: 9, background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  statLabel: { fontSize: '0.72rem', fontWeight: 600, color: '#A8A29E', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 },
  statValue: { fontSize: '1.3rem', fontWeight: 800, color: '#0C0A09', letterSpacing: '-0.025em', lineHeight: 1, marginBottom: 4 },
  statSub: { fontSize: '0.73rem', color: '#A8A29E', fontWeight: 500 },

  // Sections
  section: { marginBottom: 32 },
  sectionHead: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 12 },
  sectionTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#0C0A09', letterSpacing: '-0.01em' },
  sectionDesc: { fontSize: '0.78rem', color: '#A8A29E', marginTop: 2 },
  sectionAction: { display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 600, color: '#78716C', textDecoration: 'none', flexShrink: 0 },
  browseAllLink: { display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', fontWeight: 700, color: '#F97316', textDecoration: 'none', flexShrink: 0, marginTop: 4 },
  periodBadge: { fontSize: '0.72rem', fontWeight: 600, color: '#78716C', background: '#F5F5F4', border: '1px solid #E7E5E4', borderRadius: 999, padding: '4px 12px', flexShrink: 0 },

  // Analytics
  analyticsKpiRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 },
  chartCard: { background: 'white', border: '1px solid #E7E5E4', borderRadius: 12, padding: '20px 22px' },
  chartHead: { marginBottom: 16 },
  chartTitle: { fontSize: '0.88rem', fontWeight: 700, color: '#0C0A09', letterSpacing: '-0.01em' },
  chartSub: { fontSize: '0.73rem', color: '#A8A29E', marginTop: 2 },
  tooltip: { background: '#0C0A09', border: 'none', borderRadius: 8, padding: '8px 12px' },
  tooltipLabel: { fontSize: '0.72rem', color: '#A8A29E', fontWeight: 600, marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" },
  tooltipRow: { fontSize: '0.8rem', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 2 },
  pieWrap: { display: 'flex', alignItems: 'center', gap: 8 },
  pieLegend: { flex: 1, display: 'flex', flexDirection: 'column' as const, gap: 12 },
  legendItem: { display: 'flex', alignItems: 'flex-start', gap: 10 },
  legendDot: { width: 10, height: 10, borderRadius: 999, flexShrink: 0, marginTop: 3 },
  legendName: { fontSize: '0.78rem', fontWeight: 600, color: '#0C0A09', lineHeight: 1.3 },
  legendPct: { fontSize: '0.7rem', color: '#A8A29E', marginTop: 1 },
  skillsCard: { background: 'white', border: '1px solid #E7E5E4', borderRadius: 12, padding: '20px 22px' },
  skillsList: { display: 'flex', flexDirection: 'column' as const, gap: 12 },
  skillRow: { display: 'grid', gridTemplateColumns: '150px 1fr 70px', alignItems: 'center', gap: 14 },
  skillName: { fontSize: '0.8rem', fontWeight: 600, color: '#1C1917' },
  skillBarTrack: { height: 6, background: '#F5F5F4', borderRadius: 999, overflow: 'hidden' },
  skillBarFill: { height: '100%', background: '#F97316', borderRadius: 999 },
  skillCount: { fontSize: '0.72rem', fontWeight: 600, color: '#A8A29E', textAlign: 'right' as const },

  // ROI
  roiCard: { background: 'white', border: '1px solid #E7E5E4', borderRadius: 12, padding: '28px', display: 'flex', gap: 40, alignItems: 'flex-start' },
  roiLeft: { flexShrink: 0, width: 220 },
  roiSavedLabel: { fontSize: '0.72rem', fontWeight: 600, color: '#A8A29E', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 },
  roiSavedValue: { fontSize: '2rem', fontWeight: 800, color: '#0C0A09', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 12 },
  roiBadge: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 999, padding: '5px 12px', fontSize: '0.78rem', fontWeight: 700, color: '#16A34A', marginBottom: 14 },
  roiNote: { fontSize: '0.73rem', color: '#A8A29E', lineHeight: 1.6 },
  roiDivider: { width: 1, background: '#E7E5E4', alignSelf: 'stretch', flexShrink: 0 },
  roiRight: { flex: 1 },
  roiBreakdownTitle: { fontSize: '0.8rem', fontWeight: 700, color: '#0C0A09', marginBottom: 16 },
  roiRow: { display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 16, marginBottom: 14 },
  roiRowLabel: { fontSize: '0.8rem', fontWeight: 600, color: '#1C1917' },
  roiRowBar: { display: 'flex', alignItems: 'center', gap: 12 },
  roiBarTrack: { flex: 1, height: 6, background: '#F5F5F4', borderRadius: 999, overflow: 'hidden' },
  roiBarFill: { height: '100%', background: '#16A34A', borderRadius: 999 },
  roiRowSaved: { fontSize: '0.75rem', fontWeight: 700, color: '#16A34A', whiteSpace: 'nowrap' as const, width: 110, textAlign: 'right' as const },

  // Table
  table: { background: 'white', border: '1px solid #E7E5E4', borderRadius: 12, overflow: 'hidden' },
  tableHead: { display: 'grid', gridTemplateColumns: '80px 160px 1fr 140px 120px 130px 80px', gap: 12, padding: '11px 20px', background: '#FAFAFA', borderBottom: '1px solid #E7E5E4', fontSize: '0.68rem', fontWeight: 700, color: '#A8A29E', textTransform: 'uppercase' as const, letterSpacing: '0.07em' },
  tableRow: { display: 'grid', gridTemplateColumns: '80px 160px 1fr 140px 120px 130px 80px', gap: 12, padding: '15px 20px', alignItems: 'center', borderBottom: '1px solid #F5F5F4', fontSize: '0.83rem', color: '#1C1917' },
  orderId: { fontWeight: 700, color: '#F97316', fontSize: '0.8rem' },
  orderGig: { fontWeight: 600, color: '#0C0A09' },
  orderBuyer: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#44403C' },
  buyerAvatar: { width: 26, height: 26, borderRadius: 999, background: '#F5F5F4', border: '1px solid #E7E5E4', color: '#44403C', fontSize: '0.58rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, letterSpacing: '0.02em' },
  orderDue: { display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#78716C', fontWeight: 500 },
  orderAmount: { fontWeight: 700, fontSize: '0.83rem', color: '#0C0A09' },
  progressWrap: { display: 'flex', alignItems: 'center', gap: 8 },
  progressBar: { flex: 1, height: 5, background: '#F5F5F4', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', background: '#F97316', borderRadius: 999 },
  progressLabel: { fontSize: '0.72rem', fontWeight: 700, color: '#78716C', whiteSpace: 'nowrap' as const },
  releaseBtn: { background: 'white', color: '#0C0A09', border: '1px solid #E7E5E4', borderRadius: 7, padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700 },

  // Jobs grid
  jobsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  jobCard: { background: 'white', border: '1px solid #E7E5E4', borderRadius: 12, padding: '18px', display: 'flex', flexDirection: 'column' as const, gap: 14 },
  jobCardTop: { display: 'flex', gap: 12, justifyContent: 'space-between' },
  jobCardLeft: { flex: 1 },
  jobCatPill: { display: 'inline-block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#78716C', background: '#F5F5F4', border: '1px solid #E7E5E4', borderRadius: 999, padding: '3px 10px', marginBottom: 8 },
  jobTitle: { fontWeight: 600, fontSize: '0.86rem', color: '#0C0A09', lineHeight: 1.45, marginBottom: 6 },
  jobPosted: { fontSize: '0.72rem', color: '#A8A29E' },
  jobCardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 10, borderTop: '1px solid #F5F5F4', paddingTop: 14 },
  jobMeta: { display: 'flex', alignItems: 'center', gap: 14 },
  jobMetaItem: { display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#78716C' },
  jobCardActions: { display: 'flex', alignItems: 'center', gap: 8 },
  statusPill: { fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999 },
  statusOpen: { background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' },
  statusClosed: { background: '#F5F5F4', color: '#78716C', border: '1px solid #E7E5E4' },
  reviewBtn: { background: '#0C0A09', color: 'white', border: 'none', borderRadius: 7, padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700 },

  // Browse
  searchWrap: { position: 'relative', marginBottom: 16 },
  searchIcon: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#A8A29E', display: 'flex', alignItems: 'center' },
  searchInput: { width: '100%', maxWidth: 420, padding: '10px 14px 10px 40px', border: '1px solid #E7E5E4', borderRadius: 9, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.85rem', color: '#0C0A09', background: 'white', outline: 'none' },
  gigsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  gigCard: { background: 'white', border: '1px solid #E7E5E4', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' as const },
  gigThumb: { height: 128, background: '#F5F5F4', display: 'flex', alignItems: 'flex-end', padding: '10px 12px', borderBottom: '1px solid #E7E5E4' },
  gigThumbLabel: { fontSize: '0.65rem', fontWeight: 700, color: '#78716C', textTransform: 'uppercase' as const, letterSpacing: '0.07em', background: 'white', border: '1px solid #E7E5E4', borderRadius: 999, padding: '3px 10px' },
  gigBody: { padding: '14px 16px 12px', flex: 1 },
  gigSeller: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 },
  gigSellerAvatar: { width: 22, height: 22, borderRadius: 999, background: '#0C0A09', color: 'white', fontSize: '0.55rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  gigSellerName: { fontSize: '0.75rem', fontWeight: 600, color: '#44403C' },
  gigTitle: { fontSize: '0.84rem', fontWeight: 600, color: '#0C0A09', lineHeight: 1.45, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' },
  gigFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  gigRating: { display: 'flex', alignItems: 'center', gap: 4 },
  gigRatingNum: { fontSize: '0.8rem', fontWeight: 700, color: '#0C0A09' },
  gigRatingCount: { fontSize: '0.73rem', color: '#A8A29E' },
  gigPriceFrom: { fontSize: '0.72rem', color: '#A8A29E' },
  gigPriceVal: { fontSize: '0.88rem', fontWeight: 800, color: '#0C0A09' },
  gigCta: { padding: '0 16px 14px' },
  bookBtn: { width: '100%', background: '#F97316', color: 'white', border: 'none', borderRadius: 8, padding: '9px', fontSize: '0.82rem', fontWeight: 700 },

  // Shared
  iconBtn: { background: 'none', border: '1px solid #E7E5E4', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#78716C', cursor: 'pointer' },
  dropdown: { position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: 'white', border: '1px solid #E7E5E4', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.09)', minWidth: 150, padding: '5px 0', zIndex: 50 },
  dropdownItem: { display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', fontSize: '0.8rem', fontWeight: 500, color: '#1C1917', cursor: 'pointer', textAlign: 'left' as const },
  dropdownDivider: { height: 1, background: '#F5F5F4', margin: '3px 0' },
};