import { Globe, MessageCircle, Lightbulb } from "lucide-react";

const pillars = [
  {
    title: "KOMMUTE",
    subtitle: "Travel & Cultural Exchange",
    description:
      "Travelling opens your mind to changes and helps you be free of attachments. We encourage people to pursue travel where their heart calls — not as a tourist, but as an observer and problem solver. Through KO Pods, we partner with spaces across geographies to provide lifestyle skills, health, wellness and responsible growth.",
    icon: Globe,
    accentClass: "text-primary",
    borderClass: "border-primary",
  },
  {
    title: "KONNECT",
    subtitle: "Community & Voice Sharing",
    description:
      "Conversations and storytelling have ever been a part of human evolution. Kommuniti encourages meaningful discussions that open minds from different perspectives. Through talks, workshops, events, webinars and conferences, we create awareness about the larger goal of life. Our decentralised library KO Reads keeps people connected across tribes.",
    icon: MessageCircle,
    accentClass: "text-accent",
    borderClass: "border-accent",
  },
  {
    title: "KREATE",
    subtitle: "Transform Into Change",
    description:
      "Where everything comes together — developing a healthy body, mind and relationships to bring each one's vision into sustainable creation. Kommuniti envisions to be an incubation centre where we build the right individual, connect them with tribe members who contribute to their vision, and help them go to market.",
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
          WHAT IS KOMMUNITI?
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
          Kommuniti is a global network of people, centres and digital resources which can aid its members to learn, experiment and solve critical problems of the world.
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
