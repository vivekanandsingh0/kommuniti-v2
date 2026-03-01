const KoreadsSection = () => {
  return (
    <section id="koreads" className="py-20 px-4 pixel-grid-bg">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-pixel text-sm sm:text-base md:text-lg text-center text-foreground mb-12">
          KO READS
        </h2>

        <div className="pixel-border bg-card overflow-hidden">
          <div className="h-2 bg-primary w-full" />

          <div className="p-8 sm:p-12 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <span className="font-pixel text-[8px] text-accent tracking-wider">
                DEMOCRATISING EDUCATION
              </span>
              <h3 className="font-pixel text-xs sm:text-sm text-foreground leading-relaxed">
                Decentralising Education
              </h3>
              <p className="text-foreground/70 leading-relaxed">
                KO Reads is a citizen science approach of learning and sharing. This project stems from our strong
                belief that knowledge is available everywhere and to anyone. It envisions to be a space where people
                can access knowledge with no to minimal costs in digital and book format — a collaborative platform
                where authors come up with ideas and Kommuniti members contribute.
              </p>
              <a
                href="#"
                className="inline-block font-pixel text-[10px] bg-accent text-accent-foreground px-6 py-3 border-[3px] border-accent pixel-glow-accent transition-all hover:translate-y-[-2px] mt-4"
              >
                EXPLORE
              </a>
            </div>

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

        {/* KOKO Store teaser */}
        <div className="mt-8 pixel-border bg-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="font-pixel text-[8px] text-primary tracking-wider">MARKETPLACE</span>
              <h3 className="font-pixel text-xs text-foreground mt-2">KOKO STORE</h3>
              <p className="text-sm text-foreground/70 mt-2 max-w-lg">
                A social equitable, community-friendly marketplace giving access to products which help you
                grow as a healthy and responsible citizen.
              </p>
            </div>
            <a
              href="#"
              className="inline-block font-pixel text-[10px] text-accent border-b-2 border-accent hover:text-primary hover:border-primary transition-colors whitespace-nowrap"
            >
              COMING SOON →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KoreadsSection;
