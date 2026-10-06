"use client";

import { Smartphone } from "lucide-react";
import { useState } from "react";

const stores = [
  { id: "app-store", label: "the App Store" },
  { id: "google-play", label: "Google Play" },
] as const;

export function StoreButtons({ className = "", tone = "ink" }: { className?: string; tone?: "ink" | "paper" }) {
  const [open, setOpen] = useState(false);
  const onPaper = tone === "paper";

  return (
    <div className={className}>
      <div className={`flex flex-wrap gap-3 ${onPaper ? "justify-center" : ""}`}>
        {stores.map((store) => (
          <button
            key={store.id}
            type="button"
            onClick={() => setOpen(true)}
            className={`inline-flex min-h-14 items-center gap-3 rounded-2xl px-4 py-2 text-left transition-colors ${onPaper ? "bg-paper text-ink hover:bg-paper/90" : "bg-ink text-paper hover:bg-ink/90"}`}
          >
            <Smartphone size={18} aria-hidden="true" />
            <span>
              <span className={`block text-[10px] font-semibold uppercase tracking-[.16em] ${onPaper ? "text-ink/50" : "text-paper/60"}`}>Coming soon on</span>
              <span className="block text-sm font-semibold leading-5">{store.label}</span>
            </span>
          </button>
        ))}
      </div>
      <p className={`mt-4 max-w-md text-sm leading-6 ${onPaper ? "mx-auto text-paper/85" : "text-ink/55"}`}>
        DearBird is not in the stores yet. This page does not create an account or send a letter.
      </p>
      {open && (
        <p className={`mt-3 max-w-md text-sm leading-6 ${onPaper ? "mx-auto text-paper" : "text-ink"}`} role="status">
          We will list DearBird on the App Store and Google Play when the app launches.
        </p>
      )}
    </div>
  );
}
