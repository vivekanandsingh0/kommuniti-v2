import { LIVE_LAUNCH_LINKS, COMING_SOON_NAV_LINKS } from "@/config/comingSoonPages";

const MarqueeSection = () => {
  const liveItems = LIVE_LAUNCH_LINKS.map((l) => ({
    text: l.label.toUpperCase(),
    outline: false,
    color: l.color,
  }));

  const soonItems = COMING_SOON_NAV_LINKS.map((l) => ({
    text: l.label.toUpperCase(),
    outline: true,
    color: "rgba(240,232,213,0.25)",
  }));

  const items = [...liveItems, ...soonItems];

  return (
    <section className="py-6 sm:py-8 overflow-hidden border-y border-border bg-[#0B1828]">
      <div className="marquee-track">
        {[...items, ...items].map((item, i) => (
          <span
            key={`${item.text}-${i}`}
            className={`font-pixel text-2xl sm:text-4xl md:text-5xl lg:text-6xl mx-6 sm:mx-10 whitespace-nowrap ${
              item.outline
                ? "text-transparent [-webkit-text-stroke:1.5px_rgba(240,232,213,0.2)]"
                : ""
            }`}
            style={item.outline ? undefined : { color: item.color }}
          >
            {item.text}
            {item.outline ? " ·" : " ·"}
          </span>
        ))}
      </div>
    </section>
  );
};

export default MarqueeSection;
