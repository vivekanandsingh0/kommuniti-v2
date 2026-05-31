import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchAboutPageData } from "@/lib/about";
import {
  AboutDutyLine,
  AboutPageSettings,
  AboutPillar,
  AboutStat,
  AboutVoice,
} from "@/types/about";

const FadeIn = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-4 mb-6">
    <div className="w-3 h-3 bg-primary animate-pulse-glow" />
    <h2 className="font-pixel text-sm sm:text-base md:text-lg text-foreground">{children}</h2>
  </div>
);

const About = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<AboutPageSettings | null>(null);
  const [pillars, setPillars] = useState<AboutPillar[]>([]);
  const [stats, setStats] = useState<AboutStat[]>([]);
  const [dutyLines, setDutyLines] = useState<AboutDutyLine[]>([]);
  const [voices, setVoices] = useState<AboutVoice[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchAboutPageData();
      setSettings(data.settings);
      setPillars(data.pillars);
      setStats(data.stats);
      setDutyLines(data.dutyLines);
      setVoices(data.voices);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (location.hash === "#volunteer") {
      navigate("/volunteer", { replace: true });
    }
  }, [location.hash, navigate]);

  const accent = settings?.accent_color ?? "#C9A84C";

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center uppercase tracking-[4px] text-xs text-primary">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-[72px]">
        {/* Hero */}
        <section className="section-padding pixel-grid-hero border-b border-border relative overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            <FadeIn>
              <p className="font-pixel text-[9px] tracking-[0.35em] text-primary mb-4">{settings.hero_eyebrow}</p>
              <h1
                className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[0.95] tracking-[-0.03em] text-foreground mb-4"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {settings.hero_title}
              </h1>
              <p className="text-xl sm:text-2xl text-accent italic mb-6">{settings.hero_subtitle}</p>
              <p className="text-lg text-foreground/55 max-w-3xl leading-relaxed">{settings.hero_description}</p>
              <p className="mt-6 font-pixel text-[9px] tracking-[0.3em] text-foreground/35">{settings.company_tagline}</p>
            </FadeIn>
          </div>
        </section>

        {/* Mission */}
        <section className="section-padding pixel-grid-bg border-b border-border">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <SectionLabel>{settings.mission_section_label}</SectionLabel>
              <p className="text-indent text-xl sm:text-2xl md:text-3xl font-light text-foreground/70 leading-relaxed max-w-4xl">
                {settings.mission_text}
              </p>
            </FadeIn>
          </div>
        </section>

        {/* What is Kommuniti */}
        <section className="section-padding border-b border-border">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <SectionLabel>{settings.what_section_label}</SectionLabel>
              <p className="text-indent text-lg sm:text-xl text-foreground/55 leading-relaxed max-w-4xl">
                {settings.what_text}
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Stats */}
        {stats.length > 0 && (
          <section className="section-padding border-b border-border bg-card/20">
            <div className="max-w-6xl mx-auto">
              <FadeIn>
                <SectionLabel>{settings.stats_section_label}</SectionLabel>
              </FadeIn>
              <div className="grid sm:grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                  <FadeIn key={stat.id} delay={0.08 * i}>
                    <div className="border border-border p-8 text-center hover:border-primary/25 transition-colors">
                      <div className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: stat.color }}>
                        {stat.value}
                      </div>
                      <div className="text-[10px] uppercase tracking-[2px] text-foreground/40">{stat.label}</div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Pillars */}
        {pillars.length > 0 && (
          <section className="section-padding border-b border-border">
            <div className="max-w-6xl mx-auto">
              <FadeIn>
                <SectionLabel>{settings.pillars_section_label}</SectionLabel>
              </FadeIn>
              <div className="space-y-4">
                {pillars.map((pillar, i) => (
                  <FadeIn key={pillar.id} delay={0.08 * i}>
                    <div className="group border border-border hover:border-primary/30 transition-all overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div
                          className="md:w-1/3 p-8 sm:p-10 border-b md:border-b-0 md:border-r border-border bg-card/30"
                          style={{ borderLeftWidth: 3, borderLeftColor: pillar.accent_color }}
                        >
                          <div className="text-3xl mb-4">{pillar.icon}</div>
                          <h3 className="font-pixel text-xs mb-2" style={{ color: pillar.accent_color }}>
                            {pillar.title}
                          </h3>
                          <p className="text-lg font-semibold text-foreground">{pillar.subtitle}</p>
                        </div>
                        <div className="md:w-2/3 p-8 sm:p-10">
                          <p className="text-foreground/60 leading-relaxed mb-4">{pillar.description}</p>
                          {pillar.detail && (
                            <p className="text-foreground/40 leading-relaxed text-sm mb-4">{pillar.detail}</p>
                          )}
                          {pillar.link_href && (
                            <Link
                              to={pillar.link_href}
                              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[2px] font-bold hover:opacity-80"
                              style={{ color: pillar.accent_color }}
                            >
                              Explore {pillar.title} <ArrowRight size={12} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Duty */}
        {dutyLines.length > 0 && (
          <section className="section-padding pixel-grid-hero border-b border-border">
            <div className="max-w-4xl mx-auto">
              <FadeIn>
                <SectionLabel>{settings.duty_section_label}</SectionLabel>
                <div className="space-y-3 text-foreground/45 mb-10 text-sm sm:text-base leading-relaxed">
                  {dutyLines.map((line) => (
                    <p key={line.id}>{line.text}</p>
                  ))}
                </div>
                <p className="font-pixel text-[8px] sm:text-[9px] tracking-[0.3em] text-accent/70 mb-3">
                  {settings.duty_headline}
                </p>
                <p className="font-pixel text-[10px] tracking-[0.35em] text-primary">{settings.duty_footer}</p>
              </FadeIn>
            </div>
          </section>
        )}

        {/* Voices */}
        {voices.length > 0 && (
          <section className="section-padding border-b border-border">
            <div className="max-w-6xl mx-auto">
              <FadeIn>
                <SectionLabel>{settings.voices_section_label}</SectionLabel>
                <p className="text-lg text-foreground/40 mb-12">{settings.voices_subtitle}</p>
              </FadeIn>
              <div className="grid sm:grid-cols-2 gap-4">
                {voices.map((voice, i) => (
                  <FadeIn key={voice.id} delay={0.08 * i}>
                    <div className="border border-border p-8 h-full flex flex-col hover:border-primary/20 transition-colors">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 border-2 border-primary/30 flex items-center justify-center">
                          <span className="font-pixel text-[7px] text-primary/60">{voice.initials}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{voice.name}</p>
                          <p className="font-pixel text-[7px] text-foreground/30 tracking-wider">{voice.country}</p>
                        </div>
                      </div>
                      <p className="text-foreground/50 leading-relaxed text-sm flex-1">&ldquo;{voice.quote}&rdquo;</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Volunteer CTA */}
        <section id="volunteer" className="bg-[#0B1828] text-[#F0E8D5] border-b border-[rgba(201,168,76,0.12)] scroll-mt-[88px]">
          <div className="container mx-auto px-6 lg:px-12 py-16 lg:py-24">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Heart size={18} style={{ color: accent }} />
                <p className="text-[11px] uppercase tracking-[3px] text-[rgba(240,232,213,0.45)]">
                  {settings.volunteer_section_label}
                </p>
              </div>
              <h3
                className="text-3xl sm:text-4xl font-extrabold mb-4"
                style={{ fontFamily: "'Syne', sans-serif", color: accent }}
              >
                Help neighbourhoods become Kores
              </h3>
              <p className="text-[rgba(240,232,213,0.55)] leading-relaxed mb-8 max-w-xl mx-auto">
                Explore volunteer benefits, see open roles we are actively recruiting for, and apply on our dedicated volunteer page.
              </p>
              <Link
                to="/volunteer"
                className="inline-flex items-center gap-2 px-8 py-3 text-[11px] uppercase tracking-[2px] font-bold text-[#0B1828]"
                style={{ background: accent }}
              >
                View volunteer page <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* Company */}
        <section className="section-padding border-b border-border">
          <div className="max-w-6xl mx-auto text-center">
            <FadeIn>
              <SectionLabel>{settings.company_section_label}</SectionLabel>
              <p className="text-xl font-bold text-foreground mb-2">{settings.company_name}</p>
              <p className="text-sm text-foreground/45 mb-1">{settings.company_location}</p>
              <p className="text-xs text-foreground/35 font-mono">{settings.company_cin}</p>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
