import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "DearBird by Luvbird — Bring back the feeling of waiting for a letter",
  description: "DearBird recreates the feeling of waiting for an old-fashioned letter for a new generation of global friendships.",
  keywords: ["pen pal", "global friendship", "letter", "language exchange", "DearBird", "luvbird"],
  openGraph: {
    title: "DearBird by Luvbird",
    description: "Bring back the feeling of waiting for a letter.",
    type: "website",
    images: [{ url: "/opengraph-image" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="font-sans antialiased">{children}</body></html>;
}
