const CTASection = () => {
  return (
    <section className="py-24 px-4 pixel-grid-hero relative overflow-hidden">
      {/* Floating shapes */}
      <div className="absolute top-10 left-[15%] w-6 h-6 bg-accent rotate-45 animate-float-pixel opacity-30" />
      <div className="absolute bottom-16 right-[20%] w-5 h-5 bg-primary rounded-full animate-float-pixel-slow opacity-40" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="font-pixel text-base sm:text-lg md:text-xl text-foreground mb-6">
          Begin Your Journey
        </h2>
        <p className="font-pixel text-[10px] sm:text-xs text-accent tracking-[0.3em] mb-10">
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
