import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { COMING_SOON_NAV_LINKS } from "@/config/comingSoonPages";

const FadeIn = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
};

const ComingSoonStrip = () => {
  return (
    <section id="roadmap" className="py-14 lg:py-16 border-y border-[rgba(240,232,213,0.06)] bg-[#060D16]">
      <div className="container mx-auto px-6 lg:px-12">
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-[10px] uppercase tracking-[3px] text-[rgba(240,232,213,0.35)] mb-3">
              On the roadmap
            </p>
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-[rgba(240,232,213,0.75)]"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Coming soon to Kommuniti
            </h2>
            <p className="text-sm text-[rgba(240,232,213,0.4)] mt-3 leading-relaxed">
              We&apos;re building these next. You can peek at what&apos;s planned — they aren&apos;t live yet.
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {COMING_SOON_NAV_LINKS.map((item, i) => (
            <FadeIn key={item.href} delay={0.06 * i}>
              <Link
                to={item.href}
                className="flex flex-col items-center text-center border border-dashed border-white/10 hover:border-white/20 p-5 transition-colors no-underline opacity-70 hover:opacity-90"
              >
                <span className="text-2xl mb-2 grayscale-[30%]">{item.icon}</span>
                <span className="font-bold text-sm text-[rgba(240,232,213,0.65)] mb-1">{item.label}</span>
                <span
                  className="text-[9px] uppercase tracking-[2px] font-bold px-2 py-0.5 border border-[rgba(240,232,213,0.15)] text-[rgba(240,232,213,0.35)]"
                >
                  Coming soon
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComingSoonStrip;
