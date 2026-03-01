const KoreadsSection = () => {
  return (
    <section id="koreads" className="py-20 px-4 pixel-grid-bg">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-pixel text-sm sm:text-base md:text-lg text-center text-foreground mb-12">
          KOREADS
        </h2>

        <div className="pixel-border bg-card overflow-hidden">
          {/* Yellow accent stripe */}
          <div className="h-2 bg-primary w-full" />

          <div className="p-8 sm:p-12 flex flex-col md:flex-row gap-8 items-center">
            {/* Content */}
            <div className="flex-1 space-y-4">
              <span className="font-pixel text-[8px] text-accent tracking-wider">
                FEATURED
              </span>
              <h3 className="font-pixel text-xs sm:text-sm text-foreground leading-relaxed">
                Decentralising Education
              </h3>
              <p className="text-foreground/70 leading-relaxed">
                Exploring how communities worldwide are reimagining learning beyond traditional
                institutions. From grassroots workshops to peer-to-peer knowledge sharing, discover
                the future of education built by the people.
              </p>
              <a
                href="#"
                className="inline-block font-pixel text-[10px] bg-accent text-accent-foreground px-6 py-3 border-[3px] border-accent pixel-glow-accent transition-all hover:translate-y-[-2px] mt-4"
              >
                EXPLORE
              </a>
            </div>

            {/* Pixel illustration */}
            <div className="w-full md:w-64 h-48 pixel-border-primary bg-primary/10 flex items-center justify-center">
              <div className="grid grid-cols-6 gap-1 p-4">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3"
                    style={{
                      backgroundColor:
                        i % 7 === 0
                          ? "hsl(var(--primary))"
                          : i % 4 === 0
                          ? "hsl(var(--accent))"
                          : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KoreadsSection;
