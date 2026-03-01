const MarqueeSection = () => {
  const items = [
    { text: "KOMMUTE", outline: true },
    { text: "KONNECT", outline: false },
    { text: "KREATE", outline: true },
    { text: "KOMMUTE", outline: false },
    { text: "KONNECT", outline: true },
    { text: "KREATE", outline: false },
  ];

  return (
    <section className="py-6 sm:py-8 overflow-hidden border-y border-border">
      <div className="marquee-track">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className={`font-pixel text-2xl sm:text-4xl md:text-5xl lg:text-6xl mx-6 sm:mx-10 whitespace-nowrap ${
              item.outline
                ? "text-transparent [-webkit-text-stroke:1.5px_hsl(var(--foreground)/0.3)]"
                : "text-foreground/80"
            }`}
          >
            {item.text}
          </span>
        ))}
      </div>
    </section>
  );
};

export default MarqueeSection;
