import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const CTASection = () => {
  return (
    <section id="cta" className="relative py-32 sm:py-40 px-4 pixel-grid-hero overflow-hidden">
      {/* Floating elements */}
      <div className="absolute top-16 left-[12%] w-5 h-5 bg-accent/20 rotate-45 animate-float-pixel" />
      <div className="absolute bottom-20 right-[18%] w-4 h-4 bg-primary/30 rounded-full animate-float-pixel-slow" />
      <div className="absolute top-[40%] right-[8%] w-3 h-3 bg-foreground/10 animate-float-pixel" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <FadeIn>
          <p className="font-pixel text-[8px] text-foreground/30 tracking-[0.4em] mb-8">
            ITS TIME FOR
          </p>
        </FadeIn>

        {/* Bracket headline */}
        <FadeIn delay={0.1}>
          <div className="space-y-2 mb-10">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-pixel text-foreground/20 text-xl sm:text-3xl">[</span>
              <span className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground">Begin Your</span>
            </div>
            <div className="flex items-baseline gap-3 flex-wrap pl-4">
              <span className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground/30">Journey</span>
              <span className="font-pixel text-foreground/20 text-xl sm:text-3xl">]</span>
            </div>
          </div>
        </FadeIn>

        {/* Mission statements */}
        <FadeIn delay={0.2}>
          <div className="space-y-3 text-foreground/40 mb-12 max-w-xl text-sm leading-relaxed">
            <p>To travel to meet new cultures, practices and innovations</p>
            <p>To give education a new perspective to solve real problems</p>
            <p>To create a greater equity in world economic order</p>
            <p>To preserve individual identities for world unity</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="font-pixel text-[8px] sm:text-[9px] text-accent/70 tracking-[0.3em] mb-4">
            WE HAVE A DUTY TO UNITE — WHATEVER OUR DIFFERENCES
          </p>
        </FadeIn>

        <FadeIn delay={0.35}>
          <p className="font-pixel text-[10px] sm:text-xs text-primary tracking-[0.4em] mb-10">
            KOMMUTE · KONNECT · KREATE
          </p>
        </FadeIn>

        <FadeIn delay={0.4}>
          <a href="#about" className="btn-pixel-primary inline-block">
            JOIN KOMMUNITI
          </a>
        </FadeIn>
      </div>

      {/* Giant watermark */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
        <p className="font-pixel text-[60px] sm:text-[100px] md:text-[140px] text-foreground/[0.02] leading-none whitespace-nowrap text-center select-none">
          KOMMUNITI
        </p>
      </div>
    </section>
  );
};

export default CTASection;
