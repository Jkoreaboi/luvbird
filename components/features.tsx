import { Clock3, EyeOff, ImageIcon, MapPin } from "lucide-react";

const rules = [
  { number: "01", icon: Clock3, title: "24 hours, always", body: "A letter cannot arrive early. The wait is the point of the app." },
  { number: "02", icon: EyeOff, title: "No read receipts", body: "Nobody is told when you open a letter. Reply when you have something to say." },
  { number: "03", icon: MapPin, title: "City, not a pin", body: "Profiles and the world map stay at city level. Precise location never ships." },
  { number: "04", icon: ImageIcon, title: "One person, one letter", body: "A photo and words go to one pen pal. There is no feed, no followers, and no likes." },
];

export function Features() {
  return (
    <section id="rules" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
          <div>
            <p className="eyebrow">The rules</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
              What the app <span className="italic text-coral">will not</span> do.
            </h2>
            <p className="mt-5 max-w-sm text-lg leading-8 text-ink/65">
              These limits are the product. They stay in place when DearBird launches.
            </p>
          </div>
          <div className="border-t border-ink/20">
            {rules.map(({ number, icon: Icon, title, body }) => (
              <article key={title} className="grid grid-cols-[36px_1fr_28px] gap-3 border-b border-ink/20 py-6 sm:grid-cols-[52px_1fr_36px] sm:py-7">
                <span className="pt-1 text-xs font-bold tracking-[.2em] text-coral">{number}</span>
                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl">{title}</h3>
                  <p className="mt-2 max-w-lg leading-7 text-ink/65">{body}</p>
                </div>
                <Icon className="mt-1 text-coral" size={22} strokeWidth={1.5} aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
