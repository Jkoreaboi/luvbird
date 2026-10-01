import { Clock3, EyeOff, Images, MapPin } from "lucide-react";

const features = [
  { number: "01", icon: Clock3, title: "24-hour journey", body: "A letter takes its time crossing the world. The anticipation becomes part of your story." },
  { number: "02", icon: EyeOff, title: "No read receipts", body: "No pressure to answer instantly. Open a letter and reply when you have something to say." },
  { number: "03", icon: MapPin, title: "City-level profiles", body: "Get a sense of where someone calls home while keeping their precise location private." },
  { number: "04", icon: Images, title: "Photos + letters", body: "Share the ordinary details of your day with a photo and words meant for one person." },
];

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="eyebrow">What makes it different</p>
            <h2 className="mt-5 max-w-md font-serif text-4xl leading-tight tracking-tight sm:text-5xl">DearBird brings <span className="italic text-coral">waiting</span> back.</h2>
            <p className="mt-6 max-w-sm text-lg leading-8 text-ink/65">A quieter rhythm for getting to know someone. Write, send, wait, receive, remember.</p>
          </div>
          <div className="border-t border-ink/20">
            {features.map(({ number, icon: Icon, title, body }) => (
              <article key={title} className="grid grid-cols-[36px_1fr_32px] gap-3 border-b border-ink/20 py-6 sm:grid-cols-[52px_1fr_40px] sm:gap-5 sm:py-8">
                <span className="pt-1 text-xs font-bold tracking-[.2em] text-coral">{number}</span>
                <div><h3 className="font-serif text-2xl sm:text-3xl">{title}</h3><p className="mt-2 max-w-lg leading-7 text-ink/65">{body}</p></div>
                <Icon className="mt-1 text-coral" size={24} strokeWidth={1.5} aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
