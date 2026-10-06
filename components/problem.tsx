export function Problem() {
  return (
    <section id="story" className="bg-ink py-16 text-paper sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[1.1fr_.9fr] lg:items-end lg:px-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.22em] text-paper/50">Why an app like this</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            We talk more than ever. <span className="italic text-[#E6A18D]">We rarely wait for anyone.</span>
          </h2>
        </div>
        <div>
          <p className="text-lg leading-8 text-paper/75">
            Fast chat asks for an answer at once. DearBird is a letter. The day it spends traveling brings back the feeling of waiting for someone.
          </p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[.16em] text-paper/50">
            Instant messages · Read receipts · Endless feeds · Disposable conversations
          </p>
        </div>
      </div>
    </section>
  );
}
