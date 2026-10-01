const items = ["Instant messages", "Read receipts", "Endless feeds", "Disposable conversations"];

export function Problem() {
  return (
    <section id="story" className="bg-ink py-24 text-paper sm:py-32">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <p className="text-sm uppercase tracking-[.24em] text-paper/55">The problem</p>
        <div className="mt-5 grid gap-12 lg:grid-cols-2 lg:items-end">
          <h2 className="font-serif text-4xl leading-tight sm:text-5xl">We talk more than ever. <span className="italic text-[#E6A18D]">But we rarely wait for someone anymore.</span></h2>
          <div>
            <p className="text-lg leading-8 text-paper/70">Everything became instant. The efficiency is useful, but the small anticipation of opening a letter from far away almost disappeared.</p>
            <div className="mt-7 flex flex-wrap gap-2">
              {items.map((item) => <span key={item} className="rounded-full border border-paper/15 px-4 py-2 text-sm text-paper/75">{item}</span>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
