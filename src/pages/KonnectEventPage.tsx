import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { EventMetaRow, PostEventRecap, RsvpSection } from "@/components/konnect/KonnectEventSections";
import {
  fetchKonnectEventById,
  fetchKonnectPageData,
  fetchKonnectRsvpCount,
  isEventPast,
} from "@/lib/konnect";
import { DEFAULT_PAGE_SETTINGS, KonnectEvent, KonnectPageSettings } from "@/types/konnect";

const KonnectEventPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState<KonnectEvent | null>(null);
  const [settings, setSettings] = useState<KonnectPageSettings>(DEFAULT_PAGE_SETTINGS);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    const load = async () => {
      setLoading(true);
      const [pageRes, eventRes] = await Promise.all([
        fetchKonnectPageData(),
        fetchKonnectEventById(eventId),
      ]);
      setSettings(pageRes.settings);
      setEvent(eventRes.event);
      if (eventRes.event) {
        const count = await fetchKonnectRsvpCount(eventId);
        setRsvpCount(count);
      }
      setLoading(false);
    };
    load();
  }, [eventId]);

  const accent = settings.accent_color || "#FF6B35";
  const past = event ? isEventPast(event) : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5] flex items-center justify-center">
        <p className="text-[10px] uppercase tracking-[4px] text-[rgba(240,232,213,0.4)]">Loading session…</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5] flex flex-col items-center justify-center gap-4">
        <p>Session not found.</p>
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
          className="relative px-6 py-12 sm:px-10 overflow-hidden"
          style={{ background: event.tile_color, minHeight: "220px" }}
        >
          <Link
            to="/konnect"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-white/70 hover:text-white mb-6 relative z-10"
          >
            <ArrowLeft size={14} /> Back to Konnect
          </Link>

          <span
            className="absolute top-4 right-6 text-[120px] font-extrabold leading-none opacity-15 select-none"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {event.day_label}
          </span>

          <p className="text-[10px] uppercase tracking-[3px] opacity-80 mb-2 relative z-10">{event.month_label}</p>
          <p className="text-[11px] uppercase tracking-[2px] opacity-90 mb-2 relative z-10">{event.category}</p>
          <h1
            className="text-3xl sm:text-4xl font-extrabold text-white relative z-10 max-w-3xl"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {event.title}
          </h1>
          <span className="text-4xl absolute bottom-6 right-8 opacity-25">{event.icon}</span>
          {past && (
            <span className="inline-block mt-4 px-3 py-1 bg-black/30 text-[10px] uppercase tracking-widest relative z-10">
              Past session
            </span>
          )}
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10 sm:px-8">
          <EventMetaRow
            sessionType={event.session_type}
            location={event.location}
            schedule={event.schedule_detail || (event.event_date ? event.event_date : null)}
            koCoins={event.ko_coins_earned != null ? `Earn ${event.ko_coins_earned} KO` : undefined}
            capacity={event.capacity}
            rsvpCount={rsvpCount}
          />

          {(event.long_description || event.category) && (
            <div className="mt-8 text-sm text-[rgba(240,232,213,0.7)] leading-relaxed whitespace-pre-wrap">
              {event.long_description ||
                `Join us for ${event.category} — a ${event.session_type.replace("-", " ")} session on Kommuniti Konnect.`}
            </div>
          )}

          <RsvpSection
            enabled={event.rsvp_enabled !== false}
            isPast={past}
            scope="event"
            eventId={event.id}
            accent={accent}
            sectionLabel={settings.rsvp_section_label || "RSVP"}
            submitLabel="Confirm RSVP"
          />

          {(past || event.post_event_message || (event.post_event_images?.length ?? 0) > 0) && (
            <PostEventRecap
              message={event.post_event_message}
              images={event.post_event_images ?? []}
              sectionLabel={settings.post_event_section_label || "Event recap"}
            />
          )}
        </div>
      </main>

      <Footer />
    </motion.div>
  );
};

export default KonnectEventPage;
