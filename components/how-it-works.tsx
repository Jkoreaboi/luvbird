const steps = [
  { n: "01", title: "Find", body: "Choose someone by country, language, interests, and the exchange you want." },
  { n: "02", title: "Write", body: "Send a photo and a piece of your day, meant for that one person." },
  { n: "03", title: "Wait", body: "The letter travels for about 24 hours. That wait is part of the letter." },
  { n: "04", title: "Reply", body: "They open it when they are ready, and answer at their own pace." },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-sky/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">How a letter moves</p>
            <h2 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">Four moments, in order.</h2>
          </div>
          <p className="max-w-sm text-lg leading-7 text-ink/65">Find, write, wait, reply. That is the whole product.</p>
        </div>
        <ol className="mt-12 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li key={step.n} className="border-t border-ink/20 py-8">
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
