'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Gig {
  id: number;
  title: string;
  seller: string;
  initials: string;
  avatarColor: string;
  category: string;
  rating: number;
  reviews: number;
  price: number;
  deliveryDays: number;
  tags: string[];
  featured?: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ALL_GIGS: Gig[] = [
  { id: 1,  title: 'I will build a full-stack web app with Next.js and Supabase',   seller: 'David Achibiri',    initials: 'DA', avatarColor: '#10B981', category: 'Development', rating: 4.9, reviews: 12, price: 60000, deliveryDays: 7,  tags: ['React', 'Next.js', 'API'],        featured: true },
  { id: 2,  title: 'I will design a complete brand identity and logo system',        seller: 'Manuelle Ackun',    initials: 'MA', avatarColor: '#8B5CF6', category: 'Design',      rating: 5.0, reviews: 19, price: 25000, deliveryDays: 5,  tags: ['Figma', 'Branding', 'Logo'],       featured: true },
  { id: 3,  title: 'I will translate up to 1000 words to French or Kinyarwanda',    seller: 'Jean Nepo M.',      initials: 'JN', avatarColor: '#3B82F6', category: 'Writing',     rating: 4.8, reviews: 9,  price: 8000,  deliveryDays: 2,  tags: ['French', 'Kinyarwanda', 'Docs']               },
  { id: 4,  title: 'I will set up your PostgreSQL database with full schema',        seller: 'David Achibiri',    initials: 'DA', avatarColor: '#10B981', category: 'Development', rating: 4.9, reviews: 12, price: 15000, deliveryDays: 3,  tags: ['PostgreSQL', 'SQL', 'Backend']                 },
  { id: 5,  title: 'I will create a month of social media content for your brand',  seller: 'Bonheur Munezero',  initials: 'BM', avatarColor: '#F59E0B', category: 'Marketing',   rating: 4.7, reviews: 6,  price: 30000, deliveryDays: 6,  tags: ['Instagram', 'Content', 'Strategy']             },
  { id: 6,  title: 'I will tutor you in mathematics or computer science',            seller: 'Gilbert Ntivunwa',  initials: 'GN', avatarColor: '#EF4444', category: 'Education',   rating: 4.9, reviews: 14, price: 10000, deliveryDays: 1,  tags: ['Math', 'CS', 'Online'],           featured: true },
  { id: 7,  title: 'I will build and style a responsive landing page in HTML/CSS',  seller: 'Jean Nepo M.',      initials: 'JN', avatarColor: '#3B82F6', category: 'Development', rating: 4.6, reviews: 5,  price: 20000, deliveryDays: 4,  tags: ['HTML', 'CSS', 'Responsive']                    },
  { id: 8,  title: 'I will write and edit professional emails and business copy',   seller: 'Manuelle Ackun',    initials: 'MA', avatarColor: '#8B5CF6', category: 'Writing',     rating: 5.0, reviews: 7,  price: 6000,  deliveryDays: 1,  tags: ['Copywriting', 'Email', 'Business']             },
  { id: 9,  title: 'I will create a pitch deck for your startup or business idea',  seller: 'Bonheur Munezero',  initials: 'BM', avatarColor: '#F59E0B', category: 'Design',      rating: 4.8, reviews: 11, price: 35000, deliveryDays: 4,  tags: ['PowerPoint', 'Pitch', 'Slides']                },
  { id: 10, title: 'I will perform accurate data entry and spreadsheet management', seller: 'Gilbert Ntivunwa',  initials: 'GN', avatarColor: '#EF4444', category: 'Data',        rating: 4.7, reviews: 8,  price: 12000, deliveryDays: 2,  tags: ['Excel', 'Google Sheets', 'Data']               },
  { id: 11, title: 'I will develop a REST API with Node.js and Express',             seller: 'David Achibiri',    initials: 'DA', avatarColor: '#10B981', category: 'Development', rating: 4.9, reviews: 10, price: 40000, deliveryDays: 5,  tags: ['Node.js', 'REST', 'Express']                   },
  { id: 12, title: 'I will design and deliver custom UI components in Figma',       seller: 'Manuelle Ackun',    initials: 'MA', avatarColor: '#8B5CF6', category: 'Design',      rating: 5.0, reviews: 15, price: 18000, deliveryDays: 3,  tags: ['Figma', 'UI', 'Components']                    },
];

