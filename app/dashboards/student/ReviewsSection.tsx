/**
 * ReviewsSection — displays all reviews left by businesses
 * after completed orders.
 *
 * This is a Server Component — it receives pre-fetched review
 * data as props from page.tsx so no additional DB calls are needed here.
 *
 * Reviews cannot be written or edited by the student — they are
 * created automatically when a business submits a review after
 * marking an order as satisfactory. This is intentional and
 * clearly communicated in the empty state copy.
 */

interface Review {
  review_id:   number;
  comment:     string;
  rating:      number;
  reviewer_id: number;
  gig_id:      number;
  // These come from the joined relations in the Prisma query
  reviewer: {
    full_name: string;
    email:     string;
    school:    string;
  };
  gig: {
    title: string;
  };
  created_at: Date;
}

interface Props {
  reviews:    Review[];
  avgRating?: number;
}

/**
 * Renders a row of filled/empty star icons based on a numeric rating.
 * Rating is out of 5.
 */
function StarRow({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        i <= rating ? (
          <svg key={i} viewBox="0 0 24 24" fill="#F97316" width={13} height={13}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ) : (
          <svg key={i} viewBox="0 0 24 24" fill="none" stroke="#D6D3D1" strokeWidth={2} width={13} height={13}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        )
      ))}
    </div>
  );
}

/**
 * Formats a Date into a readable string like "12 Jan 2026".
 */
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });
}

/**
 * Derives initials from a full name or email.
 * "StartupHub Rwanda" → "SR", "info@company.com" → "IN"
 */
function getInitials(name: string, email: string): string {
  if (name) {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default function ReviewsSection({ reviews, avgRating }: Props) {
  return (
    <div>
      {/* Section header */}
      <div style={s.sectionHead}>
        <div>
          <h2 style={s.sectionTitle}>Reviews from Companies</h2>
          <p style={s.sectionDesc}>
            Automatically populated after each completed job
          </p>
        </div>

        {/* Average rating summary — only shown when there are reviews */}
        {reviews.length > 0 && avgRating !== undefined && (
          <div style={s.ratingSummary}>
            <StarRow rating={Math.round(avgRating)} />
            <span style={s.avgNum}>{avgRating.toFixed(1)}</span>
            <span style={s.reviewCount}>
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Empty state */}
      {reviews.length === 0 ? (
        <div style={s.emptyCanvas}>
          <div style={s.emptyIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#D6D3D1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={32} height={32}>
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <p style={s.emptyTitle}>No reviews yet</p>
          <p style={s.emptySub}>
            Complete your first order and the company will be prompted
            to leave a review here automatically.
          </p>
        </div>
      ) : (
        // Reviews grid — 2 columns on desktop, 1 on mobile
        <div style={s.reviewsGrid} className="reviews-grid">
          {reviews.map(review => {
            const reviewerName = review.reviewer.full_name || review.reviewer.email;
            const initials     = getInitials(review.reviewer.full_name, review.reviewer.email);

            return (
              <div key={review.review_id} style={s.reviewCard}>

                {/* Card header — company avatar, name, date */}
                <div style={s.reviewTop}>
                  <div style={s.reviewAvatar}>{initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={s.reviewerName}>{reviewerName}</p>
                    <p style={s.reviewerSub}>
                      {review.reviewer.school} · for &ldquo;{review.gig.title}&rdquo;
                    </p>
                  </div>
                  <span style={s.reviewDate}>{formatDate(review.created_at)}</span>
                </div>

                {/* Star rating */}
                <StarRow rating={review.rating} />

                {/* Review comment */}
                <p style={s.reviewComment}>{review.comment}</p>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  sectionHead: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14, gap: 12,
  },
  sectionTitle: {
    fontSize: "0.95rem", fontWeight: 700,
    color: "#0C0A09", letterSpacing: "-0.01em",
  },
  sectionDesc: { fontSize: "0.78rem", color: "#A8A29E", marginTop: 2 },

  // Average rating badge shown in the section header
  ratingSummary: {
    display: "flex", alignItems: "center",
    gap: 8, flexShrink: 0,
  },
  avgNum: { fontSize: "0.9rem", fontWeight: 800, color: "#0C0A09" },
  reviewCount: { fontSize: "0.78rem", color: "#A8A29E" },

  // Empty state
  emptyCanvas: {
    background: "white", border: "1px dashed #E7E5E4",
    borderRadius: 12, padding: "48px 24px",
    display: "flex", flexDirection: "column" as const,
    alignItems: "center", gap: 8, textAlign: "center" as const,
  },
  emptyIcon: {
    width: 52, height: 52, borderRadius: 12,
    background: "#F5F5F4", display: "flex",
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  emptyTitle: { fontSize: "0.92rem", fontWeight: 700, color: "#0C0A09" },
  emptySub: {
    fontSize: "0.8rem", color: "#A8A29E",
    lineHeight: 1.6, maxWidth: 380,
  },

  // Review cards grid
  reviewsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 14,
  },
  reviewCard: {
    background: "white", border: "1px solid #E7E5E4",
    borderRadius: 12, padding: "18px",
    display: "flex", flexDirection: "column" as const, gap: 10,
  },
  reviewTop: {
    display: "flex", alignItems: "flex-start",
    gap: 10,
  },
  reviewAvatar: {
    width: 34, height: 34, borderRadius: 999,
    background: "#F5F5F4", border: "1px solid #E7E5E4",
    fontSize: "0.62rem", fontWeight: 800, color: "#44403C",
    display: "flex", alignItems: "center",
    justifyContent: "center", flexShrink: 0,
  },
  reviewerName: { fontSize: "0.82rem", fontWeight: 700, color: "#0C0A09" },
  reviewerSub:  {
    fontSize: "0.72rem", color: "#A8A29E", marginTop: 2,
    whiteSpace: "nowrap" as const, overflow: "hidden",
    textOverflow: "ellipsis",
  },
  reviewDate:  { fontSize: "0.72rem", color: "#A8A29E", flexShrink: 0, marginTop: 2 },
  reviewComment: {
    fontSize: "0.83rem", color: "#44403C",
    lineHeight: 1.6,
  },
};