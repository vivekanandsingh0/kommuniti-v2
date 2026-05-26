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

const KoreadsSection = () => {
  return (
    <section id="koreads" className="section-padding pixel-grid-bg">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-3 h-3 bg-accent animate-pulse-glow" />
            <h2 className="font-pixel text-sm sm:text-base md:text-lg text-foreground">
              KO READS
            </h2>
          </div>
        </FadeIn>

        {/* Featured card */}
        <FadeIn delay={0.1}>
          <div className="border border-border overflow-hidden group hover:border-accent/30 transition-all duration-300">
            {/* Accent stripe */}
            <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />

            <div className="flex flex-col lg:flex-row">
              {/* Content */}
              <div className="lg:w-2/3 p-8 sm:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="font-pixel text-[8px] text-accent tracking-widest">DEMOCRATISING EDUCATION</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 leading-tight">
                  Decentralising Education
                </h3>

                <p className="text-foreground/50 leading-relaxed mb-6">
                  KO Reads is a citizen science approach of learning and sharing. This project stems from our strong
                  belief that knowledge is available everywhere and to anyone. It envisions to be a space where people
                  can access knowledge with no to minimal costs in digital and book format.
                </p>

                <p className="text-foreground/35 leading-relaxed text-sm mb-8">
                  A collaborative platform where authors come up with ideas and Kommuniti members contribute.
                  Each contribution is rated and goes through an approval process, building a decentralised library
                  for generations.
                </p>

                <a href="/koreads" className="btn-pixel-primary inline-block">
                  EXPLORE
                </a>
              </div>

              {/* Pixel art side */}
              <div className="lg:w-1/3 bg-card/50 border-t lg:border-t-0 lg:border-l border-border flex items-center justify-center p-8">
                <div className="w-full max-w-[200px] aspect-square relative">
                  {/* Pixel grid art */}
                  <div className="grid grid-cols-8 gap-[2px] w-full h-full">
                    {Array.from({ length: 64 }).map((_, i) => {
                      const row = Math.floor(i / 8);
                      const col = i % 8;
                      const isActive = (row + col) % 3 === 0 || (row * col) % 7 === 0;
                      const isPrimary = (row + col) % 5 === 0;
                      const isAccent = (row * 2 + col) % 11 === 0;
                      return (
                        <div
                          key={i}
                          className="aspect-square transition-colors duration-500"
                          style={{
                            backgroundColor: isAccent
                              ? "hsl(var(--accent) / 0.6)"
                              : isPrimary
                              ? "hsl(var(--primary) / 0.5)"
                              : isActive
                              ? "hsl(var(--foreground) / 0.08)"
                              : "transparent",
                          }}
                        />
                      );
                    })}
                  </div>
                  <p className="font-pixel text-[6px] text-muted-foreground text-center mt-4 tracking-wider">
                    [ KO READS ]
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* KOKO Store teaser */}
        <FadeIn delay={0.2}>
          <div className="mt-4 border border-border p-8 sm:p-10 hover:border-primary/20 transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start gap-6">
                <div className="w-10 h-10 border-2 border-primary/30 flex items-center justify-center shrink-0">
                  <span className="font-pixel text-[8px] text-primary">KO</span>
                </div>
                <div>
                  <h3 className="font-pixel text-[10px] text-foreground mb-2">KOKO STORE</h3>
                  <p className="text-sm text-foreground/40 max-w-lg">
                    A social equitable, community-friendly marketplace giving access to products which help you
                    grow as a healthy and responsible citizen.
                  </p>
                </div>
              </div>
              <span className="font-pixel text-[8px] text-primary/50 tracking-wider whitespace-nowrap">
                COMING SOON
              </span>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default KoreadsSection;
