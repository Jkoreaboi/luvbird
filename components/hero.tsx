import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollStamp } from "@/components/scroll-stamp";

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden border-b border-ink/15">
      <div className="airmail-edge absolute inset-x-0 top-0 h-2" aria-hidden="true" />
      <div className="mx-auto grid min-h-[760px] max-w-7xl items-center gap-12 px-5 pb-20 pt-24 lg:grid-cols-[1.08fr_.92fr] lg:gap-20 lg:px-10 lg:pb-24 lg:pt-28">
        <div className="relative z-10">
          <p className="mb-7 flex items-center gap-3 text-xs font-bold uppercase tracking-[.22em] text-coral"><span className="h-px w-8 bg-coral" /> A slower kind of connection</p>
          <h1 className="max-w-[740px] font-serif text-[clamp(3.4rem,6.2vw,6.5rem)] leading-[1.04] tracking-[-.055em]">
            Bring back the feeling of <span className="italic text-coral">waiting</span> for a letter.
          </h1>
          <p className="mt-8 max-w-lg text-lg leading-8 text-ink/75 sm:text-xl">
            Meet someone from another corner of the world. Write about your day. Then wait for their story to arrive.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="lg"><a href="#cta">Start your first letter <ArrowUpRight className="ml-2" size={18} /></a></Button>
            <a href="#how" className="inline-flex min-h-12 items-center gap-2 border-b border-ink/40 text-sm font-semibold transition-colors hover:border-coral hover:text-coral">See how it works <ArrowDown size={16} /></a>
          </div>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[.16em] text-ink/45">No followers <span className="mx-2">·</span> No likes <span className="mx-2">·</span> No read receipts</p>
        </div>

        <div className="relative mx-auto w-full max-w-[490px] pl-5 pr-3 pt-5 sm:pl-10 sm:pr-8">
          <div className="absolute -left-4 top-0 -z-10 h-[95%] w-[95%] rotate-[-5deg] border border-ink/15 bg-[#E8EAE2]" aria-hidden="true" />
          <div className="relative border border-ink/15 bg-envelope p-3 shadow-letter sm:p-4">
            <div className="flex items-center justify-between border-b border-ink/15 px-2 pb-3 text-[10px] font-bold uppercase tracking-[.22em] text-ink/60 sm:text-xs">
              <span>Seoul, South Korea</span><span>Air mail / 001</span>
            </div>
            <div className="relative overflow-hidden bg-paper">
              <Image src="/screens/in-flight.png" alt="Actual DearBird app screen showing a letter on its 24-hour journey" width={780} height={1688} sizes="(max-width: 1024px) 75vw, 420px" className="h-[390px] w-full object-cover object-top sm:h-[500px]" priority />
            </div>
            <div className="flex items-center justify-between border-t border-ink/15 px-2 pt-3 text-[10px] font-bold uppercase tracking-[.18em] text-ink/60 sm:text-xs"><span>Somewhere far away</span><span>Arriving in 24h</span></div>
          </div>
          <ScrollStamp className="absolute -bottom-10 -left-2 sm:-left-8" />
          <div className="absolute -right-1 top-0 flex h-24 w-24 rotate-12 items-center justify-center rounded-full border-2 border-coral/55 text-center text-[10px] font-bold uppercase leading-5 tracking-[.14em] text-coral sm:-right-7 sm:h-28 sm:w-28" aria-hidden="true">Postmarked<br />with care<br />DearBird</div>
        </div>
      </div>
      <div className="mx-auto hidden max-w-7xl justify-between border-t border-ink/10 px-10 py-5 text-[10px] font-semibold uppercase tracking-[.2em] text-ink/50 lg:flex"><span>For stories worth waiting for</span><span>Scroll to discover ↓</span></div>
    </section>
  );
}
