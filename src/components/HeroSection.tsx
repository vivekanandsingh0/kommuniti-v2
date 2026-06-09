import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LIVE_LAUNCH_LINKS } from "@/config/comingSoonPages";

const HeroSection = () => {
  // Exact pattern from design document (14 columns x 3 rows)
  const mapData = [
    // Row 1
    { active: false }, { active: false }, { active: true, color: "#6BBFB5" }, { active: false }, 
    { active: true, color: "#F5C842" }, { active: false }, { active: false }, { active: true, color: "#4895EF" }, 
    { active: false }, { active: true, color: "#E63946" }, { active: false }, { active: false }, 
    { active: false }, { active: false },
    // Row 2
    { active: false }, { active: true, color: "#6BBFB5" }, { active: true, color: "#6BBFB5" }, { active: false }, 
    { active: false }, { active: true, color: "#FF6B35" }, { active: false }, { active: true, color: "#4895EF" }, 
    { active: false }, { active: false }, { active: false }, { active: false }, 
    { active: true, color: "#AAFF00" }, { active: false },
    // Row 3
    { active: false }, { active: false }, { active: true, color: "#F5C842" }, { active: true, color: "#F5C842" }, 
    { active: false }, { active: false }, { active: false }, { active: false }, 
    { active: true, color: "#4895EF" }, { active: false }, { active: false }, { active: false }, 
    { active: false }, { active: false }
  ];

  const mapPixels = mapData.map(pixel => ({
    ...pixel,
    color: pixel.active ? pixel.color : "rgba(240, 232, 213, 0.05)"
  }));

  const pillars = LIVE_LAUNCH_LINKS.map((item) => ({
    icon: item.icon,
    title: item.label,
    color: item.color,
    desc: item.subtitle ?? "",
    href: item.href,
    live: true,
  }));

  const MapCard = ({ className }: { className?: string }) => (
    <div 
      className={className}
      style={{
        background: "#0B1828",
        border: "1px solid rgba(201, 168, 76, 0.2)",
        padding: "12px",
        borderRadius: "4px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
      }}
    >
      <div 
        style={{
          fontSize: "8px",
          letterSpacing: "2px",
          textTransform: "uppercase",
          color: "#C9A84C",
          marginBottom: "10px",
          fontFamily: "'Rajdhani', sans-serif"
        }}
      >
        Kerala KO Universe · Live Map
      </div>
      
      <div 
        className="grid gap-[2px]"
        style={{ gridTemplateColumns: "repeat(14, 1fr)" }}
      >
        {mapPixels.slice(0, 42).map((pixel, i) => (
          <div 
            key={i}
            style={{
              aspectRatio: "1",
              background: pixel.color,
              borderRadius: "0.5px",
              boxShadow: pixel.active ? `0 0 6px ${pixel.color}66` : "none"
            }}
            className={pixel.active ? "animate-pulse" : ""}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
        {[
          { label: "Root Kore", color: "#C9A84C" },
          { label: "Branch", color: "#6BBFB5" },
          { label: "Canopy", color: "#4895EF" },
          { label: "Issue", color: "#E63946" },
          { label: "Grey zone", color: "rgba(240, 232, 213, 0.1)" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div style={{ width: "5px", height: "5px", background: item.color }}></div>
            <span style={{ fontSize: "7px", color: "rgba(240, 232, 213, 0.6)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="relative pt-20 overflow-hidden bg-[#0B1828]">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201, 168, 76, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 168, 76, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="container mx-auto relative z-10">
        <div 
          className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12"
          style={{ padding: "48px 24px" }}
        >
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 max-w-2xl"
          >
            {/* Sub-label */}
            <div 
              style={{ 
                fontSize: "9px", 
                letterSpacing: "3px", 
                textTransform: "uppercase", 
                color: "#C9A84C",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px"
              }}
            >
              <span style={{ width: "24px", height: "1px", background: "#C9A84C" }}></span>
              Explore the universe · Active now
            </div>

            {/* Heading */}
            <h1 
              style={{ 
                fontFamily: "'Syne', sans-serif", 
                fontWeight: 800, 
                lineHeight: 0.92, 
                letterSpacing: "-2px",
                marginBottom: "16px"
              }}
              className="text-[36px] sm:text-[48px] md:text-[60px]"
            >
              <span style={{ color: "#F0E8D5" }}>Build the</span><br />
              <span style={{ color: "#C9A84C" }}>Community</span><br />
              <span style={{ color: "#F0E8D5" }}>You Deserve.</span>
            </h1>

            {/* Tagline */}
            <p 
              style={{ 
                fontFamily: "'Cormorant Garamond', serif", 
                fontStyle: "italic", 
                fontSize: "18px",
                color: "rgba(240,232,213,0.6)", 
                marginBottom: "28px",
                maxWidth: "400px",
                lineHeight: 1.4
              }}
            >
              Where every action earns, every contribution matters, and every neighbourhood becomes a Kore.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link
                to="/konnect"
                className="no-underline transition-all hover:brightness-110 active:scale-95 text-center"
                style={{
                  background: "#FF6B35",
                  color: "#0B1828",
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 700,
                  fontSize: "12px",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  padding: "14px 28px",
                }}
              >
                Show Up & Learn →
              </Link>
              <Link
                to="/koreads"
                className="no-underline transition-all hover:bg-[#C77DFF]/10 active:scale-95 text-center"
                style={{
                  border: "1.5px solid rgba(199, 125, 255, 0.5)",
                  color: "#C77DFF",
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 700,
                  fontSize: "12px",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  padding: "14px 28px",
                }}
              >
                Co-Write a Book →
              </Link>
            </div>

            {/* Mobile Map Card (Only on Mobile, Below Buttons) */}
            <MapCard className="mb-8 lg:hidden" />
          </motion.div>

          {/* Desktop Map Card (Only on Large Screens) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:block w-[280px] shrink-0"
          >
            <MapCard />
          </motion.div>
        </div>

        {/* Phase 1 live products (hidden for now) */}
        {/*
        <div
          className="grid grid-cols-2 lg:grid-cols-4 border-t border-[rgba(201,168,76,0.1)] overflow-hidden"
        >
          {pillars.map((pillar, idx) => {
            const PillarIcon = pillar.icon;
            return (
              <Link
                key={pillar.title}
                to={pillar.href}
                className={`p-3 sm:p-6 no-underline block hover:bg-[rgba(240,232,213,0.03)] transition-colors ${idx !== pillars.length - 1 ? "border-r border-[rgba(201,168,76,0.1)]" : ""}`}
              >
                <div className="mb-2 text-[rgba(240,232,213,0.85)]">
                  <PillarIcon size={22} style={{ color: pillar.color }} />
                </div>
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    color: pillar.color,
                    lineHeight: 1.1,
                    marginBottom: "4px",
                  }}
                  className="text-[12px] sm:text-[16px]"
                >
                  {pillar.title}
                </div>
              <div className="text-[8px] sm:text-[10px] text-[#4CAF50] uppercase tracking-[1.5px] font-bold mb-1">
                Live
              </div>
              <div
                style={{
                  fontSize: "9px",
                  lineHeight: "1.4",
                  color: "rgba(240, 232, 213, 0.5)",
                }}
                className="sm:text-[11px]"
              >
                {pillar.desc}
              </div>
            </Link>
            );
          })}
        </div>
        */}
      </div>

      <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none z-0">
        <p className="font-pixel text-[60px] sm:text-[100px] md:text-[140px] text-foreground/[0.02] leading-none whitespace-nowrap text-center select-none">
          KOMMUNITI
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
