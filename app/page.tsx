import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Problem } from "@/components/problem";
import { Features } from "@/components/features";
import { HowItWorks } from "@/components/how-it-works";
import { ProductPreview } from "@/components/product-preview";
import { PhysicalLetter } from "@/components/physical-letter";
import { FinalCta } from "@/components/final-cta";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Problem />
      <Features />
      <HowItWorks />
      <ProductPreview />
      <PhysicalLetter />
      <FinalCta />
      <Footer />
    </main>
  );
}
