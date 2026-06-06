import { MapPin, Calendar, Users, Coins } from "lucide-react";
import KonnectRsvpForm from "@/components/konnect/KonnectRsvpForm";

type PostEventRecapProps = {
  message: string | null | undefined;
  images: string[];
  sectionLabel: string;
};

export function PostEventRecap({ message, images, sectionLabel }: PostEventRecapProps) {
  if (!message && images.length === 0) return null;

  return (
    <section className="mt-10 border-t border-[rgba(201,168,76,0.15)] pt-8">
      <p className="text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] mb-4 font-['Rajdhani',sans-serif]">
        {sectionLabel}
      </p>
      {message && (
        <p className="text-sm text-[rgba(240,232,213,0.75)] leading-relaxed mb-6 whitespace-pre-wrap">{message}</p>
      )}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {images.map((url) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden border border-[rgba(201,168,76,0.15)]">
              <img src={url} alt="" className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300" />
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

type EventMetaProps = {
  sessionType?: string;
  location?: string | null;
  schedule?: string | null;
  seats?: string | null;
  koCoins?: string | null;
  capacity?: number | null;
  rsvpCount?: number;
};

export function EventMetaRow({ sessionType, location, schedule, seats, koCoins, capacity, rsvpCount }: EventMetaProps) {
  return (
    <div className="flex flex-wrap gap-4 text-[11px] font-['Rajdhani',sans-serif] text-[rgba(240,232,213,0.85)]">
      {sessionType && (
        <span className="uppercase tracking-wider text-[#FF6B35]">{sessionType.replace("-", " ")}</span>
      )}
      {schedule && (
        <span className="flex items-center gap-1.5">
          <Calendar size={14} className="opacity-70" /> {schedule}
        </span>
      )}
      {location && (
        <span className="flex items-center gap-1.5">
          <MapPin size={14} className="opacity-70" /> {location}
        </span>
      )}
      {seats && (
        <span className="flex items-center gap-1.5">
          <Users size={14} className="opacity-70" /> {seats}
        </span>
      )}
      {capacity != null && rsvpCount != null && (
        <span className="flex items-center gap-1.5">
          <Users size={14} className="opacity-70" /> {rsvpCount} / {capacity} registered
        </span>
      )}
      {koCoins && (
        <span className="flex items-center gap-1.5" style={{ color: "#C9A84C" }}>
          <Coins size={14} /> {koCoins}
        </span>
      )}
    </div>
  );
}

type RsvpSectionProps = {
  enabled: boolean;
  isPast: boolean;
  scope: "event" | "featured";
  eventId?: string;
  accent: string;
  sectionLabel: string;
  submitLabel: string;
};

export function RsvpSection({
  enabled,
  isPast,
  scope,
  eventId,
  accent,
  sectionLabel,
  submitLabel,
}: RsvpSectionProps) {
  if (isPast) {
    return (
      <p className="text-sm text-[rgba(240,232,213,0.45)] italic py-4">
        This session has ended. See the recap below if available.
      </p>
    );
  }

  if (!enabled) return null;

  return (
    <section className="mt-10 border-t border-[rgba(201,168,76,0.15)] pt-8">
      <p className="text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] mb-6 font-['Rajdhani',sans-serif]">
        {sectionLabel}
      </p>
      <KonnectRsvpForm scope={scope} eventId={eventId} accent={accent} submitLabel={submitLabel} />
    </section>
  );
}
