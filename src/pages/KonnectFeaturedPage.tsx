import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { EventMetaRow, PostEventRecap, RsvpSection } from "@/components/konnect/KonnectEventSections";
import { fetchKonnectFeatured, fetchKonnectPageData, fetchKonnectRsvpCount } from "@/lib/konnect";
import { DEFAULT_FEATURED, DEFAULT_PAGE_SETTINGS, KonnectFeatured, KonnectPageSettings } from "@/types/konnect";

const KonnectFeaturedPage = () => {
  const [featured, setFeatured] = useState<KonnectFeatured>(DEFAULT_FEATURED);
  const [settings, setSettings] = useState<KonnectPageSettings>(DEFAULT_PAGE_SETTINGS);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [pageRes, featuredRes] = await Promise.all([fetchKonnectPageData(), fetchKonnectFeatured()]);
      setSettings(pageRes.settings);
      setFeatured(featuredRes.featured);
      const count = await fetchKonnectRsvpCount(null, true);
      setRsvpCount(count);
      setLoading(false);
    };
    load();
  }, []);

  const accent = featured.button_color || settings.accent_color || "#FF6B35";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1828] flex items-center justify-center text-[#F0E8D5]">
        <p className="text-[10px] uppercase tracking-[4px] text-[rgba(240,232,213,0.4)]">Loading…</p>
      </div>
    );
  }

  if (!featured.is_visible) {
    return (
      <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5] flex flex-col items-center justify-center gap-4">
        <p>Featured workshop is not available.</p>
        <Link to="/konnect" className="text-[#FF6B35] text-sm uppercase tracking-widest">
          ← Back to Konnect
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#0B1828] text-[#F0E8D5]">
      <Navbar />

      <main className="pt-[72px]">
        <div
          className="px-6 py-12 sm:px-10 border-b"
          style={{
            background: `linear-gradient(135deg, ${featured.icon_bg_start}, ${featured.icon_bg_end})`,
            borderColor: `${featured.border_color}33`,
          }}
        >
          <Link
            to="/konnect"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.6)] hover:text-[#F0E8D5] mb-6"
          >
            <ArrowLeft size={14} /> Back to Konnect
          </Link>
          <span className="text-5xl block mb-4">{featured.icon}</span>
          <p className="text-[9px] uppercase tracking-[2px] mb-2" style={{ color: accent }}>
            {featured.badge_text}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold" style={{ fontFamily: "'Syne', sans-serif" }}>
            {featured.title}
          </h1>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10 sm:px-8">
          <EventMetaRow
            location={featured.location}
            schedule={featured.schedule_text}
            seats={featured.seats_text}
            koCoins={featured.ko_coins_text}
            rsvpCount={rsvpCount}
          />

          <p className="mt-6 text-sm text-[rgba(240,232,213,0.7)] leading-relaxed whitespace-pre-wrap">
            {featured.description}
          </p>

          <div className="mt-6 flex flex-wrap items-baseline gap-4">
            <span className="text-2xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
              {featured.price_inr}
            </span>
            <span className="text-sm text-[#C9A84C]">{featured.price_ko_coins}</span>
          </div>

          <RsvpSection
            enabled={featured.rsvp_enabled !== false}
            isPast={false}
            scope="featured"
            accent={accent}
            sectionLabel={settings.rsvp_section_label || "RSVP"}
            submitLabel={featured.button_label || "Confirm RSVP"}
            brochureUrl={featured.brochure_url}
            waGroupLink={featured.wa_group_link}
            postRsvpMessage={featured.post_rsvp_message}
          />

          <PostEventRecap
            message={featured.post_event_message}
            images={featured.post_event_images ?? []}
            sectionLabel={settings.post_event_section_label || "Event recap"}
          />
        </div>
      </main>

      <Footer />
    </motion.div>
  );
};

export default KonnectFeaturedPage;
