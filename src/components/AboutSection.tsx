const AboutSection = () => {
  return (
    <section id="about" className="py-20 px-4 pixel-grid-bg">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-pixel text-sm sm:text-base md:text-lg text-center text-foreground mb-12">
          WHAT IS KOMMUNITI?
        </h2>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Text */}
          <div className="space-y-6">
            <p className="text-lg leading-relaxed text-foreground/80">
              Kommuniti is a global community built by the people, for the people. We believe in the power of
              shared experiences, cross-cultural exchange, and collective creativity to drive meaningful change.
            </p>
            <p className="text-lg leading-relaxed text-foreground/80">
              Through our three pillars — <span className="font-bold text-accent">Kommute</span>,{" "}
              <span className="font-bold text-accent">Konnect</span>, and{" "}
              <span className="font-bold text-accent">Kreate</span> — we empower individuals to travel,
              connect, and transform ideas into action.
            </p>
            <a
              href="#programs"
              className="inline-block font-pixel text-[10px] text-accent border-b-2 border-accent hover:text-primary hover:border-primary transition-colors"
            >
              EXPLORE OUR VISION →
            </a>
          </div>

          {/* Pixel Art Panel */}
          <div className="pixel-border p-8 bg-card">
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square"
                  style={{
                    backgroundColor:
                      i % 5 === 0
                        ? "hsl(var(--primary))"
                        : i % 3 === 0
                        ? "hsl(var(--accent))"
                        : i % 2 === 0
                        ? "hsl(var(--secondary))"
                        : "hsl(var(--muted))",
                    opacity: 0.3 + (i % 4) * 0.2,
                  }}
                />
              ))}
            </div>
            <p className="font-pixel text-[8px] text-muted-foreground text-center mt-4">
              [ PIXEL PEOPLE MOSAIC ]
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
