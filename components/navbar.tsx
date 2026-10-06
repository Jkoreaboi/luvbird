"use client";

import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#app", label: "The app" },
  { href: "#how", label: "How it works" },
  { href: "#rules", label: "The rules" },
  { href: "#vision", label: "Later" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-10">
        <a href="#top" className="flex items-center gap-2" aria-label="DearBird, back to top" onClick={() => setOpen(false)}>
          <Image src="/brand-mark.svg" alt="" width={36} height={36} priority />
          <span className="font-serif text-xl font-bold tracking-tight">DearBird</span>
          <span className="hidden border-l border-ink/20 pl-2 text-[10px] font-semibold uppercase tracking-[.16em] text-ink/50 sm:inline">App by Luvbird</span>
        </a>
        <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-coral">{link.label}</a>
          ))}
          <Button asChild><a href="#cta">Get the app</a></Button>
        </nav>
        <button
          type="button"
          className="rounded-sm p-2 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-controls="mobile-menu"
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <nav id="mobile-menu" className="border-t border-ink/10 bg-paper px-5 py-4 md:hidden" aria-label="Mobile navigation">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="py-3 text-base font-medium">{link.label}</a>
            ))}
            <Button asChild className="mt-2"><a href="#cta" onClick={() => setOpen(false)}>Get the app</a></Button>
          </div>
        </nav>
      )}
    </header>
  );
}
