"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  gigId:       number;
  gigTitle:    string;
  price:       number;
  deliveryDays: number;
  buyerEmail:  string;
}

/**
 * BookingButton — the orange "Book this Gig" button on the gig detail page.
 *
 * When clicked it calls POST /api/orders which:
 *   1. Creates an Order row in the DB with status "pending"
 *   2. Calculates the deadline from deliveryDays
 *   3. Returns the new order ID
 *
 * On success it redirects the business to their dashboard where
 * the new hire will appear in the Active Hires table.
 */
export default function BookingButton({
  gigId,
  gigTitle,
  price,
  deliveryDays,
  buyerEmail,
}: Props) {
  const router  = useRouter();
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const handleBook = async () => {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gig_id:       gigId,
          buyer_email:  buyerEmail,
          delivery_days: deliveryDays,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Failed to place order");

      // Show a brief confirmation before redirecting
      setConfirmed(true);
      setTimeout(() => {
        router.push("/dashboards/business");
      }, 1500);

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div style={s.confirmedBox}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Order placed! Redirecting...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
      <button
        onClick={handleBook}
        disabled={loading}
        style={{
          ...s.bookBtn,
          ...(loading ? s.bookBtnLoading : {}),
        }}
      >
        {loading ? (
          <>
            <span style={s.spinner} />
            Placing order...
          </>
        ) : (
          `Book this Gig — ${price.toLocaleString()} RWF`
        )}
      </button>

      {error && (
        <p style={s.error}>{error}</p>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  bookBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    background: "#F97316", color: "white", border: "none",
    borderRadius: 10, padding: "13px",
    fontSize: "0.9rem", fontWeight: 700,
    cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
    boxShadow: "0 4px 14px rgba(249,115,22,0.28)",
    width: "100%",
  },
  bookBtnLoading: {
    opacity: 0.7, cursor: "not-allowed", boxShadow: "none",
  },
  confirmedBox: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    background: "#F0FDF4", border: "1px solid #BBF7D0",
    borderRadius: 10, padding: "13px",
    fontSize: "0.88rem", fontWeight: 700, color: "#16A34A",
  },
  spinner: {
    width: 15, height: 15,
    border: "2px solid rgba(255,255,255,0.35)",
    borderTopColor: "white", borderRadius: 999,
    animation: "spin 0.7s linear infinite", flexShrink: 0,
  },
  error: {
    fontSize: "0.78rem", color: "#DC2626",
    textAlign: "center" as const,
  },
};