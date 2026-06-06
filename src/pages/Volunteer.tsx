import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  ArrowRight, 
  Clock, 
  Heart, 
  MapPin,
  Coins, 
  GraduationCap, 
  Compass, 
  Award, 
  Map, 
  HeartHandshake, 
  BookOpen, 
  PenTool, 
  Settings, 
  Globe, 
  HelpCircle,
  LucideIcon 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VolunteerApplyForm from "@/components/volunteer/VolunteerApplyForm";
import { fetchVolunteerPageData } from "@/lib/about";
import {
  VolunteerBenefit,
  VolunteerFormField,
  VolunteerFormSettings,
  VolunteerPageSettings,
  VolunteerRole,
} from "@/types/about";

const locationLabel: Record<string, string> = {
  remote: "Remote",
  "in-person": "In person",
  hybrid: "Hybrid",
};

export function getVolunteerPremiumIcon(iconStr: string): LucideIcon {
  const norm = (iconStr || "").trim();
  switch (norm) {
    case "🪙":
      return Coins;
    case "🎓":
      return GraduationCap;
    case "🌻":
      return Compass;
    case "📜":
      return Award;
    case "🗺️":
      return Map;
    case "🤝":
      return HeartHandshake;
    case "📖":
      return BookOpen;
    case "✍️":
      return PenTool;
    case "📍":
      return MapPin;
    case "⚙️":
      return Settings;
    case "🌍":
      return Globe;
    default:
      return HelpCircle;
  }
}

