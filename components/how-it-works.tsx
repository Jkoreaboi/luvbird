import { ArrowRight, PenLine, Search } from "lucide-react";

export function HowItWorks() {
  return (
    <section id="how" className="border-y border-ink/10 bg-sky/45 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><p className="eyebrow">How it works</p><h2 className="mt-5 font-serif text-4xl tracking-tight sm:text-5xl">Three small moments.</h2></div>
          <p className="max-w-md text-lg leading-7 text-ink/65">Every letter begins with a person, a little courage, and a reason to look forward to tomorrow.</p>
        </div>
        <div className="mt-14 grid gap-4 lg:grid-cols-[.75fr_.75fr_1.5fr]">
          <article className="flex min-h-[340px] flex-col border border-ink/15 bg-envelope p-7">
            <div className="flex items-start justify-between"><span className="eyebrow">01 / Find</span><Search size={26} strokeWidth={1.4} aria-hidden="true" /></div>
            <div className="mt-auto"><h3 className="font-serif text-4xl">Find</h3><p className="mt-3 leading-7 text-ink/65">Discover someone by country, language and interests.</p></div>
          </article>
          <article className="flex min-h-[340px] flex-col border border-ink/15 bg-envelope p-7">
            <div className="flex items-start justify-between"><span className="eyebrow">02 / Write</span><PenLine size={26} strokeWidth={1.4} aria-hidden="true" /></div>
            <div className="mt-auto"><h3 className="font-serif text-4xl">Write</h3><p className="mt-3 leading-7 text-ink/65">Share a photo and a little piece of your day.</p></div>
          </article>
          <article className="relative flex min-h-[440px] flex-col overflow-hidden bg-ink p-7 text-paper sm:p-9 lg:min-h-[340px]">
            <div className="airmail-edge absolute inset-x-0 top-0 h-2" aria-hidden="true" />
            <div className="flex items-start justify-between"><span className="text-xs font-bold uppercase tracking-[.22em] text-[#E6A18D]">03 / Wait</span><span className="text-xs font-bold uppercase tracking-[.2em] text-paper/50">In transit · 24h</span></div>
            <div className="relative mx-auto mt-10 h-28 w-full max-w-sm" aria-hidden="true">
              <div className="absolute left-2 right-2 top-1/2 border-t border-dashed border-paper/45" />
              <span className="absolute left-0 top-1/2 -translate-y-1/2 bg-ink pr-2 text-xs">Seoul</span>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-12deg] border border-paper/30 bg-[#F7F5EE] px-6 py-4 text-ink shadow-lg"><span className="font-serif text-3xl">✉</span></div>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 bg-ink pl-2 text-xs">Somewhere</span>
            </div>
            <div className="mt-auto"><h3 className="font-serif text-5xl italic">Wait.</h3><p className="mt-3 max-w-sm text-lg leading-7 text-paper/75">Your letter travels. Someone's story eventually arrives.</p><p className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-[#E6A18D]">The best part takes time <ArrowRight size={15} /></p></div>
          </article>
        </div>
      </div>
    </section>
  );
}
