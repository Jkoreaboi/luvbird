"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  const [sent, setSent] = useState(false);
  return (
    <section id="cta" className="bg-coral px-5 py-24 text-paper sm:py-32 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm uppercase tracking-[.26em] text-paper/70">DearBird by Luvbird</p>
        <h2 className="mt-5 font-serif text-5xl leading-[1.05] sm:text-6xl">Someone, somewhere,<br />might be writing to you.</h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-paper/80">No followers. No likes. Just people and their stories.</p>
        <div className="mt-9">
          <Button size="lg" className="bg-paper text-ink hover:bg-paper/90" onClick={() => setSent(true)}>{sent ? "Coming soon" : "Start a letter"}</Button>
        </div>
        {sent && <p className="mt-4 text-sm text-paper/80" role="status">DearBird is preparing for launch. Explore the real app screens above while we get ready.</p>}
      </div>
    </section>
  );
}
