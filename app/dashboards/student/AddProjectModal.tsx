"use client";

import { useState } from "react";
import { addPortfolioItem } from "./actions";

interface Props {
  studentEmail: string;
  onClose: () => void;
}

const PROJECT_TYPES = ["GitHub", "Figma", "Live", "Behance"] as const;

/**
 * AddProjectModal — lets the student add a new portfolio project.
 *
 * Collects the project title, URL, type (GitHub/Figma/Live/Behance),
 * a short description, and skill tags. On submit it calls the
 * addPortfolioItem Server Action which inserts the row into the DB
 * and revalidates the dashboard so the new card appears immediately.
 */
export default function AddProjectModal({ studentEmail, onClose }: Props) {
  const [title,       setTitle]       = useState("");
  const [link,        setLink]        = useState("");
  const [type,        setType]        = useState<typeof PROJECT_TYPES[number]>("GitHub");
  const [description, setDescription] = useState("");
  const [tagInput,    setTagInput]    = useState("");
  const [tags,        setTags]        = useState<string[]>([]);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");

  // ── Tag helpers ───────────────────────────────────────────────

  const addTag = () => {
    const trimmed = tagInput.trim().replace(/,$/, "");
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  // ── Submit ────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await addPortfolioItem(studentEmail, {
        title,
        link,
        description,
        type,
        tags,
      });
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────

  return (
    <>
      <div style={s.overlay} onClick={onClose} />

      <div style={s.modal} role="dialog" aria-modal="true">

        <div style={s.modalHeader}>
          <h2 style={s.modalTitle}>Add a Project</h2>
          <button style={s.closeBtn} onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" width={16} height={16}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>

          {error && <div style={s.errorBanner}>{error}</div>}

          {/* Project type selector */}
          <div style={s.field}>
            <label style={s.label}>Project Type</label>
            <div style={s.typeBtns}>
              {PROJECT_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  style={{ ...s.typeBtn, ...(type === t ? s.typeBtnActive : {}) }}
                  onClick={() => setType(t)}
                >
                  {t === "GitHub"  && <GitHubIcon />}
                  {t === "Figma"   && <FigmaIcon />}
                  {t === "Live"    && <GlobeIcon />}
                  {t === "Behance" && <GlobeIcon />}
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div style={s.field}>
            <label style={s.label}>Project Title</label>
            <input
              style={s.input}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. UniHustle Rwanda"
              required
            />
          </div>

          {/* URL */}
          <div style={s.field}>
            <label style={s.label}>
              {type === "GitHub"  ? "GitHub Repository URL" :
               type === "Figma"   ? "Figma File URL" :
               type === "Behance" ? "Behance Project URL" :
               "Live Project URL"}
            </label>
            <input
              style={s.input}
              type="url"
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder={
                type === "GitHub"  ? "https://github.com/you/project" :
                type === "Figma"   ? "https://figma.com/file/..." :
                type === "Behance" ? "https://behance.net/gallery/..." :
                "https://yourproject.com"
              }
              required
            />
          </div>

          {/* Description */}
          <div style={s.field}>
            <label style={s.label}>Short Description</label>
            <textarea
              style={s.textarea}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What did you build? What problem does it solve?"
              rows={3}
            />
          </div>

          {/* Tags */}
          <div style={s.field}>
            <label style={s.label}>Tech Stack Tags</label>
            <div style={s.tagPills}>
              {tags.map(tag => (
                <span key={tag} style={s.tagPill}>
                  {tag}
                  <button
                    type="button"
                    style={s.tagRemove}
                    onClick={() => removeTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
              {tags.length < 5 && (
                <input
                  style={s.tagInput}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder={tags.length === 0 ? "e.g. Next.js, Supabase..." : "Add tag..."}
                />
              )}
            </div>
            <p style={s.hint}>Press Enter or comma to add · {5 - tags.length} remaining</p>
          </div>

          <div style={s.formFooter}>
            <button type="button" style={s.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title || !link}
              style={{
                ...s.saveBtn,
                ...((saving || !title || !link) ? s.saveBtnDisabled : {}),
              }}
            >
              {saving ? "Adding..." : "Add Project"}
            </button>
          </div>

        </form>
      </div>

      <style>{`
        input:focus, textarea:focus {
          outline: none;
          border-color: #F97316 !important;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
        }
      `}</style>
    </>
  );
}

// ─── Small inline icons ───────────────────────────────────────────────────────

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}>
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const FigmaIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}>
    <path d="M5 5.5A3.5 3.5 0 018.5 2H12v7H8.5A3.5 3.5 0 015 5.5zm7-3.5h3.5a3.5 3.5 0 110 7H12V2zm0 8.5h3.5a3.5 3.5 0 110 7H12v-7zm-7 3.5A3.5 3.5 0 018.5 10.5H12v7H8.5A3.5 3.5 0 015 14zm3.5 3.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(12,10,9,0.45)",
    zIndex: 200, backdropFilter: "blur(2px)",
  },
  modal: {
    position: "fixed", top: 0, right: 0, bottom: 0,
    width: "100%", maxWidth: 500,
    background: "white", zIndex: 201,
    display: "flex", flexDirection: "column" as const,
    boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  modalHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "22px 28px", borderBottom: "1px solid #E7E5E4", flexShrink: 0,
  },
  modalTitle: { fontSize: "1rem", fontWeight: 700, color: "#0C0A09" },
  closeBtn: {
    background: "none", border: "1px solid #E7E5E4", borderRadius: 8,
    width: 32, height: 32, display: "flex", alignItems: "center",
    justifyContent: "center", color: "#78716C", cursor: "pointer",
  },
  form: {
    flex: 1, overflowY: "auto" as const,
    padding: "24px 28px",
    display: "flex", flexDirection: "column" as const, gap: 18,
  },
  errorBanner: {
    background: "#FEF2F2", border: "1px solid #FECACA",
    color: "#DC2626", fontSize: "0.82rem",
    padding: "10px 14px", borderRadius: 9,
  },
  field: { display: "flex", flexDirection: "column" as const, gap: 6 },
  label: { fontSize: "0.82rem", fontWeight: 600, color: "#1C1917" },
  hint:  { fontSize: "0.72rem", color: "#A8A29E" },
  input: {
    padding: "10px 14px", border: "1.5px solid #E7E5E4", borderRadius: 10,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.875rem", color: "#0C0A09", background: "white", outline: "none",
  },
  textarea: {
    padding: "10px 14px", border: "1.5px solid #E7E5E4", borderRadius: 10,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.875rem", color: "#0C0A09", background: "white", outline: "none",
    resize: "vertical" as const, lineHeight: 1.6,
  },
  typeBtns: { display: "flex", gap: 8, flexWrap: "wrap" as const },
  typeBtn: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "7px 14px", borderRadius: 8,
    border: "1.5px solid #E7E5E4", background: "white",
    fontSize: "0.82rem", fontWeight: 600, color: "#78716C",
    cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  typeBtnActive: { borderColor: "#F97316", background: "#FFF7ED", color: "#EA580C" },
  tagPills: {
    display: "flex", flexWrap: "wrap" as const, gap: 7,
    padding: "10px 12px", border: "1.5px solid #E7E5E4", borderRadius: 10,
    background: "white", minHeight: 48, alignItems: "center",
  },
  tagPill: {
    display: "inline-flex", alignItems: "center", gap: 5,
    background: "#FFF7ED", border: "1px solid #FED7AA",
    borderRadius: 999, padding: "4px 10px",
    fontSize: "0.75rem", fontWeight: 600, color: "#EA580C",
  },
  tagRemove: {
    background: "none", border: "none", color: "#EA580C",
    fontSize: "1rem", lineHeight: 1, padding: 0, cursor: "pointer",
  },
  tagInput: {
    flex: 1, minWidth: 120, border: "none", outline: "none",
    fontSize: "0.82rem", color: "#0C0A09",
    background: "transparent", padding: "2px 4px",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  formFooter: {
    display: "flex", alignItems: "center",
    justifyContent: "flex-end", gap: 10,
    paddingTop: 8, borderTop: "1px solid #F5F5F4", flexShrink: 0,
  },
  cancelBtn: {
    padding: "9px 18px", borderRadius: 9,
    border: "1px solid #E7E5E4", background: "white",
    fontSize: "0.85rem", fontWeight: 600, color: "#78716C",
    cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  saveBtn: {
    padding: "10px 22px", borderRadius: 9,
    background: "#F97316", color: "white", border: "none",
    fontSize: "0.88rem", fontWeight: 700, cursor: "pointer",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    boxShadow: "0 4px 14px rgba(249,115,22,0.25)",
  },
  saveBtnDisabled: { opacity: 0.5, cursor: "not-allowed", boxShadow: "none" },
};