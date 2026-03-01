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

const testimonials = [
  {
    quote: "Kommuniti changed the way I see the world. The connections I made through Kommute are friendships for life.",
    name: "Priya Sharma",
    country: "INDIA",
    initials: "PS",
  },
  {
    quote: "Being part of this community gave me the courage to share my story. Konnect made my voice heard across borders.",
    name: "Carlos Mendes",
    country: "BRAZIL",
    initials: "CM",
  },
  {
    quote: "Kreate helped me turn my passion project into a real initiative that's impacting hundreds of students.",
    name: "Aisha Okafor",
    country: "NIGERIA",
    initials: "AO",
  },
  {
    quote: "The retro spirit of Kommuniti is infectious. It's modern community building with heart and soul.",
    name: "Yuki Tanaka",
    country: "JAPAN",
    initials: "YT",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="section-padding">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-3 h-3 bg-primary animate-pulse-glow" />
            <h2 className="font-pixel text-sm sm:text-base md:text-lg text-foreground">
              VOICES
            </h2>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="text-lg text-foreground/40 mb-12">Stories from our global community</p>
        </FadeIn>

        {/* Grid of testimonials - like reference done-block grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {testimonials.map((t, i) => (
            <FadeIn key={t.name} delay={0.1 * (i + 1)}>
              <div className="border border-border p-8 group hover:border-primary/20 transition-all duration-300 h-full flex flex-col">
                {/* Top - name block like reference done-top */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 border-2 border-primary/30 flex items-center justify-center group-hover:border-primary transition-colors">
                    <span className="font-pixel text-[7px] text-primary/60 group-hover:text-primary transition-colors">
                      {t.initials}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="font-pixel text-[7px] text-foreground/30 tracking-wider">{t.country}</p>
                  </div>
                </div>

                {/* Quote */}
                <p className="text-foreground/50 leading-relaxed flex-1 text-sm">
                  "{t.quote}"
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
