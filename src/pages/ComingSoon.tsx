import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getComingSoonConfig, LIVE_LAUNCH_LINKS } from "@/config/comingSoonPages";

const DEFAULT_CONFIG = {
  title: "Something new",
  subtitle: "On its way",
  description: "We are building this part of Kommuniti. Check back soon.",
  accentColor: "#C9A84C",
  icon: Sparkles,
};

const ComingSoon = () => {
  const { pathname } = useLocation();
  const config = getComingSoonConfig(pathname) ?? DEFAULT_CONFIG;

  return (
    <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-[72px] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-30"
          style={{ background: config.accentColor }}
        />

        <section className="container mx-auto px-6 lg:px-12 py-16 lg:py-24 relative">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] hover:text-[#F0E8D5] mb-12 transition-colors"
          >
            <ArrowLeft size={14} /> Back to home
          </Link>

          <div className="max-w-3xl">
            <div
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[3px] px-3 py-1.5 mb-8 border"
              style={{
                color: config.accentColor,
                borderColor: `${config.accentColor}40`,
                background: `${config.accentColor}10`,
              }}
            >
              <Sparkles size={12} />
              Coming soon
            </div>

            <div className="flex items-start gap-5 mb-6">
              {(() => {
                const ConfigIcon = config.icon;
                return <ConfigIcon size={52} style={{ color: config.accentColor }} />;
              })()}
              <div>
                <p
                  className="text-[11px] uppercase tracking-[3px] mb-2"
                  style={{ color: config.accentColor }}
                >
                  {config.subtitle}
                </p>
                <h1
                  className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.95] tracking-[-0.04em]"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {config.title}
                </h1>
              </div>
            </div>

            <p className="text-lg sm:text-xl text-[rgba(240,232,213,0.62)] leading-relaxed max-w-2xl mb-10">
              {config.description}
            </p>

            <div
              className="border p-6 sm:p-8 mb-12"
              style={{
                borderColor: `${config.accentColor}25`,
                background: `linear-gradient(135deg, ${config.accentColor}08, transparent)`,
              }}
            >
              <p className="text-[10px] uppercase tracking-[3px] text-[rgba(240,232,213,0.38)] mb-3">
                While you wait
              </p>
              <p className="text-[rgba(240,232,213,0.55)] leading-relaxed">
                Konnect, KO Reads, About, and Volunteer are live now. Kommute, Kores, Kreate, and more are on the way.
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[3px] text-[rgba(240,232,213,0.38)] mb-4">
                Explore what&apos;s live
              </p>
              <div className="flex flex-wrap gap-3">
                {LIVE_LAUNCH_LINKS.map((link) => {
                  const LinkIcon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="group inline-flex items-center gap-2 border border-white/10 px-4 py-3 text-[11px] uppercase tracking-[2px] font-bold hover:border-white/25 transition-all"
                      style={{ color: link.color }}
                    >
                      <LinkIcon size={14} style={{ color: link.color }} />
                      {link.label}
                      <ArrowRight
                        size={14}
                        className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ComingSoon;
