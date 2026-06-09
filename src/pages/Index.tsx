import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LiveLaunchSection from "@/components/LiveLaunchSection";
import MarqueeSection from "@/components/MarqueeSection";
import AboutSection from "@/components/AboutSection";
import KoreadsSection from "@/components/KoreadsSection";
import ComingSoonStrip from "@/components/ComingSoonStrip";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <LiveLaunchSection />
        <MarqueeSection />
        <KoreadsSection />
        <AboutSection />
        <ComingSoonStrip />
        {/* <CTASection /> */}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
