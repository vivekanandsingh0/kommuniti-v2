import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
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
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const LiveLaunchSection = () => {
  const entryPoints = LIVE_LAUNCH_LINKS.filter((item) => item.label !== "About");

  return (
    <section id="live" className="py-16 lg:py-24 bg-[#0B1828] border-b border-[rgba(201,168,76,0.12)]">
      <div className="container mx-auto px-6 lg:px-12">
        <FadeIn>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#4CAF50]/15 border border-[#4CAF50]/40 text-[#4CAF50] px-3 py-1 text-[10px] uppercase tracking-[2px] font-bold mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] animate-pulse" />
                Core Experiences · Active now
              </div>
              <h2
                className="text-3xl sm:text-4xl font-extrabold text-[#F0E8D5]"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Pick your entry point
              </h2>
              <p className="text-[rgba(240,232,213,0.5)] mt-3 max-w-xl leading-relaxed">
                These three core entry points are ready today. Choose a pathway to start learning, reading, or volunteering — the rest of Kommuniti is coming soon.
              </p>
            </div>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {entryPoints.map((item, i) => (
            <FadeIn key={item.href} delay={0.08 * i}>
              <Link
                to={item.href}
                className="group flex flex-col justify-between h-full border border-white/10 hover:border-[rgba(201,168,76,0.35)] bg-[rgba(240,232,213,0.02)] p-6 transition-all no-underline"
                style={{ borderTopWidth: 3, borderTopColor: item.color }}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-4">
                    {(() => {
                      const LaunchIcon = item.icon;
                      return <LaunchIcon size={30} style={{ color: item.color }} />;
                    })()}
                    <span className="text-[9px] uppercase tracking-[2px] font-bold text-[#4CAF50] bg-[#4CAF50]/10 border border-[#4CAF50]/30 px-2 py-0.5 shrink-0">
                      Live
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-[#F0E8D5] mb-1 group-hover:text-white transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-[10px] uppercase tracking-[2px] mb-3" style={{ color: item.color }}>
                    {item.subtitle}
                  </p>
                  <p className="text-sm text-[rgba(240,232,213,0.5)] leading-relaxed mb-6 line-clamp-3">
                    {item.description}
                  </p>
                </div>
                <span
                  className="inline-flex items-center justify-between gap-2 text-[10px] sm:text-[11px] uppercase tracking-[2px] font-bold px-4 py-2.5 border transition-all duration-300 group-hover:bg-[var(--hover-bg)] group-hover:text-[var(--hover-text)] group-hover:border-transparent self-start"
                  style={{
                    borderColor: `${item.color}40`,
                    color: item.color,
                    background: `${item.color}0a`,
                    "--hover-bg": item.color,
                    "--hover-text": "#0B1828",
                  } as React.CSSProperties}
                >
                  Explore Pathway
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveLaunchSection;
