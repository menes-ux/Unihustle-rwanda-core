'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Gig {
  id: number;
  title: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
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

// ─── Data ─────────────────────────────────────────────────────────────────────

const GIGS: Gig[] = [
  { id: 1, title: 'I will set up your PostgreSQL Database with full schema design', category: 'Development', price: 15000, rating: 4.9, reviews: 12, orders: 1 },
  { id: 2, title: 'I will translate 500 words to French with native accuracy', category: 'Writing', price: 8000, rating: 5.0, reviews: 8, orders: 1 },
  { id: 3, title: 'I will design a modern Startup Logo with full brand kit', category: 'Design', price: 20000, rating: 4.8, reviews: 19, orders: 0 },
];

const ORDERS: Order[] = [
  { id: '#1042', buyer: 'Kigali Creative Co.', initials: 'KC', gig: 'PostgreSQL Database Setup', due: 'Due in 2 days', amount: 15000 },
  { id: '#1038', buyer: 'StartupHub Rwanda', initials: 'SR', gig: 'Startup Logo Design', due: 'Due in 5 days', amount: 20000 },
];

// ─── Icon components ──────────────────────────────────────────────────────────

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
};

// ─── Gig card ─────────────────────────────────────────────────────────────────

function GigCard({ gig }: { gig: Gig }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={s.gigCard}>
      {/* Image placeholder */}
      <div style={s.gigThumb}>
        <span style={s.gigThumbLabel}>{gig.category}</span>
      </div>

      {/* Body */}
      <div style={s.gigBody}>
        <p style={s.gigTitle}>{gig.title}</p>

        <div style={s.gigMeta}>
          <div style={s.gigRating}>
            <Icon.Star />
            <span style={s.gigRatingNum}>{gig.rating.toFixed(1)}</span>
            <span style={s.gigRatingCount}>({gig.reviews})</span>
          </div>
          <span style={{ ...s.gigOrderPill, ...(gig.orders > 0 ? s.gigOrderPillActive : {}) }}>
            {gig.orders > 0 ? `${gig.orders} active` : 'No orders'}
          </span>
        </div>
      </div>

      {/* Footer */}
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
              <button style={s.dropdownItem}>
                <Icon.Edit /> Edit gig
              </button>
              <div style={s.dropdownDivider} />
              <button style={{ ...s.dropdownItem, color: '#EF4444' }}>
                <Icon.Trash /> Delete
              </button>
            </div>
          )}
        </div>
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

          {/* Logo */}
          <Link href="/" style={s.logo}>
            <div style={s.logoMark}><Icon.Logo /></div>
            <span style={s.logoText}>UniHustle</span>
          </Link>

          {/* Right */}
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

            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <button style={s.avatar} onClick={() => setProfileOpen(v => !v)} aria-label="Profile">
                DA
              </button>
              {profileOpen && (
                <div style={s.profileMenu}>
                  <div style={s.profileHead}>
                    <div style={s.profileAvatar}>DA</div>
                    <div>
                      <div style={s.profileName}>David Achibiri</div>
                      <div style={s.profileSub}>ALU Student · Year 2</div>
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

      {/* ── MAIN ─────────────────────────────────────────────────── */}
      <main style={s.main}>
        <div style={s.container}>

          {/* Greeting */}
          <div style={s.greeting}>
            <div>
              <p style={s.greetingSub}>Good morning</p>
              <h1 style={s.greetingName}>David Achibiri</h1>
            </div>
          </div>

          {/* ── STATS ──────────────────────────────────────────── */}
          <div style={s.statsRow}>
            {[
              {
                label: 'Active Orders',
                value: '2',
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
                label: 'Earnings',
                value: '15,000 RWF',
                sub: 'This month',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                ),
              },
              {
                label: 'Seller Rating',
                value: '4.9',
                sub: 'Based on 39 reviews',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
              {/* Table header */}
              <div style={s.tableHead}>
                <span>Order ID</span>
                <span>Gig</span>
                <span>Buyer</span>
                <span>Deadline</span>
                <span>Amount</span>
                <span></span>
              </div>

              {/* Rows */}
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
              <h2 style={s.sectionTitle}>My Active Gigs</h2>
              <button style={s.createBtn}>
                <Icon.Plus />
                Create a New Gig
              </button>
            </div>

            <div style={s.gigsGrid}>
              {GIGS.map(gig => <GigCard key={gig.id} gig={gig} />)}
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

        @media (max-width: 900px) {
          .stats-row { grid-template-columns: 1fr !important; }
          .gigs-grid { grid-template-columns: 1fr !important; }
          .table-head { display: none !important; }
          .table-row { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
        }
        @media (max-width: 640px) {
          .nav-switch { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: '#F5F5F4',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    WebkitFontSmoothing: 'antialiased',
    color: '#0C0A09',
  },

  // NAV
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'white',
    borderBottom: '1px solid #E7E5E4',
  },
  navInner: {
    maxWidth: 1160,
    margin: '0 auto',
    padding: '0 28px',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
  },
  logoMark: {
    width: 28,
    height: 28,
    background: '#F97316',
    borderRadius: 7,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontWeight: 800,
    fontSize: '0.95rem',
    color: '#0C0A09',
    letterSpacing: '-0.02em',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  switchLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 8,
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#44403C',
    border: '1px solid #E7E5E4',
    marginRight: 6,
    textDecoration: 'none',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 8,
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#44403C',
    textDecoration: 'none',
  },
  navBadge: {
    background: '#F97316',
    color: 'white',
    fontSize: '0.62rem',
    fontWeight: 800,
    borderRadius: 999,
    padding: '1px 6px',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 999,
    background: '#0C0A09',
    color: 'white',
    border: 'none',
    fontSize: '0.65rem',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    marginLeft: 8,
    letterSpacing: '0.02em',
  },

  // Profile dropdown
  profileMenu: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    background: 'white',
    borderRadius: 12,
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
    border: '1px solid #E7E5E4',
    minWidth: 210,
    padding: '6px 0',
    zIndex: 200,
  },
  profileHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 14px',
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 999,
    background: '#0C0A09',
    color: 'white',
    fontSize: '0.62rem',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  profileName: { fontWeight: 700, fontSize: '0.85rem', color: '#0C0A09' },
  profileSub: { fontSize: '0.72rem', color: '#A8A29E', marginTop: 1 },
  menuDivider: { height: 1, background: '#F5F5F4', margin: '4px 0' },
  menuItem: {
    display: 'block',
    width: '100%',
    padding: '8px 14px',
    background: 'none',
    border: 'none',
    fontSize: '0.82rem',
    fontWeight: 500,
    color: '#1C1917',
    textAlign: 'left' as const,
    cursor: 'pointer',
  },

  // MAIN
  main: { padding: '36px 0 80px' },
  container: { maxWidth: 1160, margin: '0 auto', padding: '0 28px' },

  // Greeting
  greeting: {
    marginBottom: 28,
  },
  greetingSub: {
    fontSize: '0.8rem',
    fontWeight: 500,
    color: '#A8A29E',
    marginBottom: 3,
  },
  greetingName: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: '#0C0A09',
    letterSpacing: '-0.03em',
  },

  // Stats
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 14,
    marginBottom: 28,
  },
  statCard: {
    background: 'white',
    border: '1px solid #E7E5E4',
    borderRadius: 12,
    padding: '20px 22px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 9,
    background: '#FFF7ED',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  statLabel: {
    fontSize: '0.72rem',
    fontWeight: 600,
    color: '#A8A29E',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: 4,
  },
  statValue: {
    fontSize: '1.3rem',
    fontWeight: 800,
    color: '#0C0A09',
    letterSpacing: '-0.025em',
    lineHeight: 1,
    marginBottom: 4,
  },
  statSub: {
    fontSize: '0.73rem',
    color: '#A8A29E',
    fontWeight: 500,
  },

  // Sections
  section: { marginBottom: 32 },
  sectionHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#0C0A09',
    letterSpacing: '-0.01em',
  },
  sectionAction: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#78716C',
    textDecoration: 'none',
  },
  createBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: '#F97316',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: '0.82rem',
    fontWeight: 700,
  },

  // Table
  table: {
    background: 'white',
    border: '1px solid #E7E5E4',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHead: {
    display: 'grid',
    gridTemplateColumns: '90px 1fr 180px 150px 130px 90px',
    gap: 12,
    padding: '11px 20px',
    background: '#FAFAFA',
    borderBottom: '1px solid #E7E5E4',
    fontSize: '0.68rem',
    fontWeight: 700,
    color: '#A8A29E',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.07em',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '90px 1fr 180px 150px 130px 90px',
    gap: 12,
    padding: '15px 20px',
    alignItems: 'center',
    borderBottom: '1px solid #F5F5F4',
    fontSize: '0.83rem',
    color: '#1C1917',
  },
  orderId: { fontWeight: 700, color: '#F97316', fontSize: '0.8rem' },
  orderGig: { fontWeight: 600, color: '#0C0A09' },
  orderBuyer: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.82rem',
    color: '#44403C',
  },
  buyerAvatar: {
    width: 26,
    height: 26,
    borderRadius: 999,
    background: '#F5F5F4',
    border: '1px solid #E7E5E4',
    color: '#44403C',
    fontSize: '0.58rem',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    letterSpacing: '0.02em',
  },
  orderDue: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: '0.78rem',
    color: '#78716C',
    fontWeight: 500,
  },
  orderAmount: { fontWeight: 700, fontSize: '0.83rem', color: '#0C0A09' },
  deliverBtn: {
    background: '#0C0A09',
    color: 'white',
    border: 'none',
    borderRadius: 7,
    padding: '6px 14px',
    fontSize: '0.75rem',
    fontWeight: 700,
  },

  // Gig cards
  gigsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
  },
  gigCard: {
    background: 'white',
    border: '1px solid #E7E5E4',
    borderRadius: 12,
    overflow: 'hidden',
  },
  gigThumb: {
    height: 148,
    background: '#F5F5F4',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '10px 12px',
    borderBottom: '1px solid #E7E5E4',
  },
  gigThumbLabel: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#78716C',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.07em',
    background: 'white',
    border: '1px solid #E7E5E4',
    borderRadius: 999,
    padding: '3px 10px',
  },
  gigBody: {
    padding: '14px 16px 10px',
  },
  gigTitle: {
    fontSize: '0.86rem',
    fontWeight: 600,
    color: '#0C0A09',
    lineHeight: 1.45,
    marginBottom: 10,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },
  gigMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gigRating: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  gigRatingNum: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#0C0A09',
  },
  gigRatingCount: {
    fontSize: '0.73rem',
    color: '#A8A29E',
  },
  gigOrderPill: {
    fontSize: '0.68rem',
    fontWeight: 600,
    padding: '3px 9px',
    borderRadius: 999,
    background: '#F5F5F4',
    color: '#78716C',
    border: '1px solid #E7E5E4',
  },
  gigOrderPillActive: {
    background: '#F0FDF4',
    color: '#16A34A',
    border: '1px solid #BBF7D0',
  },
  gigFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px 14px',
    borderTop: '1px solid #F5F5F4',
  },
  gigPriceFrom: {
    fontSize: '0.68rem',
    color: '#A8A29E',
    display: 'block',
    marginBottom: 1,
  },
  gigPriceVal: {
    fontSize: '0.9rem',
    fontWeight: 800,
    color: '#0C0A09',
  },

  // Icon button
  iconBtn: {
    background: 'none',
    border: '1px solid #E7E5E4',
    borderRadius: 7,
    width: 30,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#78716C',
    cursor: 'pointer',
  },

  // Dropdown
  dropdown: {
    position: 'absolute',
    bottom: 'calc(100% + 6px)',
    right: 0,
    background: 'white',
    border: '1px solid #E7E5E4',
    borderRadius: 10,
    boxShadow: '0 8px 24px rgba(0,0,0,0.09)',
    minWidth: 150,
    padding: '5px 0',
    zIndex: 50,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    fontSize: '0.8rem',
    fontWeight: 500,
    color: '#1C1917',
    cursor: 'pointer',
    textAlign: 'left' as const,
  },
  dropdownDivider: {
    height: 1,
    background: '#F5F5F4',
    margin: '3px 0',
  },
};