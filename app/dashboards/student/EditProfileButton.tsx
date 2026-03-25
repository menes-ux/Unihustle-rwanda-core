"use client";

import { useState } from "react";
import EditProfileModal from "./EditProfileModal";

interface Props {
  studentEmail: string;
  current: {
    full_name:     string;
    bio:           string;
    major:         string;
    cohort:        string;
    year_of_study: string;
    gpa:           string;
    skills:        string[];
    school:        string;
  };
}

/**
 * EditProfileButton — the small "Edit Profile" button on the profile card.
 *
 * This component owns the open/close state for the modal.
 * We keep it separate from the modal itself so the modal only
 * mounts when it's actually needed, keeping the initial page load fast.
 */
export default function EditProfileButton({ studentEmail, current }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "none", border: "1px solid #E7E5E4",
          borderRadius: 8, padding: "7px 14px",
          fontSize: "0.8rem", fontWeight: 600, color: "#44403C",
          cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* Edit icon */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Edit Profile
      </button>

      {/* Only render the modal when it's open */}
      {open && (
        <EditProfileModal
          studentEmail={studentEmail}
          current={current}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}