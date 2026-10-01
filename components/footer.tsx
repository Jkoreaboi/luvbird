import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-ink/15 bg-envelope py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:flex-row sm:items-end sm:justify-between lg:px-10">
        <div><a href="#top" className="inline-flex items-center gap-2"><Image src="/brand-mark.svg" alt="" width={32} height={32} /><span className="font-serif text-xl font-bold">DearBird</span></a><p className="mt-3 text-sm text-ink/55">DearBird by Luvbird. One letter at a time.</p></div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium"><a href="#vision" className="hover:text-coral">About</a><span className="text-ink/45">Privacy</span><span className="text-ink/45">Terms</span><span className="text-ink/45">Contact</span></nav>
      </div>
    </footer>
  );
}
