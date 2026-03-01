const CTASection = () => {
  return (
    <section className="py-24 px-4 pixel-grid-hero relative overflow-hidden">
      <div className="absolute top-10 left-[15%] w-6 h-6 bg-accent rotate-45 animate-float-pixel opacity-30" />
      <div className="absolute bottom-16 right-[20%] w-5 h-5 bg-primary rounded-full animate-float-pixel-slow opacity-40" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <p className="font-pixel text-[8px] text-muted-foreground mb-4 tracking-wider">
          ITS TIME FOR
        </p>
        <h2 className="font-pixel text-base sm:text-lg md:text-xl text-foreground mb-6">
          Begin Your Journey
        </h2>

        <div className="space-y-3 text-foreground/70 mb-8 max-w-xl mx-auto text-sm">
          <p>To travel to meet new cultures, practices and innovations</p>
          <p>To give education a new perspective to solve real problems</p>
          <p>To create a greater equity in world economic order</p>
          <p>To preserve individual identities, culture and differences to reach world unity</p>
        </div>

        <p className="font-pixel text-[9px] text-accent tracking-[0.3em] mb-4">
          WE HAVE A DUTY TO UNITE — WHATEVER OUR DIFFERENCES
        </p>

        <p className="font-pixel text-[10px] sm:text-xs text-primary tracking-[0.3em] mb-10">
          KOMMUTE · KONNECT · KREATE
        </p>
        <a
          href="#about"
          className="inline-block font-pixel text-[10px] sm:text-xs bg-accent text-accent-foreground px-10 py-4 border-[3px] border-accent pixel-glow-accent transition-all hover:translate-y-[-2px]"
        >
          JOIN KOMMUNITI
        </a>
      </div>
    </section>
  );
};

export default CTASection;
