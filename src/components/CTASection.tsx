import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { LIVE_LAUNCH_LINKS } from "@/config/comingSoonPages";

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

const CTASection = () => {
  return (
    <section id="cta" className="relative py-32 sm:py-40 px-4 pixel-grid-hero overflow-hidden">
      <div className="absolute top-16 left-[12%] w-5 h-5 bg-accent/20 rotate-45 animate-float-pixel" />
      <div className="absolute bottom-20 right-[18%] w-4 h-4 bg-primary/30 rounded-full animate-float-pixel-slow" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <FadeIn>
          <p className="font-pixel text-[8px] text-[#4CAF50] tracking-[0.4em] mb-8">PHASE 1 IS LIVE</p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
            Pick your entry point
          </h2>
          <p className="text-foreground/45 mb-12 max-w-lg leading-relaxed">
            Konnect, KO Reads, About, and Volunteer are ready. Choose one and start — the rest of Kommuniti is coming soon.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="grid sm:grid-cols-2 gap-3 mb-10">
            {LIVE_LAUNCH_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center gap-3 border border-white/10 hover:border-white/25 px-5 py-4 no-underline transition-colors group"
                style={{ borderLeftWidth: 3, borderLeftColor: link.color }}
              >
                <span className="text-2xl">{link.icon}</span>
                <div>
                  <div className="font-bold text-foreground group-hover:text-white transition-colors">{link.label}</div>
                  <div className="text-[10px] uppercase tracking-[2px] text-[#4CAF50]">Live now</div>
                </div>
              </Link>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <Link to="/volunteer" className="btn-pixel-primary inline-block">
            Join as volunteer
          </Link>
        </FadeIn>
      </div>

      <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
        <p className="font-pixel text-[60px] sm:text-[100px] md:text-[140px] text-foreground/[0.02] leading-none whitespace-nowrap text-center select-none">
          KOMMUNITI
        </p>
      </div>
    </section>
  );
};

export default CTASection;
