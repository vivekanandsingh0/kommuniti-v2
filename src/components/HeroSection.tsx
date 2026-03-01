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
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 w-full">
        <div className="mb-16 sm:mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-2 sm:space-y-3"
          >
            <div className="flex items-baseline gap-3 sm:gap-4 flex-wrap">
              <span className="font-pixel text-foreground/25 text-2xl sm:text-4xl">[</span>
              <h1 className="font-pixel text-xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                a Community
              </h1>
            </div>
            <div className="flex items-baseline gap-3 sm:gap-4 flex-wrap pl-4 sm:pl-8">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">of the PEOPLE</span>
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground/30">by the PEOPLE</span>
            </div>
            <div className="flex items-baseline gap-3 sm:gap-4 flex-wrap pl-4 sm:pl-8">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground/30">for the PEOPLE</span>
              <span className="font-pixel text-foreground/25 text-2xl sm:text-4xl">]</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8"
        >
          <div className="flex gap-3">
            <a href="#about" className="btn-pixel-primary">KONNECT</a>
            <a href="#vision" className="btn-pixel-outline">OUR VISION</a>
          </div>
        </motion.div>
      </div>

      {/* Giant title at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="relative z-10 mt-16 sm:mt-24 overflow-hidden"
      >
        <h2 className="font-pixel text-[40px] sm:text-[60px] md:text-[80px] lg:text-[110px] xl:text-[140px] text-foreground/[0.04] leading-none tracking-tight whitespace-nowrap text-center select-none">
          KOMMUNITI
        </h2>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent z-10" />
    </section>
  );
};

export default HeroSection;
