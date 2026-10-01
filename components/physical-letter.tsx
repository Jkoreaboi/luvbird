import { Mail, ArrowRight } from "lucide-react";

export function PhysicalLetter() {
  return (
    <section id="vision" className="px-5 pb-24 sm:pb-32 lg:px-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[34px] border border-ink/10 bg-envelope shadow-letter">
        <div className="grid lg:grid-cols-[1.05fr_.95fr]">
          <div className="p-8 sm:p-12 lg:p-16">
            <p className="text-sm uppercase tracking-[.24em] text-coral">A future chapter</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">From digital letters to <span className="italic">your mailbox.</span></h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink/65">DearBird begins on your phone. Our vision is to bring meaningful connections into a real mailbox one day, with a letter you can hold and keep.</p>
            <div className="mt-8 flex items-center gap-3 text-sm font-semibold"><Mail size={18} /> Digital letter <ArrowRight size={16} /> Physical memory</div>
          </div>
          <div className="relative min-h-[330px] bg-sky/70 p-8 sm:p-12">
            <div className="absolute inset-6 rotate-[-3deg] border border-coral/35 bg-paper p-8 shadow-letter">
              <div className="flex items-start justify-between">
                <span className="text-xs uppercase tracking-[.24em] text-coral">Air mail</span>
                <div className="grid h-16 w-14 place-items-center border-2 border-dashed border-coral/45 text-center text-[9px] uppercase tracking-wider text-coral">luvbird<br/>post</div>
              </div>
              <div className="mt-14 border-b border-ink/20 pb-2 font-serif text-2xl italic">Dear someone,</div>
              <p className="mt-4 max-w-sm font-serif text-lg leading-8 text-ink/75">Today the sky looked different, so I thought of sending a little piece of it to you.</p>
              <div className="mt-9 text-right font-serif italic">— from far away</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
