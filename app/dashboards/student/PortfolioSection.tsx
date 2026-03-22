"use client";

import { useState } from "react";
import AddProjectModal from "./AddProjectModal";
import { deletePortfolioItem } from "./actions";

interface PortfolioItem {
  portfolio_id: number;
  title:        string;
  link:         string;
  description:  string | null;
  type:         string;
  tags:         string[];
}

interface Props {
  studentEmail: string;
  items:        PortfolioItem[];
}

/**
 * PortfolioSection — renders the full Zero-to-One Portfolio grid.
 *
 * This is a Client Component because:
 *   1. The "Add Project" button needs useState to open/close the modal
 *   2. The delete button on each card calls a Server Action directly
 *
 * It receives the portfolio items as props from the Server Component
 * (page.tsx) so the data is already fetched before this renders.
 */
export default function PortfolioSection({ studentEmail, items }: Props) {
  const [open,    setOpen]    = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (portfolioId: number) => {
    if (deleting) return;
    setDeleting(portfolioId);
    try {
      await deletePortfolioItem(portfolioId, studentEmail);
    } catch (err) {
      console.error("Failed to delete portfolio item:", err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      {/* Section header */}
      <div style={s.sectionHead}>
        <div>
          <h2 style={s.sectionTitle}>Zero-to-One Portfolio</h2>
          <p style={s.sectionDesc}>
            Personal projects, repos, and designs — visible to businesses even before your first review
          </p>
        </div>
        <button style={s.createBtn} onClick={() => setOpen(true)}>
          <PlusIcon /> Add Project
        </button>
      </div>

      {/* Portfolio grid */}
      <div style={s.portfolioGrid} className="portfolio-grid">
        {items.map(item => (
          <div key={item.portfolio_id} style={s.portfolioCard}>
            <div style={s.portfolioCardTop}>
              <span style={{
                ...s.portfolioTypeBadge,
                ...getTypeBadgeStyle(item.type),
              }}>
                {getTypeIcon(item.type)}
                {item.type}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                {/* External link */}
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={s.iconBtn}
                  aria-label="Open project"
                >
                  <ExternalLinkIcon />
                </a>
                {/* Delete button */}
                <button
                  style={{
                    ...s.iconBtn,
                    ...(deleting === item.portfolio_id ? { opacity: 0.5 } : {}),
                  }}
                  onClick={() => handleDelete(item.portfolio_id)}
                  disabled={deleting === item.portfolio_id}
                  aria-label="Delete project"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
            <p style={s.portfolioTitle}>{item.title}</p>
            {item.description && (
              <p style={s.portfolioDesc}>{item.description}</p>
            )}
            <div style={s.portfolioTags}>
              {item.tags.map(tag => (
                <span key={tag} style={s.portfolioTag}>{tag}</span>
              ))}
            </div>
          </div>
        ))}

        {/* Always show the "Add a project" ghost card at the end */}
        <button style={s.portfolioAddCard} onClick={() => setOpen(true)}>
          <div style={s.portfolioAddIcon}><PlusIcon /></div>
          <p style={s.portfolioAddText}>Add a project</p>
          <p style={s.portfolioAddSub}>GitHub, Behance, Figma, or a live link</p>
        </button>
      </div>

      {/* Modal — only mounts when open */}
      {open && (
        <AddProjectModal
          studentEmail={studentEmail}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

// ─── Type badge helpers ───────────────────────────────────────────────────────

function getTypeBadgeStyle(type: string): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    GitHub:  { color: "#0C0A09", background: "#F5F5F4" },
    Figma:   { color: "#8B5CF6", background: "#F5F3FF" },
    Live:    { color: "#16A34A", background: "#F0FDF4" },
    Behance: { color: "#0061FF", background: "#EFF6FF" },
  };
  return map[type] ?? { color: "#44403C", background: "#F5F5F4" };
}

function getTypeIcon(type: string) {
  if (type === "GitHub")  return <GitHubIcon />;
  if (type === "Figma")   return <FigmaIcon />;
  return <GlobeIcon />;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" width={14} height={14}>
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={13} height={13}>
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const FigmaIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={13} height={13}>
    <path d="M5 5.5A3.5 3.5 0 018.5 2H12v7H8.5A3.5 3.5 0 015 5.5zm7-3.5h3.5a3.5 3.5 0 110 7H12V2zm0 8.5h3.5a3.5 3.5 0 110 7H12v-7zm-7 3.5A3.5 3.5 0 018.5 10.5H12v7H8.5A3.5 3.5 0 015 14zm3.5 3.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  sectionHead: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "space-between", marginBottom: 14, gap: 12,
  },
  sectionTitle: { fontSize: "0.95rem", fontWeight: 700, color: "#0C0A09", letterSpacing: "-0.01em" },
  sectionDesc:  { fontSize: "0.78rem", color: "#A8A29E", marginTop: 2 },
  createBtn: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "#F97316", color: "white", border: "none",
    borderRadius: 8, padding: "8px 16px",
    fontSize: "0.82rem", fontWeight: 700, flexShrink: 0,
    cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  portfolioGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 },
  portfolioCard: {
    background: "white", border: "1px solid #E7E5E4",
    borderRadius: 12, padding: "18px",
    display: "flex", flexDirection: "column" as const, gap: 10,
  },
  portfolioCardTop: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  portfolioTypeBadge: {
    display: "inline-flex", alignItems: "center", gap: 5,
    fontSize: "0.72rem", fontWeight: 700,
    borderRadius: 999, padding: "3px 10px",
    border: "1px solid currentColor",
  },
  portfolioTitle: { fontSize: "0.88rem", fontWeight: 700, color: "#0C0A09", lineHeight: 1.35 },
  portfolioDesc:  { fontSize: "0.8rem", color: "#78716C", lineHeight: 1.6, flex: 1 },
  portfolioTags:  { display: "flex", flexWrap: "wrap" as const, gap: 5 },
  portfolioTag: {
    fontSize: "0.65rem", fontWeight: 600, color: "#78716C",
    background: "#F5F5F4", border: "1px solid #E7E5E4",
    borderRadius: 6, padding: "2px 8px",
  },
  iconBtn: {
    width: 28, height: 28, borderRadius: 7,
    border: "1px solid #E7E5E4", background: "white",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#78716C", cursor: "pointer", textDecoration: "none",
  },
  portfolioAddCard: {
    background: "none", border: "1.5px dashed #E7E5E4",
    borderRadius: 12, padding: "24px 18px",
    display: "flex", flexDirection: "column" as const,
    alignItems: "center", justifyContent: "center",
    gap: 8, cursor: "pointer", textAlign: "center" as const,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  portfolioAddIcon: {
    width: 36, height: 36, borderRadius: 999,
    background: "#F5F5F4", display: "flex",
    alignItems: "center", justifyContent: "center", color: "#A8A29E",
  },
  portfolioAddText: { fontSize: "0.83rem", fontWeight: 600, color: "#44403C" },
  portfolioAddSub:  { fontSize: "0.73rem", color: "#A8A29E" },
};