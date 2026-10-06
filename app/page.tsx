import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Problem } from "@/components/problem";
import { AppTour } from "@/components/app-tour";
import { HowItWorks } from "@/components/how-it-works";
import { Features } from "@/components/features";
import { PhysicalLetter } from "@/components/physical-letter";
import { FinalCta } from "@/components/final-cta";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Problem />
      <AppTour />
      <HowItWorks />
      <Features />
      <PhysicalLetter />
      <FinalCta />
      <Footer />
    </main>
  );
}
