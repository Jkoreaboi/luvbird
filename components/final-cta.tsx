import Image from "next/image";
import { StoreButtons } from "@/components/store-buttons";

export function FinalCta() {
  return (
    <section id="cta" className="bg-coral px-5 py-20 text-paper sm:py-28 lg:px-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <Image src="/brand-mark.svg" alt="" width={84} height={84} className="h-[84px] w-[84px] rounded-[26px] bg-paper p-2" />
        <p className="mt-6 text-xs font-bold uppercase tracking-[.22em] text-paper/75">DearBird by Luvbird</p>
        <h2 className="mt-4 font-serif text-5xl leading-[1.05] sm:text-6xl">
          Someone, somewhere, might be writing to you.
        </h2>
        <p className="mt-5 max-w-md text-lg leading-8 text-paper/85">
          The app is preparing for the App Store and Google Play. No followers. No likes. Just one letter at a time.
        </p>
        <StoreButtons tone="paper" className="mt-8" />
      </div>
    </section>
  );
}
