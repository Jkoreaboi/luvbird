"use client";

import { useEffect, useRef } from "react";

export function ScrollStamp({ className = "" }: { className?: string }) {
  const stamp = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = stamp.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        element.style.transform = `translate3d(0, ${Math.min(window.scrollY * 0.08, 36)}px, 0)`;
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => { window.removeEventListener("scroll", update); cancelAnimationFrame(frame); };
  }, []);
  return <div ref={stamp} className={`pointer-events-none ${className}`} aria-hidden="true"><div className="stamp-edge flex h-28 w-24 rotate-[-11deg] flex-col items-center justify-center bg-coral text-center text-paper shadow-lg"><span className="font-serif text-3xl italic">24h</span><span className="mt-1 text-[9px] font-bold uppercase tracking-[.14em]">Worth the wait</span></div></div>;
}
