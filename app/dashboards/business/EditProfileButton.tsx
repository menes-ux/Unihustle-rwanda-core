"use client";

import { useState } from "react";
import { updateBusinessName } from "@/app/dashboards/business/actions";

interface Props {
  businessEmail: string;
  currentName: string;
}

export default function EditProfileButton({ businessEmail, currentName }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Enterprise name cannot be empty");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await updateBusinessName(businessEmail, name);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
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
        Edit Enterprise Name
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
            <h3 style={{ margin: 0, marginBottom: 16, fontSize: '1.1rem', fontWeight: 700 }}>Set Enterprise Name</h3>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enterprise Name"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #E7E5E4',
                borderRadius: 8,
                fontSize: '0.9rem',
                marginBottom: 16
              }}
            />
            {error && (
              <p style={{ color: '#EF4444', fontSize: '0.85rem', marginBottom: 16, margin: 0 }}>
                {error}
              </p>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => {
                setOpen(false);
                setError(null);
              }} style={{
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