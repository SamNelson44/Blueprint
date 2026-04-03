"use client";

import { useState } from "react";

interface Props {
  blueprintId: string;
  price: number;
}

export function CheckoutButton({ blueprintId, price }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blueprintId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className={[
          "w-full flex items-center justify-center gap-2 py-3.5",
          "font-mono font-bold text-sm uppercase tracking-widest",
          "bg-[#D4FF00] text-black border-2 border-black",
          "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
          "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
          "transition-[transform,box-shadow] duration-75",
          "disabled:opacity-50 disabled:pointer-events-none",
        ].join(" ")}
      >
        {loading ? "Redirecting…" : `Buy for $${Number(price).toFixed(2)} →`}
      </button>
      {error && (
        <p className="font-mono text-xs text-red-400 text-center">{error}</p>
      )}
    </div>
  );
}
