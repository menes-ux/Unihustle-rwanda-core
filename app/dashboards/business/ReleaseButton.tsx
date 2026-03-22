"use client";

import { useState } from "react";

interface Props {
  orderId:    number;
  buyerEmail: string;
}

/**
 * ReleaseButton — lets the business mark an order as completed
 * after reviewing the student's delivered work.
 *
 * Calls POST /api/orders/release which:
 *   1. Verifies the buyer owns this order
 *   2. Sets status to "completed"
 *   3. Revalidates the business dashboard
 *
 * The order then moves off the Active Hires table automatically.
 */
export default function ReleaseButton({ orderId, buyerEmail }: Props) {
  const [loading,   setLoading]   = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error,     setError]     = useState("");

  const handleRelease = async () => {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders/release", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ order_id: orderId, buyer_email: buyerEmail }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to release order");

      setConfirmed(true);
      // Page revalidates via the API route calling revalidatePath,
      // so the row disappears from the table automatically
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#16A34A" }}>
        Released
      </span>
    );
  }

  return (
    <div>
      <button
        onClick={handleRelease}
        disabled={loading}
        style={{
          background: loading ? "#F5F5F4" : "white",
          color:      loading ? "#A8A29E" : "#0C0A09",
          border:     "1px solid #E7E5E4",
          borderRadius: 7,
          padding:    "6px 12px",
          fontSize:   "0.75rem",
          fontWeight: 700,
          cursor:     loading ? "not-allowed" : "pointer",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          whiteSpace: "nowrap" as const,
        }}
      >
        {loading ? "Releasing..." : "Release"}
      </button>
      {error && (
        <p style={{ fontSize: "0.65rem", color: "#DC2626", marginTop: 3 }}>
          {error}
        </p>
      )}
    </div>
  );
}