import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import "./globals.css";

const sans = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const description = "DearBird is the Luvbird app for slow letters. Find someone abroad, write about your day, and wait 24 hours.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "DearBird by Luvbird — A letter, written for you",
  description,
  applicationName: "DearBird",
  keywords: ["pen pal", "DearBird", "Luvbird", "letter app", "language exchange"],
  openGraph: {
    title: "DearBird by Luvbird",
    description: "A letter, written for you. The app for waiting.",
    type: "website",
    images: [{ url: "/opengraph-image" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
