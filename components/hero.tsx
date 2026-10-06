import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { PhoneFrame } from "@/components/phone-frame";
import { ScrollStamp } from "@/components/scroll-stamp";
import { StoreButtons } from "@/components/store-buttons";

export function Hero() {
  return (
    <section id="top" className="relative border-b border-ink/10">
      <div className="airmail-edge h-2" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-8 lg:px-10 lg:pb-20 lg:pt-14">
        <div>
          <div className="flex items-center gap-4">
            <Image src="/brand-mark.svg" alt="" width={72} height={72} className="h-[72px] w-[72px] rounded-[22px] border border-ink/10 bg-envelope p-1.5" priority />
            <div>
              <p className="font-serif text-2xl leading-none">DearBird</p>
              <p className="mt-1 text-sm text-ink/55">by Luvbird</p>
            </div>
          </div>
          <p className="eyebrow mt-8">Your little post office</p>
          <h1 className="mt-4 max-w-[14ch] font-serif text-[clamp(3.1rem,6vw,5.5rem)] leading-[1.02] tracking-[-.045em]">
            A letter, written for <span className="italic text-coral">you.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-ink/75">
            DearBird is Luvbird&apos;s first product: a letter for one person far away. Find them by country, language, interests, and what you hope to share. Then wait 24 hours for their day to arrive.
          </p>
          <StoreButtons className="mt-8" />
          <a href="#app" className="mt-8 inline-flex min-h-11 items-center gap-2 border-b border-ink/30 text-sm font-semibold hover:border-coral hover:text-coral">
            See the app <ArrowDown size={16} />
          </a>
        </div>

        <div className="relative mx-auto w-full max-w-[440px] pt-2 lg:mx-0 lg:ml-auto">
          <div className="absolute left-14 right-0 top-8 -z-10 h-[90%] -rotate-2 border border-ink/10 bg-sky/70" aria-hidden="true" />
          <PhoneFrame
            src="/screens/in-flight.png"
            alt="DearBird mailbox on a phone, with a letter from Seoul that still has 24 hours left"
            priority
            className="relative z-10 ml-auto w-[228px] sm:w-[270px]"
          />
          <ScrollStamp className="absolute left-0 top-14 z-20 origin-top-left scale-90 sm:left-1 sm:top-16 sm:scale-100" />
        </div>
      </div>
    </section>
  );
}
