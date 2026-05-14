import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { AIShowcase } from "@/components/landing/AIShowcase";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/layout/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--voon-bg)]">
      <LandingNav />
      <Hero />
      <section id="features"><Features /></section>
      <section id="ai"><AIShowcase /></section>
      <HowItWorks />
      <section id="pricing"><Pricing /></section>
      <CTA />
      <Footer />
    </main>
  );
}
