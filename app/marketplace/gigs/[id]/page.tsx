import { prisma }      from "@/lib/db";
import { getSession }  from "@/lib/session";
import { notFound }    from "next/navigation";
import Link            from "next/link";
import BookingButton   from "./BookingButton";

/**
 * Gig Detail Page — /marketplace/gigs/[id]
 *
 * Server Component. Fetches the full gig record including the seller's
 * profile and all reviews. Passes data down to the BookingButton
 * Client Component which handles the actual order creation.
 */
export default async function GigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }  = await params;
  const gigId   = parseInt(id);

  if (isNaN(gigId)) notFound();

  // Fetch the gig with seller profile and reviews
  const gig = await prisma.gig.findUnique({
    where:   { gig_id: gigId },
    include: {
      student: {
        include: {
          portfolio_items: { take: 3, orderBy: { portfolio_id: "desc" } },
        },
      },
      reviews: {
        include: { reviewer: true },
        orderBy: { review_id: "desc" },
      },
      orders: {
        where: { status: { in: ["completed"] } },
      },
    },
  });

  if (!gig) notFound();

  // Check if current user is logged in so we can show the right CTA
  const session     = await getSession();
  const isLoggedIn  = !!session;
  const isBusiness  = session?.role === "business";
  const isOwnGig    = session?.email === gig.student.email;

  // Compute stats for the sidebar
  const completedOrders = gig.orders.length;
  const avgRating = gig.reviews.length > 0
    ? gig.reviews.reduce((sum, r) => sum + r.rating, 0) / gig.reviews.length
    : null;

  const initials = getInitials(gig.student.full_name, gig.student.email);

  return (
    <div style={s.root}>

      {/* ── NAV ──────────────────────────────────────────────── */}
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
          <div style={s.navRight}>
            <Link href="/marketplace" style={s.navLink}>
              ← Back to Marketplace
            </Link>
            {!isLoggedIn && (
              <Link href="/login" style={s.navBtn}>Log In</Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── MAIN LAYOUT ──────────────────────────────────────── */}
      <div style={s.body}>
        <div style={s.container}>
          <div style={s.layout}>

            {/* ── LEFT: Gig content ─────────────────────────── */}
            <div style={s.left}>

              {/* Category + title */}
              <div style={s.gigHeader}>
                <span style={s.categoryPill}>{gig.category}</span>
                <h1 style={s.gigTitle}>{gig.title}</h1>

                {/* Seller row */}
                <div style={s.sellerRow}>
                  <div style={s.sellerAvatar}>{initials}</div>
                  <div>
                    <span style={s.sellerName}>{gig.student.full_name}</span>
                    <span style={s.sellerUni}>
                      {(gig.student as any).school ?? "ALU Rwanda"}
                      {(gig.student as any).cohort
                        ? ` · ${(gig.student as any).cohort}`
                        : ""}
                    </span>
                  </div>
                  {gig.student.is_verified && (
                    <div style={s.verifiedBadge}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={11} height={11}>
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Verified
                    </div>
                  )}
                </div>
              </div>

              {/* Gig image placeholder */}
              <div style={s.gigThumb}>
                <span style={s.gigThumbCat}>{gig.category}</span>
              </div>

              {/* Description */}
              <div style={s.card}>
                <h2 style={s.cardTitle}>About this gig</h2>
                <p style={s.description}>
                  {(gig as any).description
                    ? (gig as any).description
                    : "No description provided yet."}
                </p>

                {/* Tags */}
                {(gig as any).tags?.length > 0 && (
                  <div style={s.tags}>
                    {(gig as any).tags.map((tag: string) => (
                      <span key={tag} style={s.tag}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Seller profile card */}
              <div style={s.card}>
                <h2 style={s.cardTitle}>About the seller</h2>
                <div style={s.profileRow}>
                  <div style={s.profileAvatar}>{initials}</div>
                  <div>
                    <p style={s.profileName}>{gig.student.full_name}</p>
                    <p style={s.profileSub}>
                      {(gig.student as any).major ?? "ALU Student"}
                      {(gig.student as any).year_of_study
                        ? ` · ${(gig.student as any).year_of_study}`
                        : ""}
                    </p>
                  </div>
                </div>

                {(gig.student as any).bio && (
                  <p style={s.profileBio}>{(gig.student as any).bio}</p>
                )}

                {gig.student.skills?.length > 0 && (
                  <div style={s.tags}>
                    {gig.student.skills.map((skill: string) => (
                      <span key={skill} style={s.tag}>{skill}</span>
                    ))}
                  </div>
                )}

                <div style={s.profileStats}>
                  <div style={s.profileStat}>
                    <span style={s.profileStatValue}>{completedOrders}</span>
                    <span style={s.profileStatLabel}>Jobs done</span>
                  </div>
                  <div style={s.profileStat}>
                    <span style={s.profileStatValue}>{gig.student.hustle_score}</span>
                    <span style={s.profileStatLabel}>Hustle score</span>
                  </div>
                  {avgRating !== null && (
                    <div style={s.profileStat}>
                      <span style={s.profileStatValue}>{avgRating.toFixed(1)}</span>
                      <span style={s.profileStatLabel}>Avg rating</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews */}
              <div style={s.card}>
                <h2 style={s.cardTitle}>
                  Reviews
                  {gig.reviews.length > 0 && (
                    <span style={s.reviewCount}>
                      {gig.reviews.length} review{gig.reviews.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </h2>

                {gig.reviews.length === 0 ? (
                  <p style={s.noReviews}>No reviews yet — be the first to work with this student.</p>
                ) : (
                  <div style={s.reviewsList}>
                    {gig.reviews.map(review => (
                      <div key={review.review_id} style={s.reviewItem}>
                        <div style={s.reviewTop}>
                          <div style={s.reviewAvatar}>
                            {getInitials(review.reviewer.full_name, review.reviewer.email)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={s.reviewerName}>{review.reviewer.full_name}</p>
                            <div style={{ display: "flex", gap: 2, marginTop: 3 }}>
                              {[1,2,3,4,5].map(i => (
                                i <= review.rating ? (
                                  <svg key={i} viewBox="0 0 24 24" fill="#F97316" width={12} height={12}>
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                  </svg>
                                ) : (
                                  <svg key={i} viewBox="0 0 24 24" fill="none" stroke="#D6D3D1" strokeWidth={2} width={12} height={12}>
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                  </svg>
                                )
                              ))}
                            </div>
                          </div>
                          <span style={s.reviewDate}>
                            {new Date((review as any).created_at ?? Date.now()).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <p style={s.reviewComment}>{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* ── RIGHT: Booking sidebar ─────────────────────── */}
            <aside style={s.sidebar}>
              <div style={s.bookingCard}>

                {/* Price */}
                <div style={s.priceRow}>
                  <span style={s.priceFrom}>Starting at</span>
                  <span style={s.price}>{gig.price.toLocaleString()} RWF</span>
                </div>

                {/* Gig details */}
                <div style={s.gigDetails}>
                  <div style={s.gigDetail}>
                    <ClockIcon />
                    <span>{(gig as any).delivery_days ?? 3} day delivery</span>
                  </div>
                  <div style={s.gigDetail}>
                    <RefreshIcon />
                    <span>{(gig as any).revisions ?? 2} revision{((gig as any).revisions ?? 2) !== 1 ? "s" : ""} included</span>
                  </div>
                  <div style={s.gigDetail}>
                    <CheckIcon />
                    <span>Verified ALU student</span>
                  </div>
                </div>

                {/* CTA — changes based on login state and role */}
                {isOwnGig ? (
                  <div style={s.ownGigNote}>
                    This is your gig
                  </div>
                ) : isBusiness ? (
                  <BookingButton
                    gigId={gig.gig_id}
                    gigTitle={gig.title}
                    price={gig.price}
                    deliveryDays={(gig as any).delivery_days ?? 3}
                    buyerEmail={session!.email}
                  />
                ) : (
                  <Link href="/login" style={s.loginToBook}>
                    Log in to Book this Gig
                  </Link>
                )}

                <p style={s.bookingNote}>
                  You will not be charged until the student delivers and you approve the work.
                </p>
              </div>

              {/* Student&apos;s other gigs */}
              <div style={s.otherGigsCard}>
                <p style={s.otherGigsTitle}>
                  More from {gig.student.full_name.split(" ")[0]}
                </p>
                <Link
                  href={`/marketplace?seller=${encodeURIComponent(gig.student.email)}`}
                  style={s.otherGigsLink}
                >
                  View all gigs →
                </Link>
              </div>

            </aside>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #F5F5F4; }
        a { text-decoration: none; color: inherit; }
        @media (max-width: 960px) {
          .layout { grid-template-columns: 1fr !important; }
          .sidebar { position: static !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string, email: string): string {
  if (name) {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

// ─── Small icons ──────────────────────────────────────────────────────────────

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
    <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  root: { minHeight: "100vh", background: "#F5F5F4", fontFamily: "'Plus Jakarta Sans', sans-serif", WebkitFontSmoothing: "antialiased", color: "#0C0A09" },
  nav: { position: "sticky", top: 0, zIndex: 100, background: "white", borderBottom: "1px solid #E7E5E4" },
  navInner: { maxWidth: 1160, margin: "0 auto", padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { display: "flex", alignItems: "center", gap: 8, textDecoration: "none" },
  logoMark: { width: 28, height: 28, background: "#F97316", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" },
  logoText: { fontWeight: 800, fontSize: "0.95rem", color: "#0C0A09", letterSpacing: "-0.02em" },
  navRight: { display: "flex", alignItems: "center", gap: 10 },
  navLink: { fontSize: "0.82rem", fontWeight: 600, color: "#44403C", textDecoration: "none" },
  navBtn: { padding: "7px 16px", borderRadius: 8, background: "#F97316", color: "white", fontSize: "0.82rem", fontWeight: 700, textDecoration: "none" },

  body: { padding: "36px 0 80px" },
  container: { maxWidth: 1160, margin: "0 auto", padding: "0 28px" },
  layout: { display: "grid", gridTemplateColumns: "1fr 320px", gap: 28, alignItems: "flex-start" },

  // Left column
  left: { display: "flex", flexDirection: "column" as const, gap: 20 },

  gigHeader: { display: "flex", flexDirection: "column" as const, gap: 12 },
  categoryPill: { display: "inline-block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.07em", color: "#78716C", background: "#F5F5F4", border: "1px solid #E7E5E4", borderRadius: 999, padding: "3px 10px", width: "fit-content" },
  gigTitle: { fontSize: "1.5rem", fontWeight: 800, color: "#0C0A09", letterSpacing: "-0.025em", lineHeight: 1.3 },

  sellerRow: { display: "flex", alignItems: "center", gap: 10 },
  sellerAvatar: { width: 36, height: 36, borderRadius: 999, background: "#0C0A09", color: "white", fontSize: "0.72rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  sellerName: { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#0C0A09" },
  sellerUni: { display: "block", fontSize: "0.75rem", color: "#A8A29E", marginTop: 1 },
  verifiedBadge: { display: "inline-flex", alignItems: "center", gap: 4, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 999, padding: "2px 8px", fontSize: "0.65rem", fontWeight: 700, color: "#16A34A" },

  gigThumb: { height: 320, background: "#F5F5F4", borderRadius: 12, border: "1px solid #E7E5E4", display: "flex", alignItems: "flex-end", padding: "14px 16px" },
  gigThumbCat: { fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.07em", color: "#78716C", background: "white", border: "1px solid #E7E5E4", borderRadius: 999, padding: "3px 10px" },

  card: { background: "white", border: "1px solid #E7E5E4", borderRadius: 12, padding: "24px" },
  cardTitle: { fontSize: "0.92rem", fontWeight: 700, color: "#0C0A09", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 },
  reviewCount: { fontSize: "0.72rem", fontWeight: 500, color: "#A8A29E" },

  description: { fontSize: "0.88rem", color: "#44403C", lineHeight: 1.75 },
  tags: { display: "flex", flexWrap: "wrap" as const, gap: 6, marginTop: 14 },
  tag: { fontSize: "0.72rem", fontWeight: 600, color: "#78716C", background: "#F5F5F4", border: "1px solid #E7E5E4", borderRadius: 6, padding: "3px 10px" },

  profileRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 14 },
  profileAvatar: { width: 48, height: 48, borderRadius: 999, background: "#0C0A09", color: "white", fontSize: "0.85rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  profileName: { fontSize: "0.92rem", fontWeight: 700, color: "#0C0A09" },
  profileSub: { fontSize: "0.75rem", color: "#A8A29E", marginTop: 2 },
  profileBio: { fontSize: "0.83rem", color: "#78716C", lineHeight: 1.6, marginBottom: 14 },
  profileStats: { display: "flex", gap: 24, marginTop: 16, paddingTop: 16, borderTop: "1px solid #F5F5F4" },
  profileStat: { display: "flex", flexDirection: "column" as const, gap: 2 },
  profileStatValue: { fontSize: "1.1rem", fontWeight: 800, color: "#0C0A09" },
  profileStatLabel: { fontSize: "0.72rem", color: "#A8A29E" },

  noReviews: { fontSize: "0.83rem", color: "#A8A29E" },
  reviewsList: { display: "flex", flexDirection: "column" as const, gap: 16 },
  reviewItem: { paddingBottom: 16, borderBottom: "1px solid #F5F5F4" },
  reviewTop: { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  reviewAvatar: { width: 30, height: 30, borderRadius: 999, background: "#F5F5F4", border: "1px solid #E7E5E4", fontSize: "0.6rem", fontWeight: 800, color: "#44403C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  reviewerName: { fontSize: "0.82rem", fontWeight: 700, color: "#0C0A09" },
  reviewDate: { fontSize: "0.72rem", color: "#A8A29E", flexShrink: 0 },
  reviewComment: { fontSize: "0.83rem", color: "#44403C", lineHeight: 1.6 },

  // Sidebar
  sidebar: { position: "sticky" as const, top: 84, display: "flex", flexDirection: "column" as const, gap: 14 },
  bookingCard: { background: "white", border: "1px solid #E7E5E4", borderRadius: 14, padding: "24px", display: "flex", flexDirection: "column" as const, gap: 18 },
  priceRow: { display: "flex", flexDirection: "column" as const, gap: 2 },
  priceFrom: { fontSize: "0.72rem", color: "#A8A29E" },
  price: { fontSize: "1.6rem", fontWeight: 800, color: "#0C0A09", letterSpacing: "-0.03em" },
  gigDetails: { display: "flex", flexDirection: "column" as const, gap: 10, padding: "16px 0", borderTop: "1px solid #F5F5F4", borderBottom: "1px solid #F5F5F4" },
  gigDetail: { display: "flex", alignItems: "center", gap: 10, fontSize: "0.83rem", color: "#44403C" },
  ownGigNote: { textAlign: "center" as const, fontSize: "0.82rem", color: "#A8A29E", padding: "10px", background: "#F5F5F4", borderRadius: 8 },
  loginToBook: { display: "block", textAlign: "center" as const, background: "#F97316", color: "white", borderRadius: 10, padding: "13px", fontSize: "0.9rem", fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(249,115,22,0.25)" },
  bookingNote: { fontSize: "0.72rem", color: "#A8A29E", textAlign: "center" as const, lineHeight: 1.5 },
  otherGigsCard: { background: "white", border: "1px solid #E7E5E4", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  otherGigsTitle: { fontSize: "0.82rem", fontWeight: 600, color: "#0C0A09" },
  otherGigsLink: { fontSize: "0.78rem", fontWeight: 700, color: "#F97316", textDecoration: "none" },
};