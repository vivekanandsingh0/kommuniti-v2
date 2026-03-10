import { motion } from "framer-motion";
import PixelPeopleBackground from "./PixelPeopleBackground";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20">
      {/* Full-width pixel village background */}
      <PixelPeopleBackground />

      {/* Atmospheric overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/60 z-[1]" />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, hsl(0 0% 9% / 0.5) 100%)",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-12 sm:mb-16"
        >
          <h1 className="font-pixel text-[28px] sm:text-[44px] md:text-[60px] lg:text-[80px] xl:text-[96px] text-primary leading-[1.15] tracking-tight drop-shadow-[0_0_40px_hsl(var(--primary)/0.3)]">
            A COMMUNITY,
            <br />
            OF THE PEOPLE
            <br />
            <span className="text-accent">FOR THE PEOPLE</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex gap-4"
        >
          <a href="#about" className="btn-pixel-primary">KONNECT</a>
          <a href="#programs" className="btn-pixel-outline">OUR VISION</a>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent z-10" />
    </section>
  );
};

export default HeroSection;
