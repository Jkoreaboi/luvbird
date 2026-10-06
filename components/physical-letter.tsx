import { Mail } from "lucide-react";

export function PhysicalLetter() {
  return (
    <section id="vision" className="px-5 pb-20 sm:pb-28 lg:px-10">
      <div className="mx-auto grid max-w-7xl overflow-hidden border border-ink/10 bg-envelope lg:grid-cols-[1.05fr_.95fr]">
        <div className="p-8 sm:p-12 lg:p-16">
          <p className="eyebrow">A future chapter</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            From the app to a <span className="italic">real mailbox.</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-ink/65">
            DearBird launches as a phone app. Later, the same letters may leave the screen and arrive as paper you can keep. That part is not available yet.
          </p>
          <p className="mt-8 flex items-center gap-3 text-sm font-semibold">
            <Mail size={18} aria-hidden="true" /> Digital letter now. Paper, someday.
          </p>
        </div>
        <div className="relative min-h-[320px] bg-sky/70 p-8 sm:p-12">
          <div className="absolute inset-6 -rotate-2 border border-coral/30 bg-paper p-8 shadow-letter sm:inset-10">
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold uppercase tracking-[.22em] text-coral">Air mail</span>
              <div className="grid h-16 w-14 place-items-center border-2 border-dashed border-coral/50 text-center text-[9px] font-bold uppercase leading-4 tracking-wider text-coral">
                luvbird<br />post
              </div>
            </div>
            <p className="mt-12 border-b border-ink/15 pb-2 font-serif text-2xl italic">Dear someone,</p>
            <p className="mt-4 max-w-sm font-serif text-lg leading-8 text-ink/75">
              Today the sky looked different, so I thought of sending a little piece of it to you.
            </p>
            <p className="mt-8 text-right font-serif italic">— from far away</p>
          </div>
        </div>
      </div>
    </section>
  );
}
