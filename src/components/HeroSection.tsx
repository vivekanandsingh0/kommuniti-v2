const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pixel-grid-hero overflow-hidden">
      {/* Floating pixel shapes */}
      <div className="absolute top-20 left-[10%] w-8 h-8 bg-primary rotate-12 animate-float-pixel opacity-60" />
      <div className="absolute top-40 right-[15%] w-6 h-6 rounded-full bg-accent animate-float-pixel-slow opacity-50" />
      <div className="absolute bottom-32 left-[20%] w-5 h-5 bg-secondary rotate-45 animate-float-pixel opacity-40" />
      <div className="absolute top-60 left-[60%] w-4 h-4 bg-primary rounded-full animate-float-pixel-slow opacity-50" />
      <div className="absolute bottom-20 right-[25%] w-7 h-7 bg-accent rotate-12 animate-float-pixel opacity-30" />
      <div className="absolute top-32 left-[40%] w-3 h-3 bg-secondary animate-float-pixel-slow opacity-40" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <div className="pixel-border-primary bg-primary/10 backdrop-blur-sm p-8 sm:p-12 md:p-16 mb-8">
          <h1 className="font-pixel text-2xl sm:text-3xl md:text-4xl text-foreground leading-relaxed mb-4">
            Community
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-foreground/80 mb-2 tracking-wide">
            of the <span className="font-bold text-foreground">PEOPLE</span> • by the <span className="font-bold text-foreground">PEOPLE</span> • for the <span className="font-bold text-foreground">PEOPLE</span>
          </p>
          <div className="my-8">
            <p className="font-pixel text-[10px] sm:text-xs text-accent tracking-[0.3em]">
              KOMMUTE · KONNECT · KREATE
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#about"
              className="inline-block font-pixel text-[10px] sm:text-xs bg-accent text-accent-foreground px-8 py-4 pixel-glow-accent transition-all hover:translate-y-[-2px] border-[3px] border-accent"
            >
              KONNECT
            </a>
            <a
              href="#vision"
              className="inline-block font-pixel text-[10px] sm:text-xs bg-transparent text-foreground px-8 py-4 border-[3px] border-foreground hover:border-primary hover:text-primary transition-all hover:translate-y-[-2px]"
            >
              OUR VISION
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