const Volunteer = () => {
  const [searchParams] = useSearchParams();
  const preselectedRoleId = searchParams.get("role");
  const [loading, setLoading] = useState(true);
  const [pageSettings, setPageSettings] = useState<VolunteerPageSettings | null>(null);
  const [benefits, setBenefits] = useState<VolunteerBenefit[]>([]);
  const [roles, setRoles] = useState<VolunteerRole[]>([]);
  const [volunteerSettings, setVolunteerSettings] = useState<VolunteerFormSettings | null>(null);
  const [volunteerFields, setVolunteerFields] = useState<VolunteerFormField[]>([]);

  useEffect(() => {
    fetchVolunteerPageData().then((data) => {
      setPageSettings(data.pageSettings);
      setBenefits(data.benefits);
      setRoles(data.roles);
      setVolunteerSettings(data.volunteerSettings);
      setVolunteerFields(data.volunteerFields);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading && searchParams.get("apply") !== null) {
      document.getElementById("apply")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading, searchParams]);

  const featuredRoles = useMemo(() => roles.filter((r) => r.is_featured), [roles]);
  const otherRoles = useMemo(() => roles.filter((r) => !r.is_featured), [roles]);
  const accent = pageSettings?.accent_color ?? "#C9A84C";

  if (loading || !pageSettings || !volunteerSettings) {
    return (
      <div className="min-h-screen bg-[#0B1828] flex items-center justify-center text-[#C9A84C] uppercase tracking-[4px] text-xs">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5]">
      <Navbar />
      <main className="pt-[72px]">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-[rgba(201,168,76,0.12)]">
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(201,168,76,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.05) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="container mx-auto px-6 lg:px-12 py-16 lg:py-24 relative">
            <p className="text-[11px] uppercase tracking-[3px] mb-4" style={{ color: accent }}>
              {pageSettings.hero_eyebrow}
            </p>
            <h1
              className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[0.95] tracking-[-0.03em] max-w-4xl mb-4"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {pageSettings.hero_title}
            </h1>
            <p className="text-xl sm:text-2xl italic mb-6" style={{ color: accent }}>
              {pageSettings.hero_subtitle}
            </p>
            <p className="text-lg text-[rgba(240,232,213,0.6)] max-w-3xl leading-relaxed mb-8">
              {pageSettings.hero_description}
            </p>
            <a
              href="#apply"
              className="inline-flex items-center gap-2 px-8 py-3 text-[11px] uppercase tracking-[2px] font-bold text-[#0B1828]"
              style={{ background: accent }}
            >
              Apply now <ArrowRight size={14} />
            </a>
          </div>
        </section>

        {/* Benefits */}
        {benefits.length > 0 && (
          <section className="container mx-auto px-6 lg:px-12 py-16 lg:py-20">
            <p className="text-[11px] uppercase tracking-[3px] text-[rgba(240,232,213,0.45)] mb-3">
              {pageSettings.benefits_section_label}
            </p>
            <p className="text-lg text-[rgba(240,232,213,0.55)] max-w-3xl mb-10 leading-relaxed">
              {pageSettings.benefits_intro}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {benefits.map((benefit) => (
                <div
                  key={benefit.id}
                  className="border border-white/10 p-6 hover:border-[rgba(201,168,76,0.3)] transition-colors"
                  style={{ borderLeftWidth: 3, borderLeftColor: accent }}
                >
                  {(() => {
                    const BenefitIcon = getVolunteerPremiumIcon(benefit.icon);
                    return (
                      <div className="mb-3 text-[rgba(240,232,213,0.85)]">
                        <BenefitIcon size={28} style={{ color: accent }} />
                      </div>
                    );
                  })()}
                  <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-sm text-[rgba(240,232,213,0.55)] leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Featured roles */}
        {featuredRoles.length > 0 && (
          <section className="bg-[#060D16] border-y border-[rgba(201,168,76,0.12)]">
            <div className="container mx-auto px-6 lg:px-12 py-16 lg:py-20">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[3px] text-[#FF6B35] mb-2">
                    {pageSettings.featured_roles_label}
                  </p>
                  <h2 className="text-3xl font-extrabold" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {pageSettings.roles_section_label}
                  </h2>
                </div>
              </div>
              <p className="text-[rgba(240,232,213,0.55)] max-w-2xl mb-10">{pageSettings.roles_intro}</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredRoles.map((role) => (
                  <div
                    key={role.id}
                    className="border border-[#FF6B35]/25 bg-[#FF6B35]/5 p-6 flex flex-col"
                  >
                    {(() => {
                      const RoleIcon = getVolunteerPremiumIcon(role.icon);
                      return (
                        <div className="mb-3">
                          <RoleIcon size={24} style={{ color: "#FF6B35" }} />
                        </div>
                      );
                    })()}
                    <h3 className="font-bold text-xl mb-2">{role.title}</h3>
                    <p className="text-sm text-[rgba(240,232,213,0.55)] leading-relaxed flex-1 mb-4">
                      {role.description}
                    </p>
                    <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] mb-4">
                      {role.commitment && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {role.commitment}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {locationLabel[role.location_type] ?? role.location_type}
                      </span>
                    </div>
                    <Link
                      to={`/volunteer?apply&role=${role.id}`}
                      className="text-[10px] uppercase tracking-[2px] font-bold text-[#FF6B35] hover:underline"
                    >
                      Apply for this role →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All roles */}
        {otherRoles.length > 0 && (
          <section className="container mx-auto px-6 lg:px-12 py-16">
            <h3 className="text-[11px] uppercase tracking-[3px] text-[rgba(240,232,213,0.45)] mb-6">
              {pageSettings.all_roles_label}
            </h3>
            <div className="space-y-3">
              {otherRoles.map((role) => (
                <div
                  key={role.id}
                  className="border border-white/10 p-5 flex flex-wrap justify-between gap-4 items-center hover:border-white/20"
                >
                  <div className="flex items-start gap-4">
                    {(() => {
                      const RoleIcon = getVolunteerPremiumIcon(role.icon);
                      return (
                        <span className="p-2 bg-white/5 border border-white/10 rounded-sm shrink-0" style={{ color: accent }}>
                          <RoleIcon size={20} />
                        </span>
                      );
                    })()}
                    <div>
                      <div className="font-bold">{role.title}</div>
                      <p className="text-sm text-[rgba(240,232,213,0.5)] mt-1 max-w-xl">{role.description}</p>
                      <div className="flex gap-3 mt-2 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.35)]">
                        {role.commitment && <span>{role.commitment}</span>}
                        <span>{locationLabel[role.location_type]}</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/volunteer?apply&role=${role.id}`}
                    className="text-[10px] uppercase tracking-[2px] font-bold shrink-0"
                    style={{ color: accent }}
                  >
                    Apply →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Apply form */}
        <section id="apply" className="scroll-mt-[88px] border-t border-[rgba(201,168,76,0.12)]">
          <div className="container mx-auto px-6 lg:px-12 py-16 lg:py-24">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <Heart size={18} style={{ color: accent }} />
                <p className="text-[11px] uppercase tracking-[3px] text-[rgba(240,232,213,0.45)]">
                  {pageSettings.form_section_label}
                </p>
              </div>
              <h2
                className="text-3xl font-extrabold mb-3"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {pageSettings.cta_title}
              </h2>
              <p className="text-[rgba(240,232,213,0.55)] mb-10 leading-relaxed">{pageSettings.cta_description}</p>

              <VolunteerApplyForm
                accentColor={accent}
                volunteerSettings={volunteerSettings}
                volunteerFields={volunteerFields}
                roles={roles}
                preselectedRoleId={preselectedRoleId}
                showHeader={false}
                startExpanded={searchParams.has("apply")}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Volunteer;
