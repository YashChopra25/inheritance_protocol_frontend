import { Demo } from "./components/Demo";
import { Faq } from "./components/Faq";
import { Features } from "./components/Features";
import { FinalCta } from "./components/FinalCta";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { Nav } from "./components/Nav";
import { Security } from "./components/Security";
import { UseCases } from "./components/UseCases";

export default function Home() {
  return (
    <main className="flex flex-col">
      <Nav />
      <Hero />
      <HowItWorks />
      <Demo />
      <Features />
      <Security />
      <UseCases />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  );
}
