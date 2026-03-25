"use client";

import { useState } from "react";
import { deliverOrder } from "./actions";

interface Props {
  orderId: number;
  studentEmail: string;
}

/**
 * DeliverButton — the orange "Deliver" button in the Active Orders table.
 *
 * This is a Client Component because it needs useState to show a loading
 * spinner while the Server Action runs. Everything else on the dashboard
 * stays a Server Component.
 *
 * When clicked:
 *   1. Shows "Delivering..." and disables the button to prevent double-clicks
 *   2. Calls the deliverOrder Server Action
 *   3. The Server Action updates the DB and calls revalidatePath, which
 *      causes Next.js to re-fetch the page data and remove this order
 *      from the Active Orders table automatically
 */
export default function DeliverButton({ orderId, studentEmail }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDeliver = async () => {
    // Guard against double-clicks — once the action starts,
    // the button is disabled until the page revalidates
    if (loading) return;
    setLoading(true);

    try {
      await deliverOrder(orderId, studentEmail);
      // No need to setLoading(false) here — the page will revalidate
      // and this component will unmount as the order disappears from the table
    } catch (err) {
      console.error("Failed to deliver order:", err);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDeliver}
      disabled={loading}
      style={{
        background: loading ? "#E7E5E4" : "#0C0A09",
        color: loading ? "#A8A29E" : "white",
        border: "none",
        borderRadius: 7,
        padding: "6px 14px",
        fontSize: "0.75rem",
        fontWeight: 700,
        cursor: loading ? "not-allowed" : "pointer",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        transition: "background 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {loading ? "Delivering..." : "Deliver"}
    </button>
  );
}