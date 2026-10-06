const steps = [
  { n: "01", title: "Find", body: "Choose a pen pal by country, language, and what you both care about." },
  { n: "02", title: "Write", body: "Send a photo and a few lines meant for that one person." },
  { n: "03", title: "Wait", body: "The letter travels for 24 hours. Then it is theirs to open." },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-sky/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">How a letter moves</p>
            <h2 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">Three steps in the app.</h2>
          </div>
          <p className="max-w-sm text-lg leading-7 text-ink/65">Find, write, wait. That is the whole product.</p>
        </div>
        <ol className="mt-12 grid border-t border-ink/20 md:grid-cols-3">
          {steps.map((step) => (
            <li key={step.n} className="border-b border-ink/20 py-8 md:border-b-0 md:px-8 md:first:pl-0 md:last:pr-0">
              <p className="eyebrow">{step.n}</p>
              <h3 className="mt-4 font-serif text-4xl">{step.title}</h3>
              <p className="mt-3 max-w-xs leading-7 text-ink/65">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
