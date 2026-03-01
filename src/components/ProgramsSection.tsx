import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Globe, MessageCircle, Lightbulb } from "lucide-react";

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

const pillars = [
  {
    title: "KOMMUTE",
    subtitle: "Travel & Cultural Exchange",
    description:
      "Travelling opens your mind to changes and helps you be free of attachments. We encourage people to pursue travel where their heart calls — not as a tourist, but as an observer and problem solver.",
    detail: "Through KO Pods, we partner with spaces across geographies to provide lifestyle skills, health, wellness and responsible growth.",
    icon: Globe,
  },
  {
    title: "KONNECT",
    subtitle: "Community & Voice Sharing",
    description:
      "Conversations and storytelling have ever been a part of human evolution. Kommuniti encourages meaningful discussions that open minds from different perspectives.",
    detail: "Through talks, workshops, events, webinars and conferences, we create awareness about the larger goal of life.",
    icon: MessageCircle,
  },
  {
    title: "KREATE",
    subtitle: "Transform Into Change",
    description:
      "Where everything comes together — developing a healthy body, mind and relationships to bring each one's vision into sustainable creation.",
    detail: "Kommuniti envisions to be an incubation centre where we build the right individual, connect them with tribe members, and help them go to market.",
    icon: Lightbulb,
  },
];

const ProgramsSection = () => {
  return (
    <section id="programs" className="section-padding">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-3 h-3 bg-primary animate-pulse-glow" />
            <h2 className="font-pixel text-sm sm:text-base md:text-lg text-foreground">
              WHAT IS KOMMUNITI?
            </h2>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="text-indent text-lg sm:text-xl text-foreground/50 leading-relaxed mb-16 max-w-4xl">
            Kommuniti is a global network of people, centres and digital resources which can aid its members to learn, experiment and solve critical problems of the world.
          </p>
        </FadeIn>

        {/* Cards */}
        <div className="space-y-4">
          {pillars.map((pillar, i) => (
            <FadeIn key={pillar.title} delay={0.1 * (i + 1)}>
              <div className="group border border-border hover:border-primary/30 transition-all duration-300 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Left - Icon & Title */}
                  <div className="md:w-1/3 p-8 sm:p-10 border-b md:border-b-0 md:border-r border-border bg-card/30 group-hover:bg-primary/5 transition-colors">
                    <div className="w-10 h-10 border-2 border-foreground/20 flex items-center justify-center mb-6 group-hover:border-primary transition-colors">
                      <pillar.icon className="w-5 h-5 text-foreground/40 group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="font-pixel text-xs text-primary mb-2">{pillar.title}</h3>
                    <p className="text-lg font-semibold text-foreground">{pillar.subtitle}</p>
                  </div>

                  {/* Right - Description */}
                  <div className="md:w-2/3 p-8 sm:p-10">
                    <p className="text-foreground/60 leading-relaxed mb-4">{pillar.description}</p>
                    <p className="text-foreground/40 leading-relaxed text-sm">{pillar.detail}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
