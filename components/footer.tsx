import Image from "next/image";

const links = [
  { href: "#app", label: "The app" },
  { href: "#how", label: "How it works" },
  { href: "#vision", label: "Later" },
];

export function Footer() {
  return (
    <footer className="border-t border-ink/15 bg-envelope py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:flex-row sm:items-end sm:justify-between lg:px-10">
        <div>
          <a href="#top" className="inline-flex items-center gap-2">
            <Image src="/brand-mark.svg" alt="" width={32} height={32} />
            <span className="font-serif text-xl font-bold">DearBird</span>
          </a>
          <p className="mt-3 max-w-xs text-sm leading-6 text-ink/55">The DearBird app by Luvbird. One letter at a time.</p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-coral">{link.label}</a>
          ))}
          <span className="text-ink/40">Privacy</span>
          <span className="text-ink/40">Terms</span>
          <span className="text-ink/40">Contact</span>
        </nav>
      </div>
    </footer>
  );
}
