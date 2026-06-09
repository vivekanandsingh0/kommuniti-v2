import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Info, HeartHandshake } from "lucide-react";

const FadeIn = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
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

const AboutSection = () => {
  return (
    <section id="about" className="section-padding pixel-grid-bg border-b border-border">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-3 h-3 bg-primary animate-pulse-glow" />
                <h2 className="font-pixel text-sm sm:text-base md:text-lg text-foreground">WHY KOMMUNITI?</h2>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-light text-foreground/70 leading-relaxed max-w-4xl">
                Kommuniti envisions to be a decentralised, international and non-partisan commune where mankind
                can function as one while expressing their individual uniqueness.
              </p>
            </div>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[2px] font-bold text-[#C9A84C] border border-[#C9A84C]/30 px-4 py-2 hover:bg-[#C9A84C]/10 no-underline shrink-0"
            >
              Read our story <ArrowRight size={12} />
            </Link>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              to="/about"
              className="group border border-border hover:border-[#C9A84C]/40 p-8 transition-all no-underline"
            >
              <span className="text-[9px] uppercase tracking-[2px] text-[#4CAF50] font-bold">Live</span>
              <h3 className="text-2xl font-bold text-foreground mt-2 mb-3 group-hover:text-[#C9A84C] transition-colors flex items-center gap-2.5">
                <Info className="w-6 h-6 text-[#C9A84C] opacity-80" /> About Kommuniti
              </h3>
              <p className="text-foreground/50 text-sm leading-relaxed">
                Mission, pillars, community voices, and the story behind neighbourhood-first action.
              </p>
            </Link>
            <Link
              to="/volunteer"
              className="group border border-border hover:border-[#C9A84C]/40 p-8 transition-all no-underline"
            >
              <span className="text-[9px] uppercase tracking-[2px] text-[#4CAF50] font-bold">Live</span>
              <h3 className="text-2xl font-bold text-foreground mt-2 mb-3 group-hover:text-[#C9A84C] transition-colors flex items-center gap-2.5">
                <HeartHandshake className="w-6 h-6 text-[#C9A84C] opacity-80" /> Volunteer
              </h3>
              <p className="text-foreground/50 text-sm leading-relaxed">
                Benefits, open roles, and apply to help build Kores — your time shapes real community.
              </p>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default AboutSection;
