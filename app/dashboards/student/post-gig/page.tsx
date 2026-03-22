"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Each FAQ item expands/collapses so the form doesn't feel overwhelming.
 * They address the most common questions a first-time poster has.
 */
interface FaqItem {
  q: string;
  a: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ["Development", "Design", "Writing", "Marketing", "Education", "Data"];

const DELIVERY_OPTIONS = [
  { label: "1 day",  value: 1 },
  { label: "3 days", value: 3 },
  { label: "5 days", value: 5 },
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
];

/**
 * Suggested price ranges per category so students don't underprice themselves.
 * These are based on typical ALU marketplace rates.
 */
const PRICE_HINTS: Record<string, string> = {
  Development: "Typical range: 15,000 – 80,000 RWF",
  Design:      "Typical range: 10,000 – 50,000 RWF",
  Writing:     "Typical range: 5,000 – 20,000 RWF",
  Marketing:   "Typical range: 10,000 – 40,000 RWF",
  Education:   "Typical range: 5,000 – 15,000 RWF",
  Data:        "Typical range: 8,000 – 30,000 RWF",
};

/**
 * Title examples per category — shown as placeholder text to help students
 * write strong, searchable gig titles that follow the "I will..." convention.
 */
const TITLE_PLACEHOLDERS: Record<string, string> = {
  Development: "e.g. I will build a full-stack web app with Next.js and Supabase",
  Design:      "e.g. I will design a complete brand identity and logo for your startup",
  Writing:     "e.g. I will translate 500 words between English, French and Kinyarwanda",
  Marketing:   "e.g. I will create and manage your social media content for one month",
  Education:   "e.g. I will tutor you in mathematics, statistics or data analysis",
  Data:        "e.g. I will clean and analyse your dataset and deliver a visual report",
};

const FAQS: FaqItem[] = [
  {
    q: "What makes a good gig title?",
    a: 'Start with "I will..." and be specific about what you deliver. "I will build a Next.js landing page" beats "Web developer for hire" every time because it tells buyers exactly what they get.',
  },
  {
    q: "How do I set the right price?",
    a: "Use the suggested range as a floor, not a ceiling. Factor in your time, the complexity of the work, and what similar gigs charge. You can always edit the price later.",
  },
  {
    q: "What should I include in the description?",
    a: "Describe exactly what you deliver, what the buyer needs to provide, and what is NOT included. Clear scope prevents disputes. Mention your tools and experience briefly.",
  },
  {
    q: "Can I edit my gig after posting?",
    a: "Yes — you can edit the title, description, price, and delivery time at any point from your dashboard. Changes take effect immediately.",
  },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icon = {
  Logo: () => (
    <svg viewBox="0 0 24 24" fill="white" width={16} height={16}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Back: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ChevronDown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Info: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Bolt: () => (
    <svg viewBox="0 0 24 24" fill="#F97316" width={13} height={13}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Tag: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={15} height={15}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

// ─── Tag input ────────────────────────────────────────────────────────────────

/**
 * Lets students add up to 5 skill tags to their gig.
 * Tags improve discoverability in marketplace search — businesses
 * often search by skill (e.g. "React", "Figma") not just category.
 */
function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      onChange([...tags, trimmed]);
      setInput("");
    }
  };

  const remove = (tag: string) => onChange(tags.filter(t => t !== tag));

  return (
    <div>
      <div style={s.tagPills}>
        {tags.map(tag => (
          <span key={tag} style={s.tagPill}>
            {tag}
            <button
              type="button"
              style={s.tagRemove}
              onClick={() => remove(tag)}
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        {tags.length < 5 && (
          <div style={s.tagInputWrap}>
            <input
              style={s.tagInput}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
              placeholder={tags.length === 0 ? "e.g. React, Figma, SQL..." : "Add tag..."}
            />
          </div>
        )}
      </div>
      <p style={s.fieldHint}>{5 - tags.length} tag{5 - tags.length !== 1 ? "s" : ""} remaining · Press Enter to add</p>
    </div>
  );
}

// ─── FAQ accordion item ───────────────────────────────────────────────────────

function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={s.faqRow}>
      <button style={s.faqQ} onClick={() => setOpen(v => !v)} type="button">
        <span>{item.q}</span>
        <span style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "flex" }}>
          <Icon.ChevronDown />
        </span>
      </button>
      {open && <p style={s.faqA}>{item.a}</p>}
    </div>
  );
}

// ─── Preview card ─────────────────────────────────────────────────────────────

/**
 * Shows a live preview of the gig card exactly as it will appear
 * in the marketplace. This gives students confidence before submitting.
 */
function PreviewCard({
  title, category, price, deliveryDays, tags
}: {
  title: string; category: string; price: number; deliveryDays: number; tags: string[];
}) {
  return (
    <div style={s.previewCard}>
      <div style={s.previewThumb}>
        <span style={s.previewCat}>{category}</span>
      </div>
      <div style={s.previewBody}>
        <p style={s.previewTitle}>
          {title || <span style={{ color: "#A8A29E" }}>Your gig title will appear here...</span>}
        </p>
        <div style={s.previewTags}>
          {tags.slice(0, 3).map(tag => <span key={tag} style={s.previewTag}>{tag}</span>)}
        </div>
      </div>
      <div style={s.previewFooter}>
        <div style={{ fontSize: "0.72rem", color: "#78716C", display: "flex", alignItems: "center", gap: 4 }}>
          <Icon.Clock />
          <span>{deliveryDays}d delivery</span>
        </div>
        <div>
          <span style={{ fontSize: "0.68rem", color: "#A8A29E", display: "block" }}>From</span>
          <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#0C0A09" }}>
            {price > 0 ? `${price.toLocaleString()} RWF` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PostGigPage() {
  const router = useRouter();

  // Read the email from the URL so we know which student is posting.
  // In production this would come from the session instead.
  const [email, setEmail] = useState("");
  useEffect(() => {
    const e = new URLSearchParams(window.location.search).get("email") ?? "";
    setEmail(e);
  }, []);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [title, setTitle]               = useState("");
  const [category, setCategory]         = useState("Development");
  const [description, setDescription]   = useState("");
  const [price, setPrice]               = useState(15000);
  const [deliveryDays, setDeliveryDays] = useState(3);
  const [tags, setTags]                 = useState<string[]>([]);
  const [revisions, setRevisions]       = useState("2");

  // ── UI state ────────────────────────────────────────────────────────────────
  const [error, setError]               = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview]   = useState(false);

  // Word count for description — helps students write enough detail
  const wordCount = description.trim() ? description.trim().split(/\s+/).length : 0;

  // Title character count — marketplace cards truncate at ~80 chars
  const titleOk = title.toLowerCase().startsWith("i will") && title.length >= 20;

  /**
   * Submits the gig to the backend API.
   * The API route at /api/gigs validates the payload, checks the student
   * exists in the DB, and creates the gig record in Prisma.
   * On success the student is redirected back to their dashboard.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/gigs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          title,
          category,
          description,
          price,
          delivery_days: deliveryDays,
          tags,
          revisions: Number(revisions),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to create gig");
      }

      // Back to dashboard — the new gig will appear in the My Gigs grid
      router.push(`/dashboard/student?email=${encodeURIComponent(email)}`);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to create gig. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

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
            <Link
              href={`/dashboard/student?email=${encodeURIComponent(email)}`}
              style={s.backLink}
            >
              <Icon.Back />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main style={s.main}>
        <div style={s.container}>

          {/* ── PAGE HEADER ────────────────────────────────────── */}
          <div style={s.pageHeader}>
            <div>
              <p style={s.pageHeaderSub}>Student Dashboard</p>
              <h1 style={s.pageHeaderTitle}>Post a New Gig</h1>
              <p style={s.pageHeaderDesc}>
                Create a service listing that will appear in the UniHustle marketplace.
                Businesses and peers can find and book you directly.
              </p>
            </div>

            {/* Live preview toggle */}
            <button
              type="button"
              style={{ ...s.previewToggle, ...(showPreview ? s.previewToggleActive : {}) }}
              onClick={() => setShowPreview(v => !v)}
            >
              <Icon.Eye />
              {showPreview ? "Hide Preview" : "Preview Card"}
            </button>
          </div>

          {/* Live preview */}
          {showPreview && (
            <div style={s.previewWrap}>
              <p style={s.previewLabel}>This is how your gig will look in the marketplace</p>
              <PreviewCard
                title={title}
                category={category}
                price={price}
                deliveryDays={deliveryDays}
                tags={tags}
              />
            </div>
          )}

          {/* ── MAIN LAYOUT ────────────────────────────────────── */}
          <div style={s.layout}>

            {/* ── FORM ─────────────────────────────────────────── */}
            <form style={s.formCard} onSubmit={handleSubmit}>

              {/* Error banner */}
              {error && (
                <div style={s.errorBanner}>
                  <Icon.Info />
                  {error}
                </div>
              )}

              {/* ── SECTION: Basic info ── */}
              <div style={s.formSection}>
                <h2 style={s.formSectionTitle}>Basic Information</h2>

                {/* Category */}
                <div style={s.field}>
                  <label style={s.label}>
                    Category
                  </label>
                  <div style={s.selectWrap}>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      style={s.select}
                      required
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <span style={s.selectArrow}><Icon.ChevronDown /></span>
                  </div>
                </div>

                {/* Title */}
                <div style={s.field}>
                  <div style={s.labelRow}>
                    <label style={s.label}>Gig Title</label>
                    <span style={{ ...s.charCount, ...(titleOk ? s.charCountOk : {}) }}>
                      {titleOk ? "✓ Looks good" : 'Start with "I will..."'}
                    </span>
                  </div>
                  <input
                    style={{ ...s.input, ...(title && !titleOk ? s.inputWarn : {}) }}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={TITLE_PLACEHOLDERS[category]}
                    maxLength={120}
                    required
                  />
                  <p style={s.fieldHint}>{title.length} / 120 characters</p>
                </div>

                {/* Description */}
                <div style={s.field}>
                  <div style={s.labelRow}>
                    <label style={s.label}>Description</label>
                    <span style={{ ...s.charCount, ...(wordCount >= 50 ? s.charCountOk : {}) }}>
                      {wordCount} {wordCount === 1 ? "word" : "words"} {wordCount < 50 ? `· aim for 50+` : "· great"}
                    </span>
                  </div>
                  <textarea
                    style={s.textarea}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe what you will deliver, what the buyer needs to provide, and what is NOT included. Be specific — clear scope prevents disputes."
                    rows={5}
                    required
                  />
                </div>
              </div>

              <div style={s.formDivider} />

              {/* ── SECTION: Pricing & delivery ── */}
              <div style={s.formSection}>
                <h2 style={s.formSectionTitle}>Pricing & Delivery</h2>

                <div style={s.twoCol}>
                  {/* Price */}
                  <div style={s.field}>
                    <label style={s.label}>Starting Price (RWF)</label>
                    <div style={s.inputAffix}>
                      <input
                        style={{ ...s.input, paddingRight: 56 }}
                        type="number"
                        min={1000}
                        step={500}
                        value={price}
                        onChange={e => setPrice(Number(e.target.value))}
                        required
                      />
                      <span style={s.affixLabel}>RWF</span>
                    </div>
                    <p style={s.fieldHint}>{PRICE_HINTS[category]}</p>
                  </div>

                  {/* Delivery time */}
                  <div style={s.field}>
                    <label style={s.label}>Delivery Time</label>
                    <div style={s.selectWrap}>
                      <select
                        value={deliveryDays}
                        onChange={e => setDeliveryDays(Number(e.target.value))}
                        style={s.select}
                      >
                        {DELIVERY_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <span style={s.selectArrow}><Icon.ChevronDown /></span>
                    </div>
                  </div>
                </div>

                {/* Revisions */}
                <div style={s.field}>
                  <label style={s.label}>Number of Revisions Included</label>
                  <div style={s.revisionBtns}>
                    {["1", "2", "3", "Unlimited"].map(r => (
                      <button
                        key={r}
                        type="button"
                        style={{ ...s.revisionBtn, ...(revisions === r ? s.revisionBtnActive : {}) }}
                        onClick={() => setRevisions(r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={s.formDivider} />

              {/* ── SECTION: Tags ── */}
              <div style={s.formSection}>
                <h2 style={s.formSectionTitle}>Skill Tags</h2>
                <p style={s.formSectionDesc}>
                  Add up to 5 tags that describe the tools and skills used.
                  These help businesses find your gig when searching by skill.
                </p>
                <TagInput tags={tags} onChange={setTags} />
              </div>

              <div style={s.formDivider} />

              {/* ── SUBMIT ── */}
              <div style={s.formFooter}>
                <Link
                  href={`/dashboard/student?email=${encodeURIComponent(email)}`}
                  style={s.cancelBtn}
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || !email || !title || !description}
                  style={{
                    ...s.submitBtn,
                    ...(isSubmitting || !email || !title || !description ? s.submitBtnDisabled : {}),
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span style={s.spinner} />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Icon.Bolt />
                      Publish Gig
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* ── SIDEBAR ──────────────────────────────────────── */}
            <aside style={s.sidebar}>

              {/* Tips card */}
              <div style={s.tipsCard}>
                <p style={s.tipsTitle}>Tips for a strong gig</p>
                <div style={s.tipsList}>
                  {[
                    'Start your title with "I will..."',
                    "Be specific — mention tools and outcomes",
                    "Set a price you're comfortable delivering at",
                    "Add skill tags to improve search visibility",
                    "Include 2–3 revision rounds to show confidence",
                  ].map((tip, i) => (
                    <div key={i} style={s.tipItem}>
                      <div style={s.tipDot}><Icon.Check /></div>
                      <span style={s.tipText}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category pricing card */}
              <div style={s.pricingCard}>
                <div style={s.pricingCardHead}>
                  <Icon.Tag />
                  <p style={s.pricingCardTitle}>Market rates for {category}</p>
                </div>
                <p style={s.pricingCardRange}>{PRICE_HINTS[category]}</p>
                <p style={s.pricingCardNote}>
                  These are typical rates on UniHustle. Pricing is always up to you —
                  new sellers often start at the lower end and raise rates after reviews come in.
                </p>
              </div>

              {/* FAQ */}
              <div style={s.faqCard}>
                <p style={s.tipsTitle}>Common questions</p>
                {FAQS.map((item, i) => <FaqRow key={i} item={item} />)}
              </div>

            </aside>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #F5F5F4; }
        a { text-decoration: none; color: inherit; }
        button { font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; }
        input, select, textarea { font-family: 'Plus Jakarta Sans', sans-serif; }
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #F97316 !important;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
        }
        textarea { resize: vertical; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        @media (max-width: 960px) {
          .layout { grid-template-columns: 1fr !important; }
          .sidebar { display: none !important; }
          .two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  root: { minHeight: "100vh", background: "#F5F5F4", fontFamily: "'Plus Jakarta Sans', sans-serif", WebkitFontSmoothing: "antialiased", color: "#0C0A09" },

  // NAV — identical to all other pages
  nav: { position: "sticky", top: 0, zIndex: 100, background: "white", borderBottom: "1px solid #E7E5E4" },
  navInner: { maxWidth: 1160, margin: "0 auto", padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { display: "flex", alignItems: "center", gap: 8, textDecoration: "none" },
  logoMark: { width: 28, height: 28, background: "#F97316", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" },
  logoText: { fontWeight: 800, fontSize: "0.95rem", color: "#0C0A09", letterSpacing: "-0.02em" },
  navRight: { display: "flex", alignItems: "center", gap: 8 },
  backLink: { display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", fontWeight: 600, color: "#44403C", padding: "6px 14px", border: "1px solid #E7E5E4", borderRadius: 8, textDecoration: "none" },

  // MAIN
  main: { padding: "36px 0 80px" },
  container: { maxWidth: 1160, margin: "0 auto", padding: "0 28px" },

  // Page header
  pageHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 16, flexWrap: "wrap" as const },
  pageHeaderSub: { fontSize: "0.78rem", fontWeight: 600, color: "#F97316", marginBottom: 4 },
  pageHeaderTitle: { fontSize: "1.7rem", fontWeight: 800, color: "#0C0A09", letterSpacing: "-0.03em", marginBottom: 6 },
  pageHeaderDesc: { fontSize: "0.85rem", color: "#78716C", lineHeight: 1.6, maxWidth: 520 },

  // Preview toggle button
  previewToggle: { display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 9, border: "1.5px solid #E7E5E4", background: "white", fontSize: "0.82rem", fontWeight: 600, color: "#44403C", flexShrink: 0 },
  previewToggleActive: { borderColor: "#F97316", color: "#F97316", background: "#FFF7ED" },

  // Preview card wrapper
  previewWrap: { background: "white", border: "1px solid #E7E5E4", borderRadius: 12, padding: "20px 22px", marginBottom: 24 },
  previewLabel: { fontSize: "0.75rem", fontWeight: 600, color: "#A8A29E", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 14 },
  previewCard: { background: "#FAFAFA", border: "1px solid #E7E5E4", borderRadius: 10, overflow: "hidden", maxWidth: 280 },
  previewThumb: { height: 100, background: "#F5F5F4", borderBottom: "1px solid #E7E5E4", display: "flex", alignItems: "flex-end", padding: "8px 10px" },
  previewCat: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.07em", color: "#78716C", background: "white", border: "1px solid #E7E5E4", borderRadius: 999, padding: "2px 8px" },
  previewBody: { padding: "12px 14px 8px" },
  previewTitle: { fontSize: "0.8rem", fontWeight: 600, color: "#0C0A09", lineHeight: 1.45, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" },
  previewTags: { display: "flex", flexWrap: "wrap" as const, gap: 4 },
  previewTag: { fontSize: "0.6rem", fontWeight: 600, color: "#78716C", background: "#F5F5F4", border: "1px solid #E7E5E4", borderRadius: 5, padding: "2px 7px" },
  previewFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px 12px", borderTop: "1px solid #F5F5F4" },

  // Layout
  layout: { display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "flex-start" },

  // Form card
  formCard: { background: "white", border: "1px solid #E7E5E4", borderRadius: 14, overflow: "hidden" },
  formSection: { padding: "24px 28px" },
  formSectionTitle: { fontSize: "0.88rem", fontWeight: 700, color: "#0C0A09", marginBottom: 4, letterSpacing: "-0.01em" },
  formSectionDesc: { fontSize: "0.78rem", color: "#A8A29E", marginBottom: 16 },
  formDivider: { height: 1, background: "#F5F5F4" },
  formFooter: { padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, borderTop: "1px solid #F5F5F4" },

  // Fields
  field: { marginBottom: 18 },
  label: { display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#1C1917", marginBottom: 6 },
  labelRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  charCount: { fontSize: "0.72rem", fontWeight: 600, color: "#A8A29E" },
  charCountOk: { color: "#16A34A" },
  fieldHint: { fontSize: "0.72rem", color: "#A8A29E", marginTop: 5 },
  input: {
    width: "100%", padding: "11px 14px",
    border: "1.5px solid #E7E5E4", borderRadius: 10,
    fontSize: "0.875rem", color: "#0C0A09",
    background: "white", outline: "none",
    transition: "border-color 0.2s",
  },
  inputWarn: { borderColor: "#FED7AA" },
  textarea: {
    width: "100%", padding: "11px 14px",
    border: "1.5px solid #E7E5E4", borderRadius: 10,
    fontSize: "0.875rem", color: "#0C0A09",
    background: "white", outline: "none",
    lineHeight: 1.6, minHeight: 120,
  },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  selectWrap: { position: "relative" },
  select: {
    width: "100%", padding: "11px 36px 11px 14px",
    border: "1.5px solid #E7E5E4", borderRadius: 10,
    fontSize: "0.875rem", color: "#0C0A09",
    background: "white", outline: "none",
    appearance: "none" as const,
  },
  selectArrow: { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#78716C", display: "flex" },
  inputAffix: { position: "relative" },
  affixLabel: { position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: "0.78rem", fontWeight: 700, color: "#A8A29E" },

  // Revision buttons
  revisionBtns: { display: "flex", gap: 8, flexWrap: "wrap" as const },
  revisionBtn: { padding: "7px 18px", borderRadius: 8, border: "1.5px solid #E7E5E4", background: "white", fontSize: "0.82rem", fontWeight: 600, color: "#78716C" },
  revisionBtnActive: { borderColor: "#F97316", background: "#FFF7ED", color: "#EA580C" },

  // Tag input
  tagPills: { display: "flex", flexWrap: "wrap" as const, gap: 7, padding: "10px 12px", border: "1.5px solid #E7E5E4", borderRadius: 10, background: "white", minHeight: 48, alignItems: "center" },
  tagPill: { display: "inline-flex", alignItems: "center", gap: 5, background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 999, padding: "4px 10px", fontSize: "0.75rem", fontWeight: 600, color: "#EA580C" },
  tagRemove: { background: "none", border: "none", color: "#EA580C", fontSize: "1rem", lineHeight: 1, padding: 0, cursor: "pointer", marginLeft: 2 },
  tagInputWrap: { flex: 1, minWidth: 120 },
  tagInput: { width: "100%", border: "none", outline: "none", fontSize: "0.82rem", color: "#0C0A09", background: "transparent", padding: "2px 4px" },

  // Submit area
  cancelBtn: { padding: "9px 18px", borderRadius: 9, border: "1px solid #E7E5E4", background: "white", fontSize: "0.85rem", fontWeight: 600, color: "#78716C" },
  submitBtn: { display: "flex", alignItems: "center", gap: 7, padding: "10px 22px", borderRadius: 9, background: "#F97316", color: "white", border: "none", fontSize: "0.88rem", fontWeight: 700, boxShadow: "0 4px 14px rgba(249,115,22,0.28)" },
  submitBtnDisabled: { opacity: 0.5, cursor: "not-allowed", boxShadow: "none" },
  spinner: { width: 14, height: 14, border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: 999, animation: "spin 0.7s linear infinite" },

  // Error banner
  errorBanner: { display: "flex", alignItems: "center", gap: 8, background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: "0.82rem", fontWeight: 500, padding: "12px 16px", margin: "24px 28px -6px", borderRadius: 10 },

  // Sidebar cards
  sidebar: { display: "flex", flexDirection: "column" as const, gap: 16, position: "sticky" as const, top: 84 },
  tipsCard: { background: "white", border: "1px solid #E7E5E4", borderRadius: 12, padding: "20px" },
  tipsTitle: { fontSize: "0.82rem", fontWeight: 700, color: "#0C0A09", marginBottom: 14 },
  tipsList: { display: "flex", flexDirection: "column" as const, gap: 10 },
  tipItem: { display: "flex", alignItems: "flex-start", gap: 9 },
  tipDot: { width: 20, height: 20, borderRadius: 999, background: "#F0FDF4", border: "1px solid #BBF7D0", display: "flex", alignItems: "center", justifyContent: "center", color: "#16A34A", flexShrink: 0, marginTop: 1 },
  tipText: { fontSize: "0.78rem", color: "#44403C", lineHeight: 1.5 },
  pricingCard: { background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 12, padding: "16px 18px" },
  pricingCardHead: { display: "flex", alignItems: "center", gap: 7, marginBottom: 6, color: "#EA580C" },
  pricingCardTitle: { fontSize: "0.78rem", fontWeight: 700, color: "#EA580C" },
  pricingCardRange: { fontSize: "0.88rem", fontWeight: 800, color: "#0C0A09", marginBottom: 6 },
  pricingCardNote: { fontSize: "0.72rem", color: "#78716C", lineHeight: 1.6 },
  faqCard: { background: "white", border: "1px solid #E7E5E4", borderRadius: 12, padding: "20px" },
  faqRow: { borderBottom: "1px solid #F5F5F4", paddingBottom: 10, marginBottom: 10 },
  faqQ: { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", fontSize: "0.8rem", fontWeight: 600, color: "#0C0A09", textAlign: "left" as const, gap: 8, paddingBottom: 2, lineHeight: 1.4 },
  faqA: { fontSize: "0.77rem", color: "#78716C", lineHeight: 1.6, marginTop: 8 },
};