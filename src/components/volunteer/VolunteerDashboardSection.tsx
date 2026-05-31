import { Briefcase, Calendar, MapPin, Megaphone, Pin } from "lucide-react";
import { Link } from "react-router-dom";
import { VolunteerDashboard, VolunteerGig } from "@/types/about";

const locationLabel: Record<string, string> = {
  remote: "Remote",
  "in-person": "In person",
  hybrid: "Hybrid",
};

const gigStatusStyle: Record<string, string> = {
  open: "text-[#6BBFB5] border-[#6BBFB5]/40",
  assigned: "text-[#C9A84C] border-[#C9A84C]/40",
  in_progress: "text-[#4895EF] border-[#4895EF]/40",
  completed: "text-[#4CAF50] border-[#4CAF50]/40",
  cancelled: "text-[rgba(240,232,213,0.35)] border-white/10",
};

const GigCard = ({ gig, mine }: { gig: VolunteerGig; mine?: boolean }) => (
  <div
    className={`border p-4 ${mine ? "border-[#C9A84C]/30 bg-[#C9A84C]/5" : "border-white/10 bg-[rgba(240,232,213,0.02)]"}`}
  >
    <div className="flex flex-wrap justify-between gap-2 mb-2">
      <h4 className="font-bold text-sm">{gig.title}</h4>
      <span
        className={`text-[9px] uppercase tracking-[2px] px-2 py-0.5 border ${gigStatusStyle[gig.status] ?? gigStatusStyle.open}`}
      >
        {gig.status.replace("_", " ")}
      </span>
    </div>
    {gig.description && (
      <p className="text-xs text-[rgba(240,232,213,0.5)] leading-relaxed mb-3">{gig.description}</p>
    )}
    <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)]">
      {gig.location && (
        <span className="flex items-center gap-1">
          <MapPin size={11} /> {gig.location}
        </span>
      )}
      {gig.due_date && (
        <span className="flex items-center gap-1">
          <Calendar size={11} /> {new Date(gig.due_date).toLocaleDateString()}
        </span>
      )}
      {gig.ko_coins_reward > 0 && <span>🪙 {gig.ko_coins_reward} KO Coins</span>}
      {gig.role?.title && <span>{gig.role.icon} {gig.role.title}</span>}
    </div>
  </div>
);

type VolunteerDashboardSectionProps = {
  dashboard: VolunteerDashboard;
};

const VolunteerDashboardSection = ({ dashboard }: VolunteerDashboardSectionProps) => {
  const { profile, role, notices, myGigs, openGigs } = dashboard;
  const location = profile?.location;
  const availability = profile?.availability;

  return (
    <section className="py-12 px-6 lg:px-12 border-b border-[rgba(201,168,76,0.15)] bg-gradient-to-br from-[#0A1520] to-[#0B1828]">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[3px] text-[#C9A84C] mb-2">Volunteer hub</p>
            <h2 className="text-2xl font-extrabold" style={{ fontFamily: "'Syne', sans-serif" }}>
              Your volunteer details
            </h2>
          </div>
          <Link
            to="/volunteer"
            className="text-[10px] uppercase tracking-[2px] text-[#C9A84C] hover:underline shrink-0"
          >
            Volunteer page →
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mb-10">
          <div className="border border-[#C9A84C]/25 bg-[#C9A84C]/5 p-5">
            <p className="text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] mb-2">Your role</p>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{role?.icon ?? "🤝"}</span>
              <div>
                <p className="font-bold text-lg">{role?.title ?? "Volunteer"}</p>
                {role?.commitment && (
                  <p className="text-xs text-[rgba(240,232,213,0.45)] mt-1">{role.commitment}</p>
                )}
                {role?.location_type && (
                  <p className="text-[10px] uppercase tracking-[2px] text-[#C9A84C] mt-2">
                    {locationLabel[role.location_type] ?? role.location_type}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border border-white/10 p-5">
            <p className="text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] mb-2">Location</p>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#6BBFB5]" />
              <span className="font-bold">{location || "Not set"}</span>
            </div>
            {availability && (
              <p className="text-xs text-[rgba(240,232,213,0.45)] mt-3">
                Availability: <span className="text-[#F0E8D5]">{availability}</span>
              </p>
            )}
          </div>

          <div className="border border-white/10 p-5">
            <p className="text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] mb-2">Active gigs</p>
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-[#FF6B35]" />
              <span className="font-bold text-2xl" style={{ fontFamily: "'Syne', sans-serif" }}>
                {myGigs.length}
              </span>
              <span className="text-xs text-[rgba(240,232,213,0.45)]">assigned</span>
            </div>
            {openGigs.length > 0 && (
              <p className="text-xs text-[#6BBFB5] mt-3">{openGigs.length} open gig{openGigs.length !== 1 ? "s" : ""} available</p>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Megaphone size={16} className="text-[#4895EF]" />
              <h3 className="text-[11px] uppercase tracking-[3px] text-[rgba(240,232,213,0.4)]">
                Notices & updates
              </h3>
            </div>
            <div className="space-y-3">
              {notices.length === 0 && (
                <div className="border border-dashed border-white/10 p-6 text-sm text-[rgba(240,232,213,0.4)]">
                  No notices yet — check back for team updates and announcements.
                </div>
              )}
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className={`border p-4 ${notice.is_pinned ? "border-[#4895EF]/40 bg-[#4895EF]/5" : "border-white/10"}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-sm">{notice.title}</h4>
                    {notice.is_pinned && (
                      <Pin size={14} className="text-[#4895EF] shrink-0" aria-label="Pinned" />
                    )}
                  </div>
                  <p className="text-sm text-[rgba(240,232,213,0.55)] leading-relaxed whitespace-pre-wrap">
                    {notice.body}
                  </p>
                  {notice.created_at && (
                    <p className="text-[10px] text-[rgba(240,232,213,0.3)] mt-3 uppercase tracking-[2px]">
                      {new Date(notice.created_at).toLocaleDateString()}
                      {notice.user_id ? " · For you" : " · All volunteers"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Briefcase size={16} className="text-[#C9A84C]" />
                <h3 className="text-[11px] uppercase tracking-[3px] text-[rgba(240,232,213,0.4)]">
                  Your gigs
                </h3>
              </div>
              <div className="space-y-3">
                {myGigs.length === 0 && (
                  <div className="border border-dashed border-[#C9A84C]/20 p-6 text-sm text-[rgba(240,232,213,0.4)]">
                    No gigs assigned yet. The team will post tasks here when they need your help.
                  </div>
                )}
                {myGigs.map((gig) => (
                  <GigCard key={gig.id} gig={gig} mine />
                ))}
              </div>
            </div>

            {openGigs.length > 0 && (
              <div>
                <h3 className="text-[11px] uppercase tracking-[3px] text-[#6BBFB5] mb-4">
                  Open gigs — available to claim
                </h3>
                <div className="space-y-3">
                  {openGigs.map((gig) => (
                    <GigCard key={gig.id} gig={gig} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VolunteerDashboardSection;
