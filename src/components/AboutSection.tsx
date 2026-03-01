const AboutSection = () => {
  return (
    <section id="about" className="py-20 px-4 pixel-grid-bg">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-pixel text-sm sm:text-base md:text-lg text-center text-foreground mb-12">
          WHY KOMMUNITI ?
        </h2>

        {/* Three Pillars - matching the reference layout */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-wide">KOMMUTE</h3>
            <p className="text-foreground/70 leading-relaxed">
              Encourage movement through cultures and places with a mission to gain a deep understanding of its uniqueness and differences.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-wide">KONNECT</h3>
            <p className="text-foreground/70 leading-relaxed">
              Be a safe and creative platform to keep the connections, share your voice and share individual uniqueness for world unity.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-wide">KREATE</h3>
            <p className="text-foreground/70 leading-relaxed">
              Provide people and resources to transform experiences into meaningful changes for an equitable world.
            </p>
          </div>
        </div>

        {/* Vision */}
        <div id="vision" className="pixel-border bg-card p-8 sm:p-12">
          <h3 className="font-pixel text-xs sm:text-sm text-primary mb-4">OUR VISION</h3>
          <p className="text-lg leading-relaxed text-foreground/80 mb-6">
            Kommuniti envisions to be a decentralised, international and non-partisan commune where mankind
            can function as one while expressing their individual uniqueness.
          </p>
          <p className="text-foreground/60 leading-relaxed">
            Our approach is one of decentralisation where members can innovate and come up with ideas which
            can nurture their uniqueness while contributing to the oneness of global unity.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
