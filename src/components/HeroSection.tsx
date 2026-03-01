import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pixel-grid-hero overflow-hidden pt-20">
      {/* Floating pixel shapes */}
      <div className="absolute top-24 left-[8%] w-6 h-6 bg-primary/60 rotate-12 animate-float-pixel" />
      <div className="absolute top-[35%] right-[12%] w-5 h-5 rounded-full bg-accent/40 animate-float-pixel-slow" />
      <div className="absolute bottom-[30%] left-[18%] w-4 h-4 bg-foreground/20 rotate-45 animate-float-pixel" />
      <div className="absolute top-[55%] left-[55%] w-3 h-3 bg-primary/40 rounded-full animate-float-pixel-slow" />
      <div className="absolute bottom-24 right-[22%] w-5 h-5 bg-accent/30 rotate-12 animate-float-pixel" />
      <div className="absolute top-[40%] left-[35%] w-2 h-2 bg-primary/50 animate-float-pixel-slow" />
      <div className="absolute bottom-[45%] right-[40%] w-3 h-3 bg-foreground/10 rotate-45 animate-float-pixel" />

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 w-full">
        <div className="mb-16 sm:mb-24">
          {/* Bracket text lines - like the reference */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-2 sm:space-y-3"
          >
            <div className="flex items-baseline gap-3 sm:gap-4 flex-wrap">
              <span className="font-pixel text-foreground/25 text-2xl sm:text-4xl">[</span>
              <h1 className="font-pixel text-xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight">
                a Community
              </h1>
            </div>
            <div className="flex items-baseline gap-3 sm:gap-4 flex-wrap pl-4 sm:pl-8">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">of the PEOPLE</span>
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground/30">by the PEOPLE</span>
            </div>
            <div className="flex items-baseline gap-3 sm:gap-4 flex-wrap pl-4 sm:pl-8">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground/30">for the PEOPLE</span>
              <span className="font-pixel text-foreground/25 text-2xl sm:text-4xl">]</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8"
        >
          {/* CTA Buttons */}
          <div className="flex gap-3">
            <a href="#about" className="btn-pixel-primary">KONNECT</a>
            <a href="#vision" className="btn-pixel-outline">OUR VISION</a>
          </div>
        </motion.div>
      </div>

      {/* Giant title at bottom - like "DRONEFALL" in reference */}
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

      {/* Pixel progress bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </section>
  );
};

export default HeroSection;
