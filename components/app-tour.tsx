"use client";

import { useRef, useState } from "react";
import { PhoneFrame } from "@/components/phone-frame";

const steps = [
  {
    id: "pals",
    label: "Pen pals",
    title: "Find one person",
    body: "Look by country, language, and shared interests. A profile shows the city, never a precise location.",
    src: "/screens/penpals.png",
    alt: "DearBird pen pals screen with a profile for Emma in Seattle",
  },
  {
    id: "write",
    label: "Write",
    title: "Send a piece of your day",
    body: "Address one person. Add a photo and a few lines. A draft stays on the page until you send it.",
    src: "/screens/compose.png",
    alt: "DearBird compose screen with a letter addressed to Emma",
  },
  {
    id: "wait",
    label: "Mailbox",
    title: "Watch it travel",
    body: "The letter takes 24 hours. The mailbox shows who sent it, the city it left, and the time still left.",
    src: "/screens/in-flight.png",
    alt: "DearBird mailbox screen with a letter from Seoul that has 24 hours left",
  },
  {
    id: "open",
    label: "Open",
    title: "Read it when you are ready",
    body: "The letter arrives as something to keep. DearBird never sends a read receipt.",
    src: "/screens/open-letter.png",
    alt: "DearBird opened letter from Sunje, with no read receipt",
  },
] as const;

const places = [
  { name: "Pen pals", detail: "People, not a feed" },
  { name: "World map", detail: "Cities, not coordinates" },
  { name: "Mailbox", detail: "In transit and arrived" },
  { name: "Profile", detail: "Your story, your city" },
];

export function AppTour() {
  const [active, setActive] = useState<(typeof steps)[number]["id"]>("wait");
  const frame = useRef<HTMLDivElement>(null);
  const step = steps.find((item) => item.id === active) ?? steps[2];

  const choose = (id: (typeof steps)[number]["id"]) => {
    setActive(id);
    if (window.innerWidth >= 1024) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    frame.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
  };

  return (
    <section id="app" className="border-b border-ink/10 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <div className="max-w-2xl">
          <p className="eyebrow">Inside the app</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
            The same four moments you will use.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-ink/70">
            These are real DearBird screens. Tap a step and the phone follows.
          </p>
        </div>

        <div className="mt-12 grid items-start gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-20">
          <div className="order-2 lg:order-1">
            <div className="border-t border-ink/15" aria-label="App screens">
              {steps.map((item, index) => {
                const selected = item.id === active;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => choose(item.id)}
                    className={`grid w-full grid-cols-[auto_1fr] gap-x-4 border-b border-ink/15 py-6 text-left sm:gap-x-6 ${selected ? "bg-envelope/80" : ""}`}
                  >
                    <span className={`pt-1 text-xs font-bold tracking-[.18em] ${selected ? "text-coral" : "text-ink/40"}`}>
                      0{index + 1}
                    </span>
                    <span>
                      <span className="block text-xs font-bold uppercase tracking-[.18em] text-ink/45">{item.label}</span>
                      <span className="mt-1 block font-serif text-2xl sm:text-3xl">{item.title}</span>
                      <span className="mt-2 block max-w-lg leading-7 text-ink/65">{item.body}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div ref={frame} className="order-1 lg:sticky lg:top-28 lg:order-2">
            <PhoneFrame src={step.src} alt={step.alt} priority />
            <p className="mt-4 text-center text-xs font-semibold uppercase tracking-[.18em] text-ink/45">{step.label}</p>
          </div>
        </div>

        <dl className="mt-16 grid border-t border-ink/15 sm:grid-cols-2 lg:grid-cols-4">
          {places.map((place) => (
            <div key={place.name} className="border-b border-ink/15 py-5 lg:border-b-0 lg:py-6 lg:pr-6">
              <dt className="font-serif text-2xl">{place.name}</dt>
              <dd className="mt-1 text-sm text-ink/60">{place.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
