import { Globe, MessageCircle, Lightbulb } from "lucide-react";

const pillars = [
  {
    title: "KOMMUTE",
    subtitle: "Travel & Cultural Exchange",
    description:
      "Experience the world through meaningful travel. Immerse yourself in diverse cultures, forge global connections, and broaden your horizons beyond borders.",
    icon: Globe,
    accentClass: "text-primary",
    borderClass: "border-primary",
  },
  {
    title: "KONNECT",
    subtitle: "Community & Voice Sharing",
    description:
      "A platform where every voice matters. Share your stories, engage in dialogue, and build lasting connections with a global network of changemakers.",
    icon: MessageCircle,
    accentClass: "text-accent",
    borderClass: "border-accent",
  },
  {
    title: "KREATE",
    subtitle: "Transform Into Change",
    description:
      "Turn experiences into impact. Channel your creativity and passion into projects, initiatives, and movements that drive real-world transformation.",
    icon: Lightbulb,
    accentClass: "text-primary",
    borderClass: "border-primary",
  },
];

const ProgramsSection = () => {
  return (
    <section id="programs" className="py-20 px-4 bg-secondary/5">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-pixel text-sm sm:text-base md:text-lg text-center text-foreground mb-4">
          THREE PILLARS
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Our mission operates through three interconnected programs
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="retro-card group">
              <div className={`w-12 h-12 flex items-center justify-center border-[3px] ${pillar.borderClass} mb-4`}>
                <pillar.icon className={`w-6 h-6 ${pillar.accentClass}`} />
              </div>
              <h3 className={`font-pixel text-xs ${pillar.accentClass} mb-2`}>
                {pillar.title}
              </h3>
              <p className="text-sm font-semibold text-foreground mb-3">
                {pillar.subtitle}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