const CATEGORIES = ['All', 'Development', 'Design', 'Writing', 'Marketing', 'Education', 'Data'];
const SORT_OPTIONS = ['Most Popular', 'Newest', 'Price: Low to High', 'Price: High to Low', 'Top Rated'];
const DELIVERY_OPTIONS = ['Any', 'Express (1 day)', 'Up to 3 days', 'Up to 7 days'];

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
  Star: () => (
    <svg viewBox="0 0 24 24" fill="#F97316" width={12} height={12}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
    <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={12} height={12}>
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Grid: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  List: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
};

// ─── Gig Card ─────────────────────────────────────────────────────────────────

function GigCard({ gig, listView }: { gig: Gig; listView: boolean }) {
  if (listView) {
    return (
      <Link href={`/gigs/${gig.id}`} style={s.gigCardList}>
        <div style={s.gigListThumb}>
          <span style={{ ...s.gigThumbLabel, fontSize: '0.6rem' }}>{gig.category}</span>
          {gig.featured && <span style={s.featuredDot} />}
        </div>
        <div style={s.gigListBody}>
          <div style={s.gigListTop}>
            <div style={s.sellerRow}>
              <div style={{ ...s.sellerAvatar, background: gig.avatarColor }}>{gig.initials}</div>
              <span style={s.sellerName}>{gig.seller}</span>
              <Icon.Verified />
            </div>
            <p style={s.gigListTitle}>{gig.title}</p>
            <div style={s.gigTagsRow}>
              {gig.tags.map(tag => <span key={tag} style={s.tag}>{tag}</span>)}
            </div>
          </div>
          <div style={s.gigListMeta}>
            <div style={s.ratingRow}>
              <Icon.Star />
              <span style={s.ratingNum}>{gig.rating.toFixed(1)}</span>
              <span style={s.ratingCount}>({gig.reviews})</span>
            </div>
            <div style={s.deliveryRow}>
              <Icon.Clock />
              <span>{gig.deliveryDays}d delivery</span>
            </div>
          </div>
        </div>
        <div style={s.gigListPrice}>
          <span style={s.priceFrom}>Starting at</span>
          <span style={s.priceVal}>{gig.price.toLocaleString()} RWF</span>
          <button style={s.bookBtnSm} onClick={e => e.preventDefault()}>Book</button>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/gigs/${gig.id}`} style={s.gigCard}>
      {/* Thumbnail */}
      <div style={s.gigThumb}>
        <span style={s.gigThumbLabel}>{gig.category}</span>
        {gig.featured && (
          <span style={s.featuredBadge}>Featured</span>
        )}
      </div>

      {/* Seller */}
      <div style={s.gigBody}>
        <div style={s.sellerRow}>
          <div style={{ ...s.sellerAvatar, background: gig.avatarColor }}>{gig.initials}</div>
          <span style={s.sellerName}>{gig.seller}</span>
          <Icon.Verified />
        </div>

        <p style={s.gigTitle}>{gig.title}</p>

        <div style={s.gigTagsRow}>
          {gig.tags.slice(0, 2).map(tag => <span key={tag} style={s.tag}>{tag}</span>)}
        </div>
      </div>

      {/* Footer */}
      <div style={s.gigFooter}>
        <div style={s.gigFooterLeft}>
          <div style={s.ratingRow}>
            <Icon.Star />
            <span style={s.ratingNum}>{gig.rating.toFixed(1)}</span>
            <span style={s.ratingCount}>({gig.reviews})</span>
          </div>
          <div style={s.deliveryRow}>
            <Icon.Clock />
            <span>{gig.deliveryDays}d delivery</span>
          </div>
        </div>
        <div>
          <span style={s.priceFrom}>From</span>
          <span style={s.priceVal}>{gig.price.toLocaleString()} RWF</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Most Popular');
  const [sortOpen, setSortOpen] = useState(false);
  const [delivery, setDelivery] = useState('Any');
  const [maxPrice, setMaxPrice] = useState(100000);
  const [minRating, setMinRating] = useState(0);
  const [listView, setListView] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Active filters for the chip row
  const activeFilters: { label: string; clear: () => void }[] = [];
  if (activeCategory !== 'All') activeFilters.push({ label: activeCategory, clear: () => setActiveCategory('All') });
  if (delivery !== 'Any') activeFilters.push({ label: delivery, clear: () => setDelivery('Any') });
  if (maxPrice < 100000) activeFilters.push({ label: `Max ${maxPrice.toLocaleString()} RWF`, clear: () => setMaxPrice(100000) });
  if (minRating > 0) activeFilters.push({ label: `${minRating}+ stars`, clear: () => setMinRating(0) });

  const filtered = useMemo(() => {
    let list = [...ALL_GIGS];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.seller.toLowerCase().includes(q) ||
        g.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (activeCategory !== 'All') list = list.filter(g => g.category === activeCategory);

    if (delivery === 'Express (1 day)') list = list.filter(g => g.deliveryDays <= 1);
    else if (delivery === 'Up to 3 days') list = list.filter(g => g.deliveryDays <= 3);
    else if (delivery === 'Up to 7 days') list = list.filter(g => g.deliveryDays <= 7);

    list = list.filter(g => g.price <= maxPrice);
    list = list.filter(g => g.rating >= minRating);

    switch (sortBy) {
      case 'Price: Low to High': list.sort((a, b) => a.price - b.price); break;
      case 'Price: High to Low': list.sort((a, b) => b.price - a.price); break;
      case 'Top Rated': list.sort((a, b) => b.rating - a.rating); break;
      case 'Newest': list.sort((a, b) => b.id - a.id); break;
      default: list.sort((a, b) => b.reviews - a.reviews);
    }

    return list;
  }, [search, activeCategory, sortBy, delivery, maxPrice, minRating]);

  return (
    <div style={s.root}>

      {/* ── NAV ───────────────────────────────────────────────── */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <Link href="/" style={s.logo}>
            <div style={s.logoMark}><Icon.Logo /></div>
            <span style={s.logoText}>UniHustle</span>
          </Link>

          {/* Global search in nav */}
          <div style={s.navSearch}>
            <span style={s.navSearchIcon}><Icon.Search /></span>
            <input
              style={s.navSearchInput}
              type="text"
              placeholder="Search for any service or skill..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={s.navRight}>
            <Link href="/dashboard" style={s.navLink}>Dashboard</Link>
            <Link href="/auth" style={s.navLinkPrimary}>Sign Up Free</Link>
            <div style={{ position: 'relative' }}>
              <button style={s.avatar} onClick={() => setProfileOpen(v => !v)}>DA</button>
              {profileOpen && (
                <div style={s.profileMenu}>
                  <div style={s.profileHead}>
                    <div style={{ ...s.profileAvatar, background: '#10B981' }}>DA</div>
                    <div>
                      <div style={s.profileName}>David Achibiri</div>
                      <div style={s.profileSub}>Student · Seller</div>
                    </div>
                  </div>
                  <div style={s.menuDivider} />
                  {['My Dashboard', 'My Orders', 'Settings'].map(item => (
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

      {/* ── CATEGORY TABS ─────────────────────────────────────── */}
      <div style={s.catBar}>
        <div style={s.catBarInner}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              style={{
                ...s.catTab,
                ...(activeCategory === cat ? s.catTabActive : {}),
              }}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── BODY ──────────────────────────────────────────────── */}
      <div style={s.body}>
        <div style={s.bodyInner}>

          {/* ── SIDEBAR ─────────────────────────────────────── */}
          <aside style={s.sidebar}>
            <div style={s.sidebarBlock}>
              <p style={s.sidebarLabel}>Delivery Time</p>
              <div style={s.radioGroup}>
                {DELIVERY_OPTIONS.map(opt => (
                  <label key={opt} style={s.radioRow}>
                    <input
                      type="radio"
                      name="delivery"
                      checked={delivery === opt}
                      onChange={() => setDelivery(opt)}
                      style={{ accentColor: '#F97316' }}
                    />
                    <span style={s.radioText}>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={s.sidebarDivider} />

            <div style={s.sidebarBlock}>
              <p style={s.sidebarLabel}>Max Price</p>
              <div style={s.rangeWrap}>
                <input
                  type="range"
                  min={5000}
                  max={100000}
                  step={5000}
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  style={s.rangeInput}
                />
                <div style={s.rangeValues}>
                  <span style={s.rangeMin}>5,000 RWF</span>
                  <span style={s.rangeMax}>{maxPrice.toLocaleString()} RWF</span>
                </div>
              </div>
            </div>

            <div style={s.sidebarDivider} />

            <div style={s.sidebarBlock}>
              <p style={s.sidebarLabel}>Minimum Rating</p>
              <div style={s.radioGroup}>
                {[0, 4, 4.5, 4.8].map(r => (
                  <label key={r} style={s.radioRow}>
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === r}
                      onChange={() => setMinRating(r)}
                      style={{ accentColor: '#F97316' }}
                    />
                    <span style={s.radioText}>
                      {r === 0 ? 'Any rating' : `${r}+ stars`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div style={s.sidebarDivider} />

            <button
              style={s.clearFiltersBtn}
              onClick={() => {
                setActiveCategory('All');
                setDelivery('Any');
                setMaxPrice(100000);
                setMinRating(0);
                setSearch('');
              }}
            >
              Clear all filters
            </button>
          </aside>

          {/* ── RESULTS ─────────────────────────────────────── */}
          <div style={s.results}>

            {/* Results toolbar */}
            <div style={s.toolbar}>
              <div style={s.toolbarLeft}>
                <span style={s.resultsCount}>
                  <strong>{filtered.length}</strong> gig{filtered.length !== 1 ? 's' : ''} found
                  {activeCategory !== 'All' && <span style={{ color: '#A8A29E' }}> in {activeCategory}</span>}
                </span>

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
              </div>

              <div style={s.toolbarRight}>
                {/* Sort */}
                <div style={{ position: 'relative' }}>
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
                          style={{
                            ...s.sortItem,
                            ...(sortBy === opt ? { color: '#F97316', fontWeight: 700 } : {}),
                          }}
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
                  <button
                    style={{ ...s.viewBtn, ...(listView ? {} : s.viewBtnActive) }}
                    onClick={() => setListView(false)}
                    aria-label="Grid view"
                  >
                    <Icon.Grid />
                  </button>
                  <button
                    style={{ ...s.viewBtn, ...(listView ? s.viewBtnActive : {}) }}
                    onClick={() => setListView(true)}
                    aria-label="List view"
                  >
                    <Icon.List />
                  </button>
                </div>
              </div>
            </div>

            {/* Gig grid / list */}
            {filtered.length === 0 ? (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>
                  <Icon.Search />
                </div>
                <p style={s.emptyTitle}>No gigs found</p>
                <p style={s.emptySub}>Try adjusting your filters or search query.</p>
                <button
                  style={s.emptyBtn}
                  onClick={() => {
                    setSearch('');
                    setActiveCategory('All');
                    setDelivery('Any');
                    setMaxPrice(100000);
                    setMinRating(0);
                  }}
                >
                  Clear all filters
                </button>
              </div>
            ) : listView ? (
              <div style={s.listWrap}>
                {filtered.map(gig => <GigCard key={gig.id} gig={gig} listView />)}
              </div>
            ) : (
              <div style={s.grid}>
                {filtered.map(gig => <GigCard key={gig.id} gig={gig} listView={false} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #F5F5F4; }
        a { text-decoration: none; color: inherit; }
        button { font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; }
        input[type=range] { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; background: #E7E5E4; border-radius: 99px; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #F97316; cursor: pointer; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
        @media (max-width: 1024px) { .sidebar { display: none !important; } }
        @media (max-width: 768px) {
          .nav-search { display: none !important; }
          .grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .grid { grid-template-columns: 1fr !important; }
          .nav-link-primary { display: none !important; }
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
    position: 'sticky', top: 0, zIndex: 100,
    background: 'white', borderBottom: '1px solid #E7E5E4',
  },
  navInner: {
    maxWidth: 1280, margin: '0 auto', padding: '0 28px',
    height: 60, display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: 16,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 },
  logoMark: { width: 28, height: 28, background: '#F97316', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontWeight: 800, fontSize: '0.95rem', color: '#0C0A09', letterSpacing: '-0.02em' },
  navSearch: {
    flex: 1, maxWidth: 480, position: 'relative',
  },
  navSearchIcon: {
    position: 'absolute', left: 13, top: '50%',
    transform: 'translateY(-50%)', color: '#A8A29E',
    display: 'flex', alignItems: 'center', pointerEvents: 'none',
  },
  navSearchInput: {
    width: '100%', padding: '8px 14px 8px 38px',
    border: '1px solid #E7E5E4', borderRadius: 9,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '0.85rem', color: '#0C0A09', background: '#FAFAFA',
    outline: 'none',
  },
  navRight: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
  navLink: { padding: '6px 12px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, color: '#44403C', textDecoration: 'none' },
  navLinkPrimary: {
    padding: '7px 16px', borderRadius: 8,
    fontSize: '0.82rem', fontWeight: 700, color: 'white',
    background: '#F97316', textDecoration: 'none',
  },
  avatar: {
    width: 32, height: 32, borderRadius: 999,
    background: '#0C0A09', color: 'white',
    border: 'none', fontSize: '0.62rem', fontWeight: 800,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', marginLeft: 4, letterSpacing: '0.02em',
  },

  // Profile menu
  profileMenu: {
    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
    background: 'white', borderRadius: 12,
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
    border: '1px solid #E7E5E4', minWidth: 200,
    padding: '6px 0', zIndex: 200,
  },
  profileHead: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' },
  profileAvatar: {
    width: 32, height: 32, borderRadius: 999, color: 'white',
    fontSize: '0.62rem', fontWeight: 800,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  profileName: { fontWeight: 700, fontSize: '0.85rem', color: '#0C0A09' },
  profileSub: { fontSize: '0.72rem', color: '#A8A29E', marginTop: 1 },
  menuDivider: { height: 1, background: '#F5F5F4', margin: '4px 0' },
  menuItem: {
    display: 'block', width: '100%', padding: '8px 14px',
    background: 'none', border: 'none',
    fontSize: '0.82rem', fontWeight: 500, color: '#1C1917',
    textAlign: 'left' as const, cursor: 'pointer',
  },

  // CATEGORY BAR
  catBar: { background: 'white', borderBottom: '1px solid #E7E5E4' },
  catBarInner: {
    maxWidth: 1280, margin: '0 auto', padding: '0 28px',
    display: 'flex', gap: 0, overflowX: 'auto' as const,
  },
  catTab: {
    padding: '13px 18px', background: 'none', border: 'none',
    fontSize: '0.83rem', fontWeight: 600, color: '#78716C',
    cursor: 'pointer', whiteSpace: 'nowrap' as const,
    borderBottom: '2px solid transparent', transition: 'color 0.15s, border-color 0.15s',
  },
  catTabActive: { color: '#0C0A09', borderBottom: '2px solid #F97316' },

  // BODY LAYOUT
  body: { maxWidth: 1280, margin: '0 auto', padding: '28px 28px 80px' },
  bodyInner: { display: 'flex', gap: 28, alignItems: 'flex-start' },

  // SIDEBAR
  sidebar: {
    width: 220, flexShrink: 0,
    background: 'white', border: '1px solid #E7E5E4',
    borderRadius: 12, padding: '20px',
    position: 'sticky', top: 120,
  },
  sidebarBlock: { paddingBottom: 4 },
  sidebarLabel: {
    fontSize: '0.72rem', fontWeight: 700, color: '#A8A29E',
    textTransform: 'uppercase' as const, letterSpacing: '0.07em',
    marginBottom: 12,
  },
  radioGroup: { display: 'flex', flexDirection: 'column' as const, gap: 9 },
  radioRow: { display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' },
  radioText: { fontSize: '0.82rem', fontWeight: 500, color: '#44403C' },
  sidebarDivider: { height: 1, background: '#F5F5F4', margin: '16px 0' },
  rangeWrap: {},
  rangeInput: { width: '100%', marginBottom: 10 },
  rangeValues: { display: 'flex', justifyContent: 'space-between' },
  rangeMin: { fontSize: '0.72rem', color: '#A8A29E' },
  rangeMax: { fontSize: '0.72rem', color: '#0C0A09', fontWeight: 700 },
  clearFiltersBtn: {
    width: '100%', padding: '8px', borderRadius: 8,
    background: 'none', border: '1px solid #E7E5E4',
    fontSize: '0.78rem', fontWeight: 600, color: '#78716C',
    cursor: 'pointer', marginTop: 4,
  },

  // RESULTS
  results: { flex: 1, minWidth: 0 },
  toolbar: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const, gap: 12, marginBottom: 18,
  },
  toolbarLeft: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const },
  toolbarRight: { display: 'flex', alignItems: 'center', gap: 8 },
  resultsCount: { fontSize: '0.85rem', color: '#44403C' },
  filterChips: { display: 'flex', gap: 6, flexWrap: 'wrap' as const },
  filterChip: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    background: '#FFF7ED', border: '1px solid #FED7AA',
    borderRadius: 999, padding: '3px 10px',
    fontSize: '0.72rem', fontWeight: 600, color: '#EA580C',
  },
  chipX: {
    background: 'none', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', color: '#EA580C', padding: 0,
  },
  sortBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 13px', borderRadius: 8,
    border: '1px solid #E7E5E4', background: 'white',
    fontSize: '0.8rem', fontWeight: 600, color: '#44403C', cursor: 'pointer',
  },
  sortMenu: {
    position: 'absolute', top: 'calc(100% + 6px)', right: 0,
    background: 'white', border: '1px solid #E7E5E4',
    borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.09)',
    minWidth: 190, padding: '5px 0', zIndex: 50,
  },
  sortItem: {
    display: 'block', width: '100%', padding: '8px 14px',
    background: 'none', border: 'none',
    fontSize: '0.82rem', fontWeight: 500, color: '#1C1917',
    textAlign: 'left' as const, cursor: 'pointer',
  },
  viewToggle: {
    display: 'flex', background: '#F5F5F4',
    borderRadius: 8, padding: 3, gap: 2,
  },
  viewBtn: {
    width: 30, height: 30, borderRadius: 6, border: 'none',
    background: 'transparent', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    color: '#A8A29E', cursor: 'pointer',
  },
  viewBtnActive: { background: 'white', color: '#0C0A09', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },

  // GRID
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
  },

  // GIG CARD (grid)
  gigCard: {
    background: 'white', border: '1px solid #E7E5E4',
    borderRadius: 12, overflow: 'hidden',
    display: 'flex', flexDirection: 'column' as const,
    textDecoration: 'none', color: 'inherit',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  gigThumb: {
    height: 140, background: '#F5F5F4',
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderBottom: '1px solid #E7E5E4',
    position: 'relative',
  },
  gigThumbLabel: {
    fontSize: '0.63rem', fontWeight: 700,
    textTransform: 'uppercase' as const, letterSpacing: '0.07em',
    color: '#78716C', background: 'white',
    border: '1px solid #E7E5E4', borderRadius: 999, padding: '3px 9px',
  },
  featuredBadge: {
    fontSize: '0.63rem', fontWeight: 700,
    background: '#FFF7ED', color: '#EA580C',
    border: '1px solid #FED7AA', borderRadius: 999,
    padding: '3px 9px', letterSpacing: '0.04em',
  },
  featuredDot: {
    width: 7, height: 7, borderRadius: 999,
    background: '#F97316', marginTop: 4, flexShrink: 0,
  },
  gigBody: { padding: '13px 14px 10px' },
  sellerRow: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 },
  sellerAvatar: {
    width: 22, height: 22, borderRadius: 999, color: 'white',
    fontSize: '0.55rem', fontWeight: 800,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  sellerName: { fontSize: '0.75rem', fontWeight: 600, color: '#44403C' },
  gigTitle: {
    fontSize: '0.84rem', fontWeight: 600, color: '#0C0A09',
    lineHeight: 1.45, marginBottom: 10,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },
  gigTagsRow: { display: 'flex', gap: 5, flexWrap: 'wrap' as const },
  tag: {
    fontSize: '0.65rem', fontWeight: 600, color: '#78716C',
    background: '#F5F5F4', border: '1px solid #E7E5E4',
    borderRadius: 999, padding: '2px 8px',
  },
  gigFooter: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 14px 14px',
    borderTop: '1px solid #F5F5F4', marginTop: 'auto',
  },
  gigFooterLeft: { display: 'flex', flexDirection: 'column' as const, gap: 4 },
  ratingRow: { display: 'flex', alignItems: 'center', gap: 4 },
  ratingNum: { fontSize: '0.78rem', fontWeight: 700, color: '#0C0A09' },
  ratingCount: { fontSize: '0.72rem', color: '#A8A29E' },
  deliveryRow: {
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: '0.72rem', color: '#78716C',
  },
  priceFrom: { fontSize: '0.68rem', color: '#A8A29E', display: 'block', marginBottom: 1 },
  priceVal: { fontSize: '0.88rem', fontWeight: 800, color: '#0C0A09', display: 'block' },

  // LIST VIEW
  listWrap: { display: 'flex', flexDirection: 'column' as const, gap: 10 },
  gigCardList: {
    background: 'white', border: '1px solid #E7E5E4',
    borderRadius: 12, overflow: 'hidden',
    display: 'flex', textDecoration: 'none', color: 'inherit',
  },
  gigListThumb: {
    width: 120, flexShrink: 0, background: '#F5F5F4',
    display: 'flex', flexDirection: 'column' as const,
    alignItems: 'flex-start', justifyContent: 'space-between',
    padding: '10px 10px',
    borderRight: '1px solid #E7E5E4',
  },
  gigListBody: {
    flex: 1, padding: '14px 16px',
    display: 'flex', justifyContent: 'space-between',
    gap: 16, minWidth: 0,
  },
  gigListTop: { flex: 1, minWidth: 0 },
  gigListTitle: {
    fontSize: '0.88rem', fontWeight: 600, color: '#0C0A09',
    lineHeight: 1.45, marginBottom: 8,
  },
  gigListMeta: { display: 'flex', alignItems: 'center', gap: 16 },
  gigListPrice: {
    display: 'flex', flexDirection: 'column' as const,
    alignItems: 'flex-end', justifyContent: 'center',
    padding: '14px 16px', flexShrink: 0, gap: 8,
    borderLeft: '1px solid #F5F5F4',
  },
  bookBtnSm: {
    background: '#F97316', color: 'white', border: 'none',
    borderRadius: 7, padding: '7px 16px',
    fontSize: '0.78rem', fontWeight: 700,
  },

  // EMPTY STATE
  emptyState: {
    background: 'white', border: '1px solid #E7E5E4',
    borderRadius: 14, padding: '60px 24px',
    textAlign: 'center' as const,
  },
  emptyIcon: {
    width: 44, height: 44, borderRadius: 12,
    background: '#F5F5F4', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 14px', color: '#A8A29E',
  },
  emptyTitle: { fontWeight: 700, fontSize: '0.95rem', color: '#0C0A09', marginBottom: 6 },
  emptySub: { fontSize: '0.82rem', color: '#78716C', marginBottom: 20 },
  emptyBtn: {
    background: '#F97316', color: 'white', border: 'none',
    borderRadius: 8, padding: '9px 20px',
    fontSize: '0.82rem', fontWeight: 700,
  },
};