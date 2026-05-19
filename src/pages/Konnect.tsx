import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ExternalLink, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchKonnectPageData, filterKonnectEvents } from "@/lib/konnect";
import {
  DEFAULT_FEATURED,
  DEFAULT_PAGE_SETTINGS,
  KonnectEvent,
  KonnectFeatured,
  KonnectFilterTab,
  KonnectPageSettings,
} from "@/types/konnect";

const Konnect = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<KonnectPageSettings>(DEFAULT_PAGE_SETTINGS);
  const [events, setEvents] = useState<KonnectEvent[]>([]);
  const [featured, setFeatured] = useState<KonnectFeatured>(DEFAULT_FEATURED);
  const [activeFilter, setActiveFilter] = useState<KonnectFilterTab>("upcoming");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { settings: s, events: e, featured: f } = await fetchKonnectPageData();
      setSettings(s);
      setEvents(e);
      setFeatured(f);
      setLoading(false);
    };
    load();
  }, []);

  const accent = settings.accent_color || "#FF6B35";

  const filterTabs: { id: KonnectFilterTab; label: string }[] = useMemo(
    () => [
      { id: "upcoming", label: settings.filter_upcoming_label },
      { id: "online", label: settings.filter_online_label },
      { id: "in-person", label: settings.filter_in_person_label },
      { id: "on-demand", label: settings.filter_on_demand_label },
    ],
    [settings]
  );

  const visibleEvents = useMemo(
    () => filterKonnectEvents(events, activeFilter),
    [events, activeFilter]
  );

  const openRegistration = (url: string | null) => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#0B1828] text-[#F0E8D5]"
    >
      <Navbar />

      <main className="pt-[72px]">
        <section
          style={{
            background: "linear-gradient(135deg, #1A1200 0%, #0B1828 100%)",
            borderBottom: `1px solid ${accent}33`,
          }}
          className="px-6 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14"
        >
          <p
            style={{
              fontSize: "9px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: accent,
              marginBottom: "10px",
              fontFamily: "'Rajdhani', sans-serif",
            }}
          >
            {settings.tagline}
          </p>

          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(36px, 6vw, 44px)",
              lineHeight: 0.92,
              letterSpacing: "-2px",
              marginBottom: "20px",
            }}
          >
            <span style={{ color: accent }}>{settings.hero_line_1}</span>
            <br />
            <span style={{ color: "#F0E8D5" }}>{settings.hero_line_2}</span>
            <br />
            <span style={{ color: "#F0E8D5" }}>{settings.hero_line_3}</span>
          </h1>

          <div
            className="inline-flex flex-wrap"
            style={{
              background: "rgba(42, 53, 68, 0.6)",
              border: `1px solid ${accent}40`,
              padding: "4px",
            }}
          >
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  style={{
                    padding: "8px 18px",
                    fontSize: "11px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    fontFamily: "'Rajdhani', sans-serif",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background: isActive ? accent : "transparent",
                    color: isActive ? "#0B1828" : "rgba(240, 232, 213, 0.5)",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="px-6 py-6 sm:px-8 lg:px-10">
          <p
            style={{
              fontSize: "10px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "rgba(240, 232, 213, 0.4)",
              marginBottom: "14px",
              fontFamily: "'Rajdhani', sans-serif",
            }}
          >
            {settings.sessions_section_label}
          </p>

          {loading ? (
            <p className="text-[rgba(240,232,213,0.3)] text-sm py-12 text-center uppercase tracking-widest">
              Loading sessions…
            </p>
          ) : visibleEvents.length === 0 ? (
            <p className="text-[rgba(240,232,213,0.3)] text-sm py-12 text-center border border-dashed border-[rgba(201,168,76,0.2)]">
              No sessions in this category yet. Check back soon.
            </p>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5"
            >
              {visibleEvents.map((session) => (
                <motion.button
                  key={session.id}
                  type="button"
                  onClick={() => openRegistration(session.registration_url)}
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}
                  whileTap={{ scale: 0.98 }}
                  className="konnect-event-tile text-left w-full"
                  style={{
                    background: session.tile_color,
                    color: "#fff",
                    minHeight: "140px",
                    padding: "16px",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    border: "none",
                    cursor: session.registration_url ? "pointer" : "default",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 800,
                        fontSize: "10px",
                        letterSpacing: "3px",
                        textTransform: "uppercase",
                        opacity: 0.8,
                        display: "block",
                      }}
                    >
                      {session.month_label}
                    </span>
                  </div>

                  <span
                    aria-hidden
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 800,
                      fontSize: "56px",
                      lineHeight: 0.9,
                      letterSpacing: "-3px",
                      color: "rgba(0, 0, 0, 0.15)",
                      position: "absolute",
                      top: "8px",
                      right: "12px",
                    }}
                  >
                    {session.day_label}
                  </span>

                  <div>
                    <div
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: "10px",
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                        opacity: 0.85,
                        marginBottom: "4px",
                      }}
                    >
                      {session.category}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 700,
                        fontSize: "14px",
                        color: "#fff",
                      }}
                    >
                      {session.title}
                    </div>
                    {session.ko_coins_earned != null && (
                      <p className="text-[9px] mt-1 opacity-80">🪙 Earn {session.ko_coins_earned} KO</p>
                    )}
                  </div>

                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      right: "12px",
                      bottom: "12px",
                      fontSize: "28px",
                      opacity: 0.2,
                    }}
                  >
                    {session.icon}
                  </span>
                  {session.registration_url && (
                    <ExternalLink
                      size={12}
                      className="absolute top-3 left-3 opacity-40"
                      aria-hidden
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </section>

        {featured.is_visible && (
          <section className="px-6 pb-12 sm:px-8 lg:px-10">
            <p
              style={{
                fontSize: "10px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "rgba(240, 232, 213, 0.4)",
                marginBottom: "14px",
                fontFamily: "'Rajdhani', sans-serif",
              }}
            >
              {settings.featured_section_label}
            </p>

            <div
              style={{
                background: "#2A3544",
                border: `1px solid ${featured.border_color}33`,
                borderLeft: `4px solid ${featured.border_color}`,
              }}
              className="grid grid-cols-1 lg:grid-cols-[minmax(120px,1fr)_2fr_auto]"
            >
              <div
                style={{
                  background: `linear-gradient(135deg, ${featured.icon_bg_start}, ${featured.icon_bg_end})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "48px",
                  padding: "24px",
                  minHeight: "120px",
                }}
              >
                {featured.icon}
              </div>

              <div className="p-5 sm:p-6">
                <p
                  style={{
                    fontSize: "9px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: accent,
                    marginBottom: "6px",
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                >
                  {featured.badge_text}
                </p>
                <h2
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: "20px",
                    marginBottom: "8px",
                    color: "#F0E8D5",
                  }}
                >
                  {featured.title}
                </h2>
                <p
                  style={{
                    fontSize: "11px",
                    color: "rgba(240, 232, 213, 0.6)",
                    marginBottom: "10px",
                    lineHeight: 1.7,
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                >
                  {featured.description}
                </p>
                <div className="flex flex-wrap gap-4 text-[11px] font-['Rajdhani',sans-serif]">
                  <span className="flex items-center gap-1.5 text-[rgba(240,232,213,0.85)]">
                    <Calendar size={14} className="opacity-70" />
                    {featured.schedule_text}
                  </span>
                  <span className="flex items-center gap-1.5 text-[rgba(240,232,213,0.85)]">
                    <Users size={14} className="opacity-70" />
                    {featured.seats_text}
                  </span>
                  <span style={{ color: "#C9A84C" }}>🪙 {featured.ko_coins_text}</span>
                </div>
              </div>

              <div className="p-5 sm:p-6 flex flex-col items-start lg:items-end justify-center gap-2 border-t lg:border-t-0 lg:border-l border-[rgba(255,107,53,0.15)]">
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: "24px",
                    color: "#F0E8D5",
                  }}
                >
                  {featured.price_inr}
                </div>
                <p
                  style={{
                    fontSize: "10px",
                    color: "#C9A84C",
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                >
                  {featured.price_ko_coins}
                </p>
                <button
                  type="button"
                  onClick={() => openRegistration(featured.button_url)}
                  style={{
                    background: featured.button_color,
                    color: "#fff",
                    fontFamily: "'Rajdhani', sans-serif",
                    fontWeight: 700,
                    fontSize: "11px",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    padding: "10px 20px",
                    border: "none",
                    cursor: featured.button_url ? "pointer" : "default",
                    marginTop: "4px",
                    opacity: featured.button_url ? 1 : 0.6,
                  }}
                  className="hover:opacity-90 active:scale-95 transition-all"
                >
                  {featured.button_label}
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </motion.div>
  );
};

export default Konnect;
