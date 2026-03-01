import { motion } from "framer-motion";
import { useInView } from "framer-motion";
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

const AboutSection = () => {
  return (
    <section id="about" className="section-padding pixel-grid-bg">
      <div className="max-w-6xl mx-auto">
        {/* Section header with pixel icon */}
        <FadeIn>
          <div className="flex items-center gap-4 mb-12">
            <div className="w-3 h-3 bg-primary animate-pulse-glow" />
            <h2 className="font-pixel text-sm sm:text-base md:text-lg text-foreground">
              WHY KOMMUNITI ?
            </h2>
          </div>
        </FadeIn>

        {/* Large indented paragraph - like reference */}
        <FadeIn delay={0.1}>
          <p className="text-indent text-xl sm:text-2xl md:text-3xl font-light text-foreground/70 leading-relaxed mb-20 max-w-4xl">
            Kommuniti envisions to be a decentralised, international and non-partisan commune where mankind
            can function as one while expressing their individual uniqueness.
          </p>
        </FadeIn>

        {/* Three pillars - clean grid */}
        <div className="grid md:grid-cols-3 gap-0 border border-border">
          {[
            {
              title: "KOMMUTE",
              description: "Encourage movement through cultures and places with a mission to gain a deep understanding of its uniqueness and differences.",
            },
            {
              title: "KONNECT",
              description: "Be a safe and creative platform to keep the connections, share your voice and share individual uniqueness for world unity.",
            },
            {
              title: "KREATE",
              description: "Provide people and resources to transform experiences into meaningful changes for an equitable world.",
            },
          ].map((pillar, i) => (
            <FadeIn key={pillar.title} delay={0.1 * (i + 1)}>
              <div className={`p-8 sm:p-10 ${i < 2 ? "md:border-r border-b md:border-b-0 border-border" : ""} group hover:bg-card/50 transition-colors duration-300`}>
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 tracking-wide group-hover:text-primary transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-foreground/50 leading-relaxed text-sm sm:text-base">
                  {pillar.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
