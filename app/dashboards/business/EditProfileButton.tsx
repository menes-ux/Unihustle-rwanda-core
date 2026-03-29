"use client";

import { useState } from "react";

interface Props {
  businessEmail: string;
  currentName: string;
  onUpdate: () => void;
}

export default function EditProfileButton({ businessEmail, currentName, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: businessEmail, full_name: name }),
      });
      if (!res.ok) throw new Error("Failed to update");
      onUpdate();
      setOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: 'none',
        border: '1px solid #E7E5E4',
        borderRadius: 8,
        padding: '7px 14px',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: '#44403C',
        cursor: 'pointer'
      }}>
        Edit Name
      </button>
      {open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: '24px',
            maxWidth: 400,
            width: '90%'
          }}>
            <h3 style={{ margin: 0, marginBottom: 16, fontSize: '1.1rem', fontWeight: 700 }}>Edit Business Name</h3>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Business Name"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #E7E5E4',
                borderRadius: 8,
                fontSize: '0.9rem',
                marginBottom: 16
              }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setOpen(false)} style={{
                padding: '8px 16px',
                border: '1px solid #E7E5E4',
                borderRadius: 8,
                background: 'none',
                cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={handleSave} disabled={loading} style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: 8,
                background: '#F97316',
                color: 'white',
                cursor: 'pointer'
              }}>{loading ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}