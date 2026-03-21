'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Gig {
  id: number;
  title: string;
  category: string;
  price: number;
  orders: number;
}

interface Order {
  id: string;
  buyer: string;
  initials: string;
  gig: string;
  due: string;
  amount: number;
}

interface Review {
  id: number;
  company: string;
  initials: string;
  role: string;
  text: string;
  date: string;
}

interface PortfolioProject {
  id: number;
  title: string;
  description: string;
  type: 'GitHub' | 'Behance' | 'Live' | 'Figma';
  url: string;
  tags: string[];
}

// ─── Student Profile ──────────────────────────────────────────────────────────

const STUDENT = {
  name: 'David Achibiri',
  initials: 'DA',
  university: 'African Leadership University',
  uniShort: 'ALU Rwanda',
  cohort: 'Class of 2025',
  year: 'Year 2',
  major: 'BSc. Software Engineering',
  bio: 'Full-stack developer with a focus on scalable web applications. Passionate about building products that solve real African problems.',
  skills: ['React', 'Next.js', 'PostgreSQL', 'Node.js', 'Figma', 'TypeScript'],
  completedJobs: 4,
  totalEarnings: 68000,
  avgRating: 4.9,
  reviewCount: 4,
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const GIGS: Gig[] = [
  { id: 1, title: 'I will set up your PostgreSQL Database with full schema design', category: 'Development', price: 15000, orders: 1 },
  { id: 2, title: 'I will translate 500 words to French with native accuracy',      category: 'Writing',     price: 8000,  orders: 1 },
  { id: 3, title: 'I will design a modern Startup Logo with full brand kit',        category: 'Design',      price: 20000, orders: 0 },
];

const ORDERS: Order[] = [
  { id: '#1042', buyer: 'Kigali Creative Co.', initials: 'KC', gig: 'PostgreSQL Database Setup', due: 'Due in 2 days', amount: 15000 },
  { id: '#1038', buyer: 'StartupHub Rwanda',   initials: 'SR', gig: 'Startup Logo Design',       due: 'Due in 5 days', amount: 20000 },
];

// Reviews are auto-populated from completed orders — empty array = no reviews yet
const REVIEWS: Review[] = [];

const PORTFOLIO: PortfolioProject[] = [
  {
    id: 1,
    title: 'UniHustle Rwanda',
    description: 'A full-stack freelance marketplace for ALU students and local businesses. Built with Next.js, Supabase, and Prisma.',
    type: 'GitHub',
    url: 'https://github.com',
    tags: ['Next.js', 'Supabase', 'TypeScript'],
  },
  {
    id: 2,
    title: 'Kigali Events App',
    description: 'Mobile-first event discovery app for Kigali. React Native frontend with a Node.js backend and PostgreSQL.',
    type: 'Live',
    url: 'https://example.com',
    tags: ['React Native', 'Node.js', 'Maps API'],
  },
  {
    id: 3,
    title: 'Brand System — TechHub RW',
    description: 'Complete brand identity system including logo, typography, and UI kit designed in Figma for a Kigali startup.',
    type: 'Figma',
    url: 'https://figma.com',
    tags: ['Figma', 'Branding', 'UI Kit'],
  },
];

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
  Orders: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" width={14} height={14}>
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Dots: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}>
      <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
    </svg>
  ),
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="#F97316" width={13} height={13}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  StarOutline: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#D6D3D1" strokeWidth={2} width={13} height={13}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  ExternalLink: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  Github: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  ),
  Figma: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}>
      <path d="M5 5.5A3.5 3.5 0 018.5 2H12v7H8.5A3.5 3.5 0 015 5.5zm7-3.5h3.5a3.5 3.5 0 110 7H12V2zm0 8.5h3.5a3.5 3.5 0 110 7H12v-7zm-7 3.5A3.5 3.5 0 018.5 10.5H12v7H8.5A3.5 3.5 0 015 14zm3.5 3.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
    </svg>
  ),
  Globe: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  Verified: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
};

// ─── Gig card ─────────────────────────────────────────────────────────────────

function GigCard({ gig }: { gig: Gig }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={s.gigCard}>
      <div style={s.gigThumb}>
        <span style={s.gigThumbLabel}>{gig.category}</span>
      </div>
      <div style={s.gigBody}>
        <p style={s.gigTitle}>{gig.title}</p>
        <div style={s.gigMeta}>
          <span style={{ ...s.gigOrderPill, ...(gig.orders > 0 ? s.gigOrderPillActive : {}) }}>
            {gig.orders > 0 ? `${gig.orders} active order` : 'No orders yet'}
          </span>
        </div>
      </div>
      <div style={s.gigFooter}>
        <div>
          <span style={s.gigPriceFrom}>Starting at</span>
          <span style={s.gigPriceVal}>{gig.price.toLocaleString()} RWF</span>
        </div>
        <div style={{ position: 'relative' }}>
          <button style={s.iconBtn} onClick={() => setOpen(v => !v)} aria-label="Options">
            <Icon.Dots />
          </button>
          {open && (
            <div style={s.dropdown}>
              <button style={s.dropdownItem}><Icon.Edit /> Edit gig</button>
              <div style={s.dropdownDivider} />
              <button style={{ ...s.dropdownItem, color: '#EF4444' }}><Icon.Trash /> Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
        <div style={s.portfolioMeta}>
          <span style={{ ...s.portfolioTypeBadge, color: cfg.color, background: cfg.bg }}>
            {cfg.icon}
            {cfg.label}
          </span>
        </div>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentDashboard() {
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
              Switch to Buying
            </Link>
            <Link href="#" style={s.navLink}>
              <Icon.Orders />
              Orders
              <span style={s.navBadge}>2</span>
            </Link>
            <div style={{ position: 'relative' }}>
              <button style={s.avatar} onClick={() => setProfileOpen(v => !v)} aria-label="Profile">
                DA
              </button>
              {profileOpen && (
                <div style={s.profileMenu}>
                  <div style={s.profileHead}>
                    <div style={s.profileAvatar}>DA</div>
                    <div>
                      <div style={s.profileName}>{STUDENT.name}</div>
                      <div style={s.profileSub}>{STUDENT.uniShort} · {STUDENT.year}</div>
                    </div>
                  </div>
                  <div style={s.menuDivider} />
                  {['My Profile', 'Earnings', 'Settings'].map(item => (
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

      <main style={s.main}>
        <div style={s.container}>

          {/* ── PROFILE HEADER ─────────────────────────────────── */}
          <div style={s.profileCard}>
            <div style={s.profileCardLeft}>
              <div style={s.profileBigAvatar}>DA</div>
              <div style={s.profileDetails}>
                <div style={s.profileNameRow}>
                  <h1 style={s.profileDisplayName}>{STUDENT.name}</h1>
                  <div style={s.verifiedPill}>
                    <Icon.Verified />
                    <span>Verified Student</span>
                  </div>
                </div>
                <div style={s.profileUniRow}>
                  <span style={s.profileUni}>{STUDENT.university}</span>
                  <span style={s.profileDot}>·</span>
                  <span style={s.profileCohort}>{STUDENT.cohort}</span>
                  <span style={s.profileDot}>·</span>
                  <span style={s.profileMajor}>{STUDENT.major}</span>
                </div>
                <p style={s.profileBio}>{STUDENT.bio}</p>
                <div style={s.profileSkills}>
                  {STUDENT.skills.map(skill => (
                    <span key={skill} style={s.skillPill}>{skill}</span>
                  ))}
                </div>
              </div>
            </div>
            <div style={s.profileCardRight}>
              <button style={s.editProfileBtn}>
                <Icon.Edit />
                Edit Profile
              </button>
            </div>
          </div>

          {/* ── STATS ROW ──────────────────────────────────────── */}
          <div style={s.statsRow}>
            {[
              {
                label: 'Active Orders',
                value: String(ORDERS.length),
                sub: 'Currently in progress',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                    <path d="M9 12h6M9 16h4" />
                  </svg>
                ),
              },
              {
                label: 'Total Earnings',
                value: `${STUDENT.totalEarnings.toLocaleString()} RWF`,
                sub: 'All time',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                ),
              },
              {
                label: 'Jobs Completed',
                value: String(STUDENT.completedJobs),
                sub: 'Paid and delivered',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ),
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

          {/* ── ACTIVE ORDERS ──────────────────────────────────── */}
          <div style={s.section}>
            <div style={s.sectionHead}>
              <h2 style={s.sectionTitle}>Active Orders</h2>
              <Link href="#" style={s.sectionAction}>
                View all <Icon.ChevronRight />
              </Link>
            </div>
            <div style={s.table}>
              <div style={s.tableHead}>
                <span>Order ID</span>
                <span>Gig</span>
                <span>Buyer</span>
                <span>Deadline</span>
                <span>Amount</span>
                <span></span>
              </div>
              {ORDERS.map((order, i) => (
                <div key={order.id} style={{ ...s.tableRow, ...(i === ORDERS.length - 1 ? { borderBottom: 'none' } : {}) }}>
                  <span style={s.orderId}>{order.id}</span>
                  <span style={s.orderGig}>{order.gig}</span>
                  <div style={s.orderBuyer}>
                    <div style={s.buyerAvatar}>{order.initials}</div>
                    <span>{order.buyer}</span>
                  </div>
                  <div style={s.orderDue}>
                    <Icon.Calendar />
                    <span>{order.due}</span>
                  </div>
                  <span style={s.orderAmount}>{order.amount.toLocaleString()} RWF</span>
                  <button style={s.deliverBtn}>Deliver</button>
                </div>
              ))}
            </div>
          </div>

          {/* ── MY GIGS ────────────────────────────────────────── */}
          <div style={s.section}>
            <div style={s.sectionHead}>
              <h2 style={s.sectionTitle}>My Marketplace Gigs</h2>
              <button style={s.createBtn}>
                <Icon.Plus />
                Create a New Gig
              </button>
            </div>
            <div style={s.gigsGrid}>
              {GIGS.map(gig => <GigCard key={gig.id} gig={gig} />)}
            </div>
          </div>

          {/* ── REVIEW CANVAS ──────────────────────────────────── */}
          <div style={s.section}>
            <div style={s.sectionHead}>
              <div>
                <h2 style={s.sectionTitle}>Reviews from Companies</h2>
                <p style={s.sectionDesc}>Automatically populated after each completed job</p>
              </div>
              {REVIEWS.length > 0 && (
                <div style={s.reviewSummary}>
                  <div style={s.reviewStars}>
                    {[1,2,3,4,5].map(i => (
                      i <= Math.round(STUDENT.avgRating)
                        ? <Icon.Star key={i} />
                        : <Icon.StarOutline key={i} />
                    ))}
                  </div>
                  <span style={s.reviewAvg}>{STUDENT.avgRating.toFixed(1)}</span>
                  <span style={s.reviewTotal}>from {STUDENT.reviewCount} review{STUDENT.reviewCount !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {REVIEWS.length === 0 ? (
              <div style={s.emptyCanvas}>
                <div style={s.emptyCanvasIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#D6D3D1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={32} height={32}>
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </div>
                <p style={s.emptyCanvasTitle}>No reviews yet</p>
                <p style={s.emptyCanvasSub}>
                  Complete your first order and the company will be prompted to leave a review here automatically.
                </p>
              </div>
            ) : (
              <div style={s.reviewsGrid}>
                {REVIEWS.map(review => (
                  <div key={review.id} style={s.reviewCard}>
                    <div style={s.reviewTop}>
                      <div style={s.reviewAvatar}>{review.initials}</div>
                      <div>
                        <p style={s.reviewCompany}>{review.company}</p>
                        <p style={s.reviewRole}>{review.role}</p>
                      </div>
                      <span style={s.reviewDate}>{review.date}</span>
                    </div>
                    <p style={s.reviewText}>{review.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── PORTFOLIO ──────────────────────────────────────── */}
          <div style={s.section}>
            <div style={s.sectionHead}>
              <div>
                <h2 style={s.sectionTitle}>Zero-to-One Portfolio</h2>
                <p style={s.sectionDesc}>Personal projects, repositories, and designs — visible to businesses even before your first review</p>
              </div>
              <button style={s.createBtn}>
                <Icon.Plus />
                Add Project
              </button>
            </div>

            <div style={s.portfolioGrid}>
              {PORTFOLIO.map(project => (
                <PortfolioCard key={project.id} project={project} />
              ))}

              {/* Add new project card */}
              <button style={s.portfolioAddCard}>
                <div style={s.portfolioAddIcon}>
                  <Icon.Plus />
                </div>
                <p style={s.portfolioAddText}>Add a project</p>
                <p style={s.portfolioAddSub}>GitHub, Behance, Figma, or a live link</p>
              </button>
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
          .stats-row { grid-template-columns: 1fr 1fr !important; }
          .gigs-grid { grid-template-columns: 1fr 1fr !important; }
          .portfolio-grid { grid-template-columns: 1fr 1fr !important; }
          .table-head { display: none !important; }
        }
        @media (max-width: 640px) {
          .stats-row { grid-template-columns: 1fr !important; }
          .gigs-grid { grid-template-columns: 1fr !important; }
          .portfolio-grid { grid-template-columns: 1fr !important; }
          .profile-card-left { flex-direction: column !important; }
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
  navLink: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, color: '#44403C', textDecoration: 'none' },
  navBadge: { background: '#F97316', color: 'white', fontSize: '0.62rem', fontWeight: 800, borderRadius: 999, padding: '1px 6px' },
  avatar: { width: 32, height: 32, borderRadius: 999, background: '#0C0A09', color: 'white', border: 'none', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: 8 },
  profileMenu: { position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', border: '1px solid #E7E5E4', minWidth: 210, padding: '6px 0', zIndex: 200 },
  profileHead: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' },
  profileAvatar: { width: 32, height: 32, borderRadius: 999, background: '#0C0A09', color: 'white', fontSize: '0.62rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  profileName: { fontWeight: 700, fontSize: '0.85rem', color: '#0C0A09' },
  profileSub: { fontSize: '0.72rem', color: '#A8A29E', marginTop: 1 },
  menuDivider: { height: 1, background: '#F5F5F4', margin: '4px 0' },
  menuItem: { display: 'block', width: '100%', padding: '8px 14px', background: 'none', border: 'none', fontSize: '0.82rem', fontWeight: 500, color: '#1C1917', textAlign: 'left' as const, cursor: 'pointer' },

  // MAIN
  main: { padding: '32px 0 80px' },
  container: { maxWidth: 1160, margin: '0 auto', padding: '0 28px' },

  // Profile card
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
  createBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F97316', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700, flexShrink: 0 },

  // Table
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

  // Gig cards
  gigsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  gigCard: { background: 'white', border: '1px solid #E7E5E4', borderRadius: 12, overflow: 'hidden' },
  gigThumb: { height: 130, background: '#F5F5F4', display: 'flex', alignItems: 'flex-end', padding: '10px 12px', borderBottom: '1px solid #E7E5E4' },
  gigThumbLabel: { fontSize: '0.65rem', fontWeight: 700, color: '#78716C', textTransform: 'uppercase' as const, letterSpacing: '0.07em', background: 'white', border: '1px solid #E7E5E4', borderRadius: 999, padding: '3px 10px' },
  gigBody: { padding: '14px 16px 10px' },
  gigTitle: { fontSize: '0.86rem', fontWeight: 600, color: '#0C0A09', lineHeight: 1.45, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' },
  gigMeta: { display: 'flex', alignItems: 'center', justifyContent: 'flex-start' },
  gigOrderPill: { fontSize: '0.68rem', fontWeight: 600, padding: '3px 9px', borderRadius: 999, background: '#F5F5F4', color: '#78716C', border: '1px solid #E7E5E4' },
  gigOrderPillActive: { background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' },
  gigFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 14px', borderTop: '1px solid #F5F5F4' },
  gigPriceFrom: { fontSize: '0.68rem', color: '#A8A29E', display: 'block', marginBottom: 1 },
  gigPriceVal: { fontSize: '0.9rem', fontWeight: 800, color: '#0C0A09' },
  iconBtn: { background: 'none', border: '1px solid #E7E5E4', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#78716C', cursor: 'pointer' },
  dropdown: { position: 'absolute', bottom: 'calc(100% + 6px)', right: 0, background: 'white', border: '1px solid #E7E5E4', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.09)', minWidth: 150, padding: '5px 0', zIndex: 50 },
  dropdownItem: { display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: 'none', border: 'none', fontSize: '0.8rem', fontWeight: 500, color: '#1C1917', cursor: 'pointer', textAlign: 'left' as const },
  dropdownDivider: { height: 1, background: '#F5F5F4', margin: '3px 0' },

  // Review canvas
  reviewSummary: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  reviewStars: { display: 'flex', alignItems: 'center', gap: 2 },
  reviewAvg: { fontSize: '0.9rem', fontWeight: 800, color: '#0C0A09' },
  reviewTotal: { fontSize: '0.78rem', color: '#A8A29E' },
  emptyCanvas: { background: 'white', border: '1px dashed #E7E5E4', borderRadius: 12, padding: '48px 24px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8, textAlign: 'center' as const },
  emptyCanvasIcon: { width: 52, height: 52, borderRadius: 12, background: '#F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
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

  // Portfolio
  portfolioGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  portfolioCard: { background: 'white', border: '1px solid #E7E5E4', borderRadius: 12, padding: '18px', display: 'flex', flexDirection: 'column' as const, gap: 10 },
  portfolioCardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  portfolioMeta: { display: 'flex', alignItems: 'center', gap: 8 },
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