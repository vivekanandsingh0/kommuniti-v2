import { motion } from "framer-motion";
import PixelPeopleBackground from "./PixelPeopleBackground";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20">
      {/* Pixel people canvas background */}
      <PixelPeopleBackground />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 pixel-grid-hero pointer-events-none z-[1]" />

      {/* Floating pixel shapes */}
      <div className="absolute top-24 left-[8%] w-6 h-6 bg-primary/40 rotate-12 animate-float-pixel z-[2]" />
      <div className="absolute top-[35%] right-[12%] w-5 h-5 rounded-full bg-accent/30 animate-float-pixel-slow z-[2]" />
      <div className="absolute bottom-[30%] left-[18%] w-4 h-4 bg-foreground/15 rotate-45 animate-float-pixel z-[2]" />
      <div className="absolute top-[55%] left-[55%] w-3 h-3 bg-primary/30 rounded-full animate-float-pixel-slow z-[2]" />
      <div className="absolute bottom-24 right-[22%] w-5 h-5 bg-accent/20 rotate-12 animate-float-pixel z-[2]" />

      {/* Main content */}
      {/* Centered hero text block */}
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
          <a href="#vision" className="btn-pixel-outline">OUR VISION</a>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent z-10" />
    </section>
  );
};

export default HeroSection;
