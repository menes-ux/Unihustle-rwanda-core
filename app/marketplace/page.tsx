'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
export const dynamic = "force-dynamic";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Gig {
  id: number;
  title: string;
  seller: string;
  initials: string;
  avatarColor: string;
  university: string;
  category: string;
  price: number;
  deliveryDays: number;
  tags: string[];
  cohortYear: number; // year they joined — access expires after 2 years
  featured?: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

// Simulated "current year" for cohort access logic
const CURRENT_YEAR = 2026;

const SEED_GIGS: Gig[] = [
  { id: 1,  title: 'I will build a full-stack web application with Next.js and Supabase',  seller: 'David Achibiri',   initials: 'DA', avatarColor: '#10B981', university: 'ALU Rwanda',   category: 'Development', price: 60000, deliveryDays: 7,  tags: ['React', 'Next.js', 'Supabase'],     cohortYear: 2025, featured: true },
  { id: 2,  title: 'I will design a complete brand identity and logo for your startup',    seller: 'Manuelle Ackun',   initials: 'MA', avatarColor: '#8B5CF6', university: 'ALU Rwanda',   category: 'Design',      price: 20000, deliveryDays: 5,  tags: ['Figma', 'Branding', 'Logo'],         cohortYear: 2025 },
  { id: 3,  title: 'I will translate 500 words between English, French and Kinyarwanda',  seller: 'Jean Nepo M.',     initials: 'JN', avatarColor: '#3B82F6', university: 'ALU Rwanda',   category: 'Writing',     price: 8000,  deliveryDays: 2,  tags: ['Translation', 'French', 'Kinyarwanda'], cohortYear: 2025 },
  { id: 4,  title: 'I will set up your PostgreSQL database with full schema and seed data',seller: 'David Achibiri',   initials: 'DA', avatarColor: '#10B981', university: 'ALU Rwanda',   category: 'Development', price: 15000, deliveryDays: 3,  tags: ['PostgreSQL', 'SQL', 'Backend'],      cohortYear: 2025 },
  { id: 5,  title: 'I will create and manage your social media content for one month',    seller: 'Bonheur M.',       initials: 'BM', avatarColor: '#F59E0B', university: 'ALU Rwanda',   category: 'Marketing',   price: 30000, deliveryDays: 30, tags: ['Instagram', 'Content', 'Strategy'],  cohortYear: 2025, featured: true },
  { id: 6,  title: 'I will tutor you in mathematics, statistics or data analysis',        seller: 'Gilbert N.',       initials: 'GN', avatarColor: '#EF4444', university: 'ALU Rwanda',   category: 'Education',   price: 10000, deliveryDays: 1,  tags: ['Math', 'Statistics', 'Tutoring'],    cohortYear: 2025 },
  { id: 7,  title: 'I will write and proofread your academic or business report',         seller: 'Jean Nepo M.',     initials: 'JN', avatarColor: '#3B82F6', university: 'ALU Rwanda',   category: 'Writing',     price: 12000, deliveryDays: 3,  tags: ['Copywriting', 'Editing', 'Reports'], cohortYear: 2025 },
  { id: 8,  title: 'I will build a REST API with Node.js, Express and full documentation',seller: 'David Achibiri',   initials: 'DA', avatarColor: '#10B981', university: 'ALU Rwanda',   category: 'Development', price: 40000, deliveryDays: 5,  tags: ['Node.js', 'API', 'Express'],         cohortYear: 2025 },
  { id: 9,  title: 'I will design pitch deck slides for your startup or product demo',    seller: 'Amara Diallo',     initials: 'AD', avatarColor: '#0EA5E9', university: 'CMU Africa',   category: 'Design',      price: 35000, deliveryDays: 4,  tags: ['PowerPoint', 'Figma', 'Pitch Deck'], cohortYear: 2024 },
  { id: 10, title: 'I will perform accurate data entry and Excel spreadsheet management', seller: 'Kwame Asante',     initials: 'KA', avatarColor: '#D946EF', university: 'CMU Africa',   category: 'Data',        price: 12000, deliveryDays: 2,  tags: ['Excel', 'Data Entry', 'Sheets'],     cohortYear: 2024 },
  { id: 11, title: 'I will edit and produce your short-form video content for social',    seller: 'Aline Uwase',      initials: 'AU', avatarColor: '#F43F5E', university: 'UR Huye',      category: 'Marketing',   price: 18000, deliveryDays: 3,  tags: ['Video', 'Editing', 'Reels'],         cohortYear: 2024 },
  { id: 12, title: 'I will set up your mobile-responsive WordPress or Webflow site',      seller: 'Eric Mugisha',     initials: 'EM', avatarColor: '#14B8A6', university: 'UR Huye',      category: 'Development', price: 25000, deliveryDays: 5,  tags: ['WordPress', 'Webflow', 'CMS'],       cohortYear: 2023 },
  { id: 13, title: 'I will produce a professional voiceover in English or French',        seller: 'Chloe Ndayishimiye',initials: 'CN', avatarColor: '#A855F7', university: 'ALU Rwanda',   category: 'Writing',     price: 9000,  deliveryDays: 2,  tags: ['Voiceover', 'French', 'Audio'],      cohortYear: 2024 },
  { id: 14, title: 'I will do data analysis and create dashboards in Python or R',        seller: 'Luca Ntwari',      initials: 'LN', avatarColor: '#6366F1', university: 'CMU Africa',   category: 'Data',        price: 45000, deliveryDays: 6,  tags: ['Python', 'R', 'Dashboard'],          cohortYear: 2025 },
];

const CATEGORIES   = ['All', 'Development', 'Design', 'Writing', 'Marketing', 'Education', 'Data'];
const UNIVERSITIES = ['All Universities', 'ALU Rwanda', 'CMU Africa', 'UR Huye'];
const SORT_OPTIONS = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Delivery: Fastest'];

// ─── Cohort helpers ───────────────────────────────────────────────────────────

function getAccessStatus(cohortYear: number): 'active' | 'expiring' | 'expired' {
  const yearsIn = CURRENT_YEAR - cohortYear;
  if (yearsIn >= 2) return 'expired';
  if (yearsIn === 1) return 'expiring';
  return 'active';
}

function getCohortLabel(cohortYear: number): string {
  return `Class of ${cohortYear}`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icon = {
  Logo: () => (
    <svg viewBox="0 0 24 24" fill="white" width={16} height={16}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={12} height={12}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Filter: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
      <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  ),
  ChevronDown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" width={11} height={11}>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Verified: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={11} height={11}>
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Grid: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  List: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
};

// ─── Access Badge ─────────────────────────────────────────────────────────────

function AccessBadge({ cohortYear }: { cohortYear: number }) {
  const status = getAccessStatus(cohortYear);
  const label  = getCohortLabel(cohortYear);

  const styles: Record<string, React.CSSProperties> = {
    active:   { background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#16A34A' },
    expiring: { background: '#FFFBEB', border: '1px solid #FDE68A', color: '#D97706' },
    expired:  { background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' },
  };

  const labels: Record<string, string> = {
    active:   `${label} · Active`,
    expiring: `${label} · Last year`,
    expired:  `${label} · Expired`,
  };

  return (
    <span style={{ ...s.accessBadge, ...styles[status] }}>
      {labels[status]}
    </span>
  );
}

// ─── Gig Card (grid) ──────────────────────────────────────────────────────────

function GigCard({ gig, onBook }: { gig: Gig; onBook: (gigId: number) => Promise<void> }) {
  const [saved, setSaved] = useState(false);
  const status = getAccessStatus(gig.cohortYear);

  return (
    <div style={{ ...s.gigCard, ...(status === 'expired' ? s.gigCardExpired : {}) }}>

      {/* Thumb */}
      <div style={s.gigThumb}>
        {gig.featured && status !== 'expired' && (
          <div style={s.featuredBadge}>Featured</div>
        )}
        {status === 'expired' && (
          <div style={s.expiredOverlay}>
            <span style={s.expiredLabel}>Access Ended</span>
          </div>
        )}
        <button
          style={{ ...s.saveBtn, ...(saved ? s.saveBtnActive : {}) }}
          onClick={() => setSaved(v => !v)}
          aria-label="Save gig"
        >
          <svg viewBox="0 0 24 24" fill={saved ? '#F97316' : 'none'} stroke={saved ? '#F97316' : 'white'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
        <span style={s.gigThumbCat}>{gig.category}</span>
      </div>

      {/* Body */}
      <div style={s.gigBody}>
        {/* Seller row */}
        <div style={s.sellerRow}>
          <div style={{ ...s.sellerAvatar, background: gig.avatarColor }}>{gig.initials}</div>
          <div style={s.sellerInfo}>
            <span style={s.sellerName}>{gig.seller}</span>
            <span style={s.sellerUni}>{gig.university}</span>
          </div>
          <div style={s.verifiedBadge}>
            <Icon.Verified />
            <span>Verified</span>
          </div>
        </div>

        <p style={s.gigTitle}>{gig.title}</p>

        {/* Tags */}
        <div style={s.gigTags}>
          {gig.tags.slice(0, 3).map(tag => (
            <span key={tag} style={s.gigTag}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={s.gigFooter}>
        <div style={s.gigFooterLeft}>
          {/* Cohort access badge replaces rating */}
          <AccessBadge cohortYear={gig.cohortYear} />
          <div style={s.gigDelivery}>
            <Icon.Clock />
            <span>{gig.deliveryDays}d delivery</span>
          </div>
        </div>
        <div style={s.gigPriceWrap}>
          <span style={s.gigPriceFrom}>From</span>
          <span style={s.gigPrice}>{gig.price.toLocaleString()} RWF</span>
          {status !== 'expired' && (
            <button style={{ ...s.bookBtn, marginTop: 6 }} onClick={() => void onBook(gig.id)}>
              Book
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Gig Row (list view) ──────────────────────────────────────────────────────

function GigRow({ gig, onBook }: { gig: Gig; onBook: (gigId: number) => Promise<void> }) {
  const status = getAccessStatus(gig.cohortYear);
  return (
    <div style={{ ...s.gigRow, ...(status === 'expired' ? { opacity: 0.55 } : {}) }}>
      <div style={s.gigRowThumb}>
        <span style={s.gigThumbCat}>{gig.category}</span>
      </div>
      <div style={s.gigRowBody}>
        <div style={s.sellerRow}>
          <div style={{ ...s.sellerAvatar, background: gig.avatarColor }}>{gig.initials}</div>
          <span style={s.sellerName}>{gig.seller}</span>
          <span style={s.sellerUniInline}>{gig.university}</span>
          <div style={s.verifiedBadge}>
            <Icon.Verified />
            <span>Verified</span>
          </div>
        </div>
        <p style={s.gigRowTitle}>{gig.title}</p>
        <div style={s.gigRowMeta}>
          <AccessBadge cohortYear={gig.cohortYear} />
          <div style={s.gigDelivery}>
            <Icon.Clock />
            <span>{gig.deliveryDays}d delivery</span>
          </div>
          <div style={s.gigTags}>
            {gig.tags.map(tag => <span key={tag} style={s.gigTag}>{tag}</span>)}
          </div>
        </div>
      </div>
      <div style={s.gigRowPrice}>
        <span style={s.gigPriceFrom}>From</span>
        <span style={s.gigPrice}>{gig.price.toLocaleString()} RWF</span>
        {status !== 'expired' && <button style={s.bookBtn} onClick={() => void onBook(gig.id)}>Book</button>}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Marketplace() {
  const [search, setSearch]               = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeUniversity, setActiveUniversity] = useState('All Universities');
  const [sortBy, setSortBy]               = useState('Newest');
  const [sortOpen, setSortOpen]           = useState(false);
  const [priceRange, setPriceRange]       = useState<[number, number]>([0, 100000]);
  const [maxDelivery, setMaxDelivery]     = useState(30);
  const [listView, setListView]           = useState(false);
  const [profileOpen, setProfileOpen]     = useState(false);
  const [showExpired, setShowExpired]     = useState(false);
  const [gigs, setGigs]                   = useState<Gig[]>(SEED_GIGS);
  const [actionMessage, setActionMessage] = useState('');
  const [buyerEmail, setBuyerEmail]       = useState('');
  const [session, setSession]             = useState<{ logged_in: boolean; email?: string; role?: string } | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Fetch session on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/session');
        const data = await response.json();
        setSession(data);
      } catch {
        setSession({ logged_in: false });
      } finally {
        setSessionLoading(false);
      }
    };
    void fetchSession();
  }, []);

  useEffect(() => {
    setBuyerEmail(new URLSearchParams(window.location.search).get('email') ?? '');
  }, []);

  useEffect(() => {
    const loadGigs = async () => {
      try {
        const response = await fetch('/api/gigs');
        const data = await response.json();
        if (!response.ok || !Array.isArray(data.gigs)) {
          return;
        }

        const mapped: Gig[] = data.gigs.map((item: {
          id: number;
          title: string;
          seller: string;
          university: string;
          category: string;
          price: number;
          deliveryDays: number;
          tags: string[];
          cohortYear: number;
        }) => {
          const parts = item.seller.split(' ').filter(Boolean);
          const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'ST';
          return {
            id: item.id,
            title: item.title,
            seller: item.seller,
            initials,
            avatarColor: '#0C0A09',
            university: item.university,
            category: item.category,
            price: item.price,
            deliveryDays: item.deliveryDays ?? 7,
            tags: item.tags?.length ? item.tags : [item.category],
            cohortYear: item.cohortYear ?? 2025,
          };
        });
        setGigs(mapped);
      } catch {
        // Keeps seed data if API is unavailable.
      }
    };
    void loadGigs();
  }, []);

  const handleBookGig = async (gigId: number) => {
    setActionMessage('');
    if (!buyerEmail) {
      setActionMessage('Add your business email in the URL (?email=you@company.com) to place orders.');
      return;
    }
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gigId, buyerEmail }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to place order');
      }
      setActionMessage('Order placed successfully.');
    } catch (error: unknown) {
      setActionMessage(error instanceof Error ? error.message : 'Unable to place order');
    }
  };

  const filtered = useMemo(() => {
    let list = [...gigs];

    if (!showExpired) list = list.filter(g => getAccessStatus(g.cohortYear) !== 'expired');
    if (activeCategory !== 'All') list = list.filter(g => g.category === activeCategory);
    if (activeUniversity !== 'All Universities') list = list.filter(g => g.university === activeUniversity);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.seller.toLowerCase().includes(q) ||
        g.tags.some(t => t.toLowerCase().includes(q)) ||
        g.university.toLowerCase().includes(q)
      );
    }
    list = list.filter(g => g.price >= priceRange[0] && g.price <= priceRange[1]);
    list = list.filter(g => g.deliveryDays <= maxDelivery);

    switch (sortBy) {
      case 'Price: Low to High':  list.sort((a, b) => a.price - b.price); break;
      case 'Price: High to Low':  list.sort((a, b) => b.price - a.price); break;
      case 'Delivery: Fastest':   list.sort((a, b) => a.deliveryDays - b.deliveryDays); break;
      default:                    list.sort((a, b) => b.id - a.id);
    }

    return list;
  }, [search, activeCategory, activeUniversity, sortBy, priceRange, maxDelivery, showExpired, gigs]);

  const resetAll = () => {
    setSearch(''); setActiveCategory('All'); setActiveUniversity('All Universities');
    setPriceRange([0, 100000]); setMaxDelivery(30); setShowExpired(false);
  };

  const activeFilters: { label: string; clear: () => void }[] = [];
  if (activeCategory !== 'All')             activeFilters.push({ label: activeCategory,     clear: () => setActiveCategory('All') });
  if (activeUniversity !== 'All Universities') activeFilters.push({ label: activeUniversity, clear: () => setActiveUniversity('All Universities') });
  if (priceRange[1] < 100000)               activeFilters.push({ label: `Max ${priceRange[1].toLocaleString()} RWF`, clear: () => setPriceRange([0, 100000]) });
  if (maxDelivery < 30)                     activeFilters.push({ label: `${maxDelivery}d delivery`, clear: () => setMaxDelivery(30) });
  if (showExpired)                          activeFilters.push({ label: 'Including expired',  clear: () => setShowExpired(false) });

  return (
    <div style={s.pageWrapper}>

      {/* ── NAV ──────────────────────────────────────────────────── */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <Link href="/" style={s.logo}>
            <div style={s.logoMark}><Icon.Logo /></div>
            <span style={s.logoText}>UniHustle</span>
          </Link>

          <div style={s.navSearch}>
            <span style={s.navSearchIcon}><Icon.Search /></span>
            <input
              style={s.navSearchInput}
              type="text"
              placeholder="Search for any service, skill, or university..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button style={s.navSearchClear} onClick={() => setSearch('')}>
                <Icon.X />
              </button>
            )}
          </div>

          <div style={s.navRight}>
            {session && session.logged_in ? (
              <>
                <Link href={session.role === 'business' ? '/dashboards/business' : '/dashboards/student'} style={s.dashboardLink}>
                  {session.role === 'business' ? 'My Dashboard' : 'My Profile'}
                </Link>
                <div style={{ position: 'relative' }}>
                  <button style={s.avatar} onClick={() => setProfileOpen(v => !v)}>
                    {session.email?.slice(0, 2).toUpperCase() ?? 'U'}
                  </button>
                  {profileOpen && (
                    <div style={s.profileMenu}>
                      <div style={s.profileHead}>
                        <div style={{ ...s.profileAvatar, background: '#0C0A09' }}>
                          {session.email?.slice(0, 2).toUpperCase() ?? 'U'}
                        </div>
                        <div>
                          <div style={s.profileName}>{session.email}</div>
                          <div style={s.profileSub}>{session.role === 'business' ? 'Business' : 'Student'}</div>
                        </div>
                      </div>
                      <div style={s.menuDivider} />
                      <form action="/api/auth/logout" method="POST" style={{ margin: 0 }}>
                        <button type="submit" style={{ ...s.menuItem, color: '#EF4444' }}>
                          Log Out
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" style={s.navLoginBtn}>Log In</Link>
                <Link href="/login" style={s.navSignupBtn}>Sign Up Free</Link>
              </>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div style={s.catBar}>
          <div style={s.catBarInner}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                style={{ ...s.catTab, ...(activeCategory === cat ? s.catTabActive : {}) }}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── BODY ─────────────────────────────────────────────────── */}
      <div style={s.body} className="marketplace-body">

        {/* ── SIDEBAR ────────────────────────────────────────────── */}
        <aside style={s.sidebar} className="sidebar">
          <p style={s.sidebarHeading}>Filters</p>

          {/* University filter */}
          <div style={s.filterBlock}>
            <p style={s.filterLabel}>University</p>
            <div style={s.radioGroup}>
              {UNIVERSITIES.map(uni => (
                <label key={uni} style={s.radioRow}>
                  <input
                    type="radio"
                    name="university"
                    checked={activeUniversity === uni}
                    onChange={() => setActiveUniversity(uni)}
                    style={{ accentColor: '#F97316' }}
                  />
                  <span style={s.radioText}>{uni}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={s.filterDivider} />

          {/* Budget */}
          <div style={s.filterBlock}>
            <p style={s.filterLabel}>Budget (RWF)</p>
            <div style={s.priceInputs}>
              <input
                type="number"
                style={s.priceInput}
                placeholder="Min"
                value={priceRange[0] || ''}
                onChange={e => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
              />
              <span style={s.priceSep}>—</span>
              <input
                type="number"
                style={s.priceInput}
                placeholder="Max"
                value={priceRange[1] === 100000 ? '' : priceRange[1]}
                onChange={e => setPriceRange([priceRange[0], Number(e.target.value) || 100000])}
              />
            </div>
            <div style={s.pricePresets}>
              {([[0,15000],[15000,30000],[30000,60000]] as [number,number][]).map(([min, max]) => (
                <button
                  key={`${min}-${max}`}
                  style={{ ...s.presetBtn, ...(priceRange[0] === min && priceRange[1] === max ? s.presetBtnActive : {}) }}
                  onClick={() => setPriceRange([min, max])}
                >
                  {min === 0 ? `< ${max/1000}k` : `${min/1000}k–${max/1000}k`}
                </button>
              ))}
            </div>
          </div>

          <div style={s.filterDivider} />

          {/* Delivery time */}
          <div style={s.filterBlock}>
            <p style={s.filterLabel}>Delivery Time</p>
            <div style={s.deliveryBtns}>
              {[1, 3, 7, 30].map(d => (
                <button
                  key={d}
                  style={{ ...s.deliveryBtn, ...(maxDelivery === d ? s.deliveryBtnActive : {}) }}
                  onClick={() => setMaxDelivery(d)}
                >
                  {d === 1 ? '24 hrs' : d === 30 ? 'Any' : `${d} days`}
                </button>
              ))}
            </div>
          </div>

          <div style={s.filterDivider} />

          {/* Cohort access toggle */}
          <div style={s.filterBlock}>
            <p style={s.filterLabel}>Cohort Access</p>
            <label style={s.toggleRow}>
              <div
                style={{ ...s.toggleTrack, ...(showExpired ? s.toggleTrackOn : {}) }}
                onClick={() => setShowExpired(v => !v)}
              >
                <div style={{ ...s.toggleThumb, ...(showExpired ? s.toggleThumbOn : {}) }} />
              </div>
              <span style={s.toggleLabel}>Show expired cohorts</span>
            </label>
            <p style={s.cohortNote}>
              Each student has platform access for 2 years from their cohort year. Expired profiles are read-only.
            </p>
          </div>

          <div style={s.filterDivider} />

          <button style={s.resetBtn} onClick={resetAll}>Reset all filters</button>
        </aside>

        {/* ── RESULTS ────────────────────────────────────────────── */}
        <main style={s.results}>
          {actionMessage && (
            <p style={{ marginBottom: 10, color: actionMessage.includes('success') ? '#16A34A' : '#DC2626', fontWeight: 600, fontSize: '0.82rem' }}>
              {actionMessage}
            </p>
          )}

          {/* Results bar */}
          <div style={s.resultsBar}>
            <div>
              <p style={s.resultsCount}>
                <strong>{filtered.length}</strong> gig{filtered.length !== 1 ? 's' : ''} available
                {activeCategory !== 'All' && <span style={s.resultsCat}> in {activeCategory}</span>}
                {activeUniversity !== 'All Universities' && <span style={s.resultsCat}> from {activeUniversity}</span>}
              </p>
              {search && <p style={s.resultsSearch}>Results for &ldquo;{search}&rdquo;</p>}
            </div>

            <div style={s.resultsBarRight}>
              {/* Active filter chips */}
              {activeFilters.length > 0 && (
                <div style={s.filterChips}>
                  {activeFilters.map(f => (
                    <span key={f.label} style={s.filterChip}>
                      {f.label}
                      <button style={s.chipX} onClick={f.clear}><Icon.X /></button>
                    </span>
                  ))}
                </div>
              )}

              {/* Sort */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <button style={s.sortBtn} onClick={() => setSortOpen(v => !v)}>
                  <Icon.Filter />
                  {sortBy}
                  <Icon.ChevronDown />
                </button>
                {sortOpen && (
                  <div style={s.sortMenu}>
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        style={{ ...s.sortOption, ...(sortBy === opt ? s.sortOptionActive : {}) }}
                        onClick={() => { setSortBy(opt); setSortOpen(false); }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View toggle */}
              <div style={s.viewToggle}>
                <button style={{ ...s.viewBtn, ...(!listView ? s.viewBtnActive : {}) }} onClick={() => setListView(false)} aria-label="Grid view">
                  <Icon.Grid />
                </button>
                <button style={{ ...s.viewBtn, ...(listView ? s.viewBtnActive : {}) }} onClick={() => setListView(true)} aria-label="List view">
                  <Icon.List />
                </button>
              </div>
            </div>
          </div>

          {/* University quick-filter pills (above grid) */}
          <div style={s.uniPills}>
            {UNIVERSITIES.map(uni => (
              <button
                key={uni}
                style={{ ...s.uniPill, ...(activeUniversity === uni ? s.uniPillActive : {}) }}
                onClick={() => setActiveUniversity(uni)}
              >
                {uni}
              </button>
            ))}
          </div>

          {/* Grid or list */}
          {filtered.length > 0 ? (
            listView ? (
              <div style={s.listWrap}>
                {filtered.map(gig => (
                  <Link key={gig.id} href={`/marketplace/gigs/${gig.id}`} style={{ textDecoration: 'none' }}>
                    <GigRow gig={gig} onBook={handleBookGig} />
                  </Link>
                ))}
              </div>
            ) : (
              <div style={s.gigsGrid} className="gigs-grid">
                {filtered.map(gig => (
                  <Link key={gig.id} href={`/marketplace/gigs/${gig.id}`} style={{ textDecoration: 'none' }}>
                    <GigCard gig={gig} onBook={handleBookGig} />
                  </Link>
                ))}
              </div>
            )
          ) : (
            <div style={s.emptyState}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#D6D3D1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={44} height={44}>
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <p style={s.emptyTitle}>No gigs found</p>
              <p style={s.emptySub}>Try adjusting your filters or search query</p>
              <button style={s.emptyClear} onClick={resetAll}>Clear all filters</button>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #F5F5F4; }
        a { text-decoration: none; color: inherit; }
        button { font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; }
        input { font-family: 'Plus Jakarta Sans', sans-serif; }
        input:focus { outline: none; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); border-color: #F97316 !important; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        @media (max-width: 1024px) { .sidebar { display: none !important; } }
        @media (max-width: 768px) {
          .gigs-grid { grid-template-columns: repeat(2,1fr) !important; }
          .nav-right { display: none !important; }
        }
        @media (max-width: 480px) {
          .gigs-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  pageWrapper: {
    minHeight: '100vh',
    background: '#F5F5F4',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    WebkitFontSmoothing: 'antialiased',
    color: '#0C0A09',
  },

  // NAV
  nav: { position: 'sticky', top: 0, zIndex: 100, background: 'white', borderBottom: '1px solid #E7E5E4' },
  navInner: { maxWidth: 1200, margin: '0 auto', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', gap: 16 },
  logo: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, textDecoration: 'none' },
  logoMark: { width: 28, height: 28, background: '#F97316', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontWeight: 800, fontSize: '0.95rem', color: '#0C0A09', letterSpacing: '-0.02em' },
  navSearch: { flex: 1, maxWidth: 540, position: 'relative', display: 'flex', alignItems: 'center' },
  navSearchIcon: { position: 'absolute', left: 13, color: '#A8A29E', display: 'flex', alignItems: 'center', pointerEvents: 'none' },
  navSearchInput: { width: '100%', padding: '9px 36px 9px 40px', border: '1.5px solid #E7E5E4', borderRadius: 9, fontSize: '0.85rem', color: '#0C0A09', background: 'white', outline: 'none' },
  navSearchClear: { position: 'absolute', right: 12, background: 'none', border: 'none', color: '#A8A29E', display: 'flex', alignItems: 'center', padding: 2 },
  navRight: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  navLoginBtn: { padding: '7px 16px', borderRadius: 8, border: '1.5px solid #E7E5E4', background: 'white', fontSize: '0.82rem', fontWeight: 600, color: '#44403C' },
  navSignupBtn: { padding: '7px 16px', borderRadius: 8, background: '#F97316', color: 'white', border: 'none', fontSize: '0.82rem', fontWeight: 700 },
  dashboardLink: { padding: '7px 16px', borderRadius: 8, background: '#F97316', color: 'white', border: 'none', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none', display: 'inline-block' },
  avatar: { width: 32, height: 32, borderRadius: 999, background: '#0C0A09', color: 'white', border: 'none', fontSize: '0.62rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: 4 },
  profileMenu: { position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', border: '1px solid #E7E5E4', minWidth: 210, padding: '6px 0', zIndex: 200 },
  profileHead: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' },
  profileAvatar: { width: 32, height: 32, borderRadius: 999, color: 'white', fontSize: '0.62rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  profileName: { fontWeight: 700, fontSize: '0.85rem', color: '#0C0A09' },
  profileSub: { fontSize: '0.72rem', color: '#A8A29E', marginTop: 1 },
  menuDivider: { height: 1, background: '#F5F5F4', margin: '4px 0' },
  menuItem: { display: 'block', width: '100%', padding: '8px 14px', background: 'none', border: 'none', fontSize: '0.82rem', fontWeight: 500, color: '#1C1917', textAlign: 'left' as const, cursor: 'pointer' },

  // Category bar
  catBar: { borderTop: '1px solid #F5F5F4', overflow: 'hidden' },
  catBarInner: { maxWidth: 1200, margin: '0 auto', padding: '0 28px', display: 'flex', gap: 0, overflowX: 'auto' as const, scrollbarWidth: 'none' as const },
  catTab: { padding: '10px 18px', background: 'none', border: 'none', fontSize: '0.82rem', fontWeight: 600, color: '#78716C', whiteSpace: 'nowrap' as const, borderBottom: '2px solid transparent' },
  catTabActive: { color: '#0C0A09', borderBottom: '2px solid #F97316' },

  // Body
  body: { maxWidth: 1200, margin: '0 auto', padding: '28px 28px 80px', display: 'flex', gap: 28, alignItems: 'flex-start' },

  // Sidebar
  sidebar: { width: 230, flexShrink: 0, position: 'sticky', top: 112, background: 'white', border: '1px solid #E7E5E4', borderRadius: 12, padding: '20px' },
  sidebarHeading: { fontSize: '0.72rem', fontWeight: 700, color: '#A8A29E', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 18 },
  filterBlock: { marginBottom: 4 },
  filterLabel: { fontSize: '0.8rem', fontWeight: 700, color: '#0C0A09', marginBottom: 10 },
  filterDivider: { height: 1, background: '#F5F5F4', margin: '16px 0' },
  radioGroup: { display: 'flex', flexDirection: 'column' as const, gap: 9 },
  radioRow: { display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' },
  radioText: { fontSize: '0.82rem', fontWeight: 500, color: '#44403C' },
  priceInputs: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 },
  priceInput: { flex: 1, padding: '7px 10px', border: '1px solid #E7E5E4', borderRadius: 7, fontSize: '0.78rem', color: '#0C0A09', width: 0 },
  priceSep: { fontSize: '0.8rem', color: '#A8A29E', flexShrink: 0 },
  pricePresets: { display: 'flex', flexWrap: 'wrap' as const, gap: 5 },
  presetBtn: { padding: '4px 9px', borderRadius: 6, border: '1px solid #E7E5E4', background: 'white', fontSize: '0.72rem', fontWeight: 600, color: '#78716C' },
  presetBtnActive: { background: '#FFF7ED', borderColor: '#FDBA74', color: '#EA580C' },
  deliveryBtns: { display: 'flex', gap: 5, flexWrap: 'wrap' as const },
  deliveryBtn: { padding: '5px 9px', borderRadius: 7, border: '1px solid #E7E5E4', background: 'white', fontSize: '0.75rem', fontWeight: 600, color: '#78716C' },
  deliveryBtnActive: { background: '#FFF7ED', borderColor: '#FDBA74', color: '#EA580C' },
  toggleRow: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 10 },
  toggleTrack: { width: 34, height: 20, borderRadius: 999, background: '#E7E5E4', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' },
  toggleTrackOn: { background: '#F97316' },
  toggleThumb: { position: 'absolute', top: 3, left: 3, width: 14, height: 14, borderRadius: 999, background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' },
  toggleThumbOn: { left: 17 },
  toggleLabel: { fontSize: '0.8rem', fontWeight: 500, color: '#44403C' },
  cohortNote: { fontSize: '0.72rem', color: '#A8A29E', lineHeight: 1.55 },
  resetBtn: { width: '100%', padding: '9px', background: 'none', border: '1px solid #E7E5E4', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, color: '#78716C', marginTop: 4 },

  // Results
  results: { flex: 1, minWidth: 0 },
  resultsBar: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 12, flexWrap: 'wrap' as const },
  resultsBarRight: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const },
  resultsCount: { fontSize: '0.88rem', fontWeight: 500, color: '#44403C', lineHeight: 1.5 },
  resultsCat: { color: '#F97316' },
  resultsSearch: { fontSize: '0.78rem', color: '#A8A29E', marginTop: 2 },
  filterChips: { display: 'flex', flexWrap: 'wrap' as const, gap: 5 },
  filterChip: { display: 'inline-flex', alignItems: 'center', gap: 5, background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 999, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 600, color: '#EA580C' },
  chipX: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#EA580C', padding: 0 },
  sortBtn: { display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 8, border: '1px solid #E7E5E4', background: 'white', fontSize: '0.8rem', fontWeight: 600, color: '#44403C' },
  sortMenu: { position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: 'white', border: '1px solid #E7E5E4', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.09)', minWidth: 190, padding: '5px 0', zIndex: 50 },
  sortOption: { display: 'block', width: '100%', padding: '8px 14px', background: 'none', border: 'none', fontSize: '0.82rem', fontWeight: 500, color: '#1C1917', textAlign: 'left' as const, cursor: 'pointer' },
  sortOptionActive: { fontWeight: 700, color: '#F97316' },
  viewToggle: { display: 'flex', background: '#F5F5F4', borderRadius: 8, padding: 3, gap: 2 },
  viewBtn: { width: 30, height: 30, borderRadius: 6, border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A8A29E', cursor: 'pointer' },
  viewBtnActive: { background: 'white', color: '#0C0A09', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },

  // University quick pills
  uniPills: { display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' as const },
  uniPill: { padding: '5px 14px', borderRadius: 999, border: '1px solid #E7E5E4', background: 'white', fontSize: '0.78rem', fontWeight: 600, color: '#78716C' },
  uniPillActive: { background: '#0C0A09', color: 'white', borderColor: '#0C0A09' },

  // Gig grid
  gigsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },

  // Gig card
  gigCard: { background: 'white', border: '1px solid #E7E5E4', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' as const },
  gigCardExpired: { opacity: 0.6 },
  gigThumb: { height: 140, background: '#F5F5F4', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', padding: '10px 12px', borderBottom: '1px solid #E7E5E4' },
  featuredBadge: { position: 'absolute', top: 10, left: 10, background: '#0C0A09', color: 'white', fontSize: '0.62rem', fontWeight: 800, padding: '3px 9px', borderRadius: 999, letterSpacing: '0.04em', textTransform: 'uppercase' as const },
  expiredOverlay: { position: 'absolute', inset: 0, background: 'rgba(245,245,244,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  expiredLabel: { background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: 999 },
  saveBtn: { position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 999, background: 'rgba(0,0,0,0.22)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  saveBtnActive: { background: '#FFF7ED' },
  gigThumbCat: { fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#78716C', background: 'white', border: '1px solid #E7E5E4', borderRadius: 999, padding: '3px 10px' },
  gigBody: { padding: '14px 16px 10px', flex: 1 },
  sellerRow: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 },
  sellerAvatar: { width: 24, height: 24, borderRadius: 999, color: 'white', fontSize: '0.55rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sellerInfo: { display: 'flex', flexDirection: 'column' as const, minWidth: 0, flex: 1 },
  sellerName: { fontSize: '0.75rem', fontWeight: 700, color: '#0C0A09', lineHeight: 1.2 },
  sellerUni: { fontSize: '0.68rem', color: '#A8A29E', lineHeight: 1.2, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' },
  sellerUniInline: { fontSize: '0.72rem', color: '#A8A29E', fontWeight: 500 },
  verifiedBadge: { display: 'inline-flex', alignItems: 'center', gap: 3, flexShrink: 0, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 999, padding: '2px 7px', fontSize: '0.62rem', fontWeight: 700, color: '#16A34A' },
  gigTitle: { fontSize: '0.84rem', fontWeight: 600, color: '#0C0A09', lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' },
  gigTags: { display: 'flex', flexWrap: 'wrap' as const, gap: 5 },
  gigTag: { fontSize: '0.65rem', fontWeight: 600, color: '#78716C', background: '#F5F5F4', border: '1px solid #E7E5E4', borderRadius: 6, padding: '2px 8px' },
  gigFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 14px', borderTop: '1px solid #F5F5F4' },
  gigFooterLeft: { display: 'flex', flexDirection: 'column' as const, gap: 5 },
  gigDelivery: { display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#78716C', fontWeight: 500 },
  gigPriceWrap: { textAlign: 'right' as const },
  gigPriceFrom: { fontSize: '0.68rem', color: '#A8A29E', display: 'block' },
  gigPrice: { fontSize: '0.88rem', fontWeight: 800, color: '#0C0A09' },

  // Access badge
  accessBadge: { display: 'inline-block', fontSize: '0.65rem', fontWeight: 700, borderRadius: 999, padding: '2px 9px' },

  // List view
  listWrap: { display: 'flex', flexDirection: 'column' as const, gap: 10 },
  gigRow: { background: 'white', border: '1px solid #E7E5E4', borderRadius: 12, overflow: 'hidden', display: 'flex' },
  gigRowThumb: { width: 110, flexShrink: 0, background: '#F5F5F4', borderRight: '1px solid #E7E5E4', display: 'flex', alignItems: 'flex-end', padding: '10px 10px' },
  gigRowBody: { flex: 1, padding: '14px 16px', minWidth: 0 },
  gigRowTitle: { fontSize: '0.88rem', fontWeight: 600, color: '#0C0A09', lineHeight: 1.45, marginBottom: 10 },
  gigRowMeta: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' as const },
  gigRowPrice: { display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', justifyContent: 'center', padding: '14px 18px', flexShrink: 0, gap: 6, borderLeft: '1px solid #F5F5F4' },
  bookBtn: { background: '#F97316', color: 'white', border: 'none', borderRadius: 7, padding: '7px 16px', fontSize: '0.78rem', fontWeight: 700 },

  // Empty state
  emptyState: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '80px 24px', gap: 10, background: 'white', borderRadius: 12, border: '1px solid #E7E5E4' },
  emptyTitle: { fontSize: '1rem', fontWeight: 700, color: '#0C0A09', marginTop: 8 },
  emptySub: { fontSize: '0.85rem', color: '#A8A29E' },
  emptyClear: { marginTop: 8, padding: '8px 20px', background: '#F97316', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700 },
};