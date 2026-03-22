"use client";

import { useState } from "react";
import { updateStudentProfile } from "./actions";

interface Props {
  studentEmail: string;
  current: {
    full_name:    string;
    bio:          string;
    major:        string;
    cohort:       string;
    year_of_study: string;
    gpa:          string;
    skills:       string[];
    school:       string;
  };
  onClose: () => void;
}

/**
 * EditProfileModal — slide-in panel that lets the student update
 * every field on their public profile card.
 *
 * It receives the current DB values as props so the fields are
 * pre-filled — the student only needs to change what they want.
 *
 * On submit it calls the updateStudentProfile Server Action,
 * which patches the DB and calls revalidatePath so the dashboard
 * card refreshes without a full page reload.
 */
export default function EditProfileModal({ studentEmail, current, onClose }: Props) {
  // Pre-fill every field with what's already in the DB
  const [fullName,    setFullName]    = useState(current.full_name);
  const [bio,         setBio]         = useState(current.bio);
  const [major,       setMajor]       = useState(current.major);
  const [cohort,      setCohort]      = useState(current.cohort);
  const [yearOfStudy, setYearOfStudy] = useState(current.year_of_study);
  const [gpa,         setGpa]         = useState(current.gpa);
  const [school,      setSchool]      = useState(current.school);

  // Skills are managed as a live array — the student types a tag
  // and presses Enter or comma to add it, clicks × to remove it
  const [skills,      setSkills]      = useState<string[]>(current.skills);
  const [skillInput,  setSkillInput]  = useState("");

  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  // ── Skill tag helpers ─────────────────────────────────────────

  const addSkill = () => {
    const trimmed = skillInput.trim().replace(/,$/, "");
    if (trimmed && !skills.includes(trimmed) && skills.length < 10) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  // ── Submit ────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await updateStudentProfile(studentEmail, {
        full_name:    fullName,
        bio,
        major,
        cohort,
        year_of_study: yearOfStudy,
        gpa:          gpa ? parseFloat(gpa) : undefined,
        skills,
      });
      // Close the modal — the dashboard will revalidate automatically
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────

  return (
    <>
      {/* Dark overlay behind the modal */}
      <div
        style={s.overlay}
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal panel */}
      <div style={s.modal} role="dialog" aria-modal="true" aria-label="Edit Profile">

        {/* Header */}
        <div style={s.modalHeader}>
          <h2 style={s.modalTitle}>Edit Profile</h2>
          <button style={s.closeBtn} onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" width={16} height={16}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={s.form}>

          {error && (
            <div style={s.errorBanner}>{error}</div>
          )}

          {/* Full name */}
          <div style={s.field}>
            <label style={s.label}>Full Name</label>
            <input
              style={s.input}
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Menes Adisso"
              required
            />
          </div>

          {/* School */}
          <div style={s.field}>
            <label style={s.label}>University / School</label>
            <input
              style={s.input}
              value={school}
              onChange={e => setSchool(e.target.value)}
              placeholder="e.g. African Leadership University"
            />
          </div>

          {/* Two column row */}
          <div style={s.twoCol}>
            <div style={s.field}>
              <label style={s.label}>Major</label>
              <input
                style={s.input}
                value={major}
                onChange={e => setMajor(e.target.value)}
                placeholder="e.g. BSc. Software Engineering"
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Cohort</label>
              <input
                style={s.input}
                value={cohort}
                onChange={e => setCohort(e.target.value)}
                placeholder="e.g. Class of 2026"
              />
            </div>
          </div>

          {/* Two column row */}
          <div style={s.twoCol}>
            <div style={s.field}>
              <label style={s.label}>Year of Study</label>
              <input
                style={s.input}
                value={yearOfStudy}
                onChange={e => setYearOfStudy(e.target.value)}
                placeholder="e.g. Year 2"
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>GPA</label>
              <input
                style={s.input}
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={gpa}
                onChange={e => setGpa(e.target.value)}
                placeholder="e.g. 3.85"
              />
            </div>
          </div>

          {/* Bio */}
          <div style={s.field}>
            <label style={s.label}>Bio</label>
            <textarea
              style={s.textarea}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell businesses what you do and what you're passionate about..."
              rows={3}
            />
            <p style={s.hint}>{bio.length} / 300 characters</p>
          </div>

          {/* Skills */}
          <div style={s.field}>
            <label style={s.label}>Skills</label>
            <div style={s.tagPills}>
              {skills.map(skill => (
                <span key={skill} style={s.tagPill}>
                  {skill}
                  <button
                    type="button"
                    style={s.tagRemove}
                    onClick={() => removeSkill(skill)}
                  >
                    ×
                  </button>
                </span>
              ))}
              {skills.length < 10 && (
                <input
                  style={s.tagInput}
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder={skills.length === 0 ? "e.g. React, Figma, SQL..." : "Add skill..."}
                />
              )}
            </div>
            <p style={s.hint}>Press Enter or comma to add · {10 - skills.length} remaining</p>
          </div>

          {/* Footer actions */}
          <div style={s.formFooter}>
            <button type="button" style={s.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ ...s.saveBtn, ...(saving ? s.saveBtnDisabled : {}) }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </form>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        input:focus, textarea:focus {
          outline: none;
          border-color: #F97316 !important;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
        }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  // Overlay dims the rest of the page when the modal is open
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(12,10,9,0.45)",
    zIndex: 200,
    backdropFilter: "blur(2px)",
  },

  // Modal panel — slides in from the right on desktop
  modal: {
    position: "fixed",
    top: 0, right: 0, bottom: 0,
    width: "100%", maxWidth: 520,
    background: "white",
    zIndex: 201,
    display: "flex", flexDirection: "column" as const,
    boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },

  modalHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "22px 28px",
    borderBottom: "1px solid #E7E5E4",
    flexShrink: 0,
  },
  modalTitle: {
    fontSize: "1rem", fontWeight: 700,
    color: "#0C0A09", letterSpacing: "-0.01em",
  },
  closeBtn: {
    background: "none", border: "1px solid #E7E5E4",
    borderRadius: 8, width: 32, height: 32,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#78716C", cursor: "pointer",
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
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },

  label: {
    fontSize: "0.82rem", fontWeight: 600,
    color: "#1C1917",
  },
  hint: { fontSize: "0.72rem", color: "#A8A29E" },

  input: {
    padding: "10px 14px",
    border: "1.5px solid #E7E5E4", borderRadius: 10,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.875rem", color: "#0C0A09",
    background: "white", outline: "none",
  },
  textarea: {
    padding: "10px 14px",
    border: "1.5px solid #E7E5E4", borderRadius: 10,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.875rem", color: "#0C0A09",
    background: "white", outline: "none",
    resize: "vertical" as const, lineHeight: 1.6,
  },

  // Tag / skill pills
  tagPills: {
    display: "flex", flexWrap: "wrap" as const, gap: 7,
    padding: "10px 12px",
    border: "1.5px solid #E7E5E4", borderRadius: 10,
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

  // Footer
  formFooter: {
    display: "flex", alignItems: "center",
    justifyContent: "flex-end", gap: 10,
    paddingTop: 8, borderTop: "1px solid #F5F5F4",
    flexShrink: 0,
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
    fontSize: "0.88rem", fontWeight: 700,
    cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
    boxShadow: "0 4px 14px rgba(249,115,22,0.25)",
  },
  saveBtnDisabled: {
    opacity: 0.55, cursor: "not-allowed", boxShadow: "none",
  },
};