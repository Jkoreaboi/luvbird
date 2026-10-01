import Image from "next/image";

const shots = [
  { src: "/screens/penpals.png", alt: "DearBird pen pals discovery screen", label: "Discover" },
  { src: "/screens/compose.png", alt: "DearBird letter writing screen", label: "Write" },
  { src: "/screens/open-letter.png", alt: "DearBird opened letter screen", label: "Receive" },
];

export function ProductPreview() {
  return (
    <section id="preview" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[.24em] text-coral">Product preview</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">A digital product designed to feel <span className="italic">less digital.</span></h2>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {shots.map((shot, i) => (
            <figure key={shot.src} className={`rounded-[30px] border border-ink/10 bg-envelope p-3 shadow-letter ${i === 1 ? "md:-translate-y-8" : ""}`}>
              <Image src={shot.src} alt={shot.alt} width={900} height={1700} className="w-full rounded-[23px] border border-ink/10" />
              <figcaption className="px-3 pb-1 pt-4 text-center text-sm font-semibold">{shot.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
