import { supabase } from "@/lib/supabase";
import {
  DEFAULT_FEATURED,
  DEFAULT_KONNECT_RSVP_FIELDS,
  DEFAULT_PAGE_SETTINGS,
  KonnectEvent,
  KonnectFeatured,
  KonnectFilterTab,
  KonnectPageSettings,
  KonnectRsvpAppliesTo,
  KonnectRsvpField,
  KonnectSessionType,
  parsePostEventImages,
} from "@/types/konnect";

function todayStart() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

export function normalizeEvent(row: KonnectEvent): KonnectEvent {
  return {
    ...row,
    post_event_images: parsePostEventImages(row.post_event_images),
    rsvp_enabled: row.rsvp_enabled !== false,
  };
}

export function normalizeFeatured(row: KonnectFeatured): KonnectFeatured {
  return {
    ...row,
    post_event_images: parsePostEventImages(row.post_event_images),
    rsvp_enabled: row.rsvp_enabled !== false,
  };
}

export function isEventPast(event: Pick<KonnectEvent, "event_date">): boolean {
  if (!event.event_date) return false;
  const d = new Date(event.event_date + "T12:00:00");
  return d < todayStart();
}

export function partitionKonnectEvents(events: KonnectEvent[]) {
  const upcoming: KonnectEvent[] = [];
  const past: KonnectEvent[] = [];
  for (const e of events) {
    if (isEventPast(e)) past.push(e);
    else upcoming.push(e);
  }
  past.sort((a, b) => {
    const da = a.event_date ? new Date(a.event_date).getTime() : 0;
    const db = b.event_date ? new Date(b.event_date).getTime() : 0;
    return db - da;
  });
  return { upcoming, past };
}

export async function fetchKonnectPageData() {
  const [settingsRes, eventsRes, featuredRes] = await Promise.all([
    supabase.from("konnect_page_settings").select("*").eq("id", 1).maybeSingle(),
    supabase
      .from("konnect_events")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    supabase.from("konnect_featured").select("*").eq("id", 1).maybeSingle(),
  ]);

  const events = ((eventsRes.data as KonnectEvent[] | null) ?? []).map(normalizeEvent);

  return {
    settings: (settingsRes.data as KonnectPageSettings | null) ?? DEFAULT_PAGE_SETTINGS,
    events,
    featured: normalizeFeatured((featuredRes.data as KonnectFeatured | null) ?? DEFAULT_FEATURED),
    error: settingsRes.error || eventsRes.error || featuredRes.error,
  };
}

export async function fetchKonnectEventById(id: string) {
  const { data, error } = await supabase
    .from("konnect_events")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();
  return { event: data ? normalizeEvent(data as KonnectEvent) : null, error };
}

export async function fetchKonnectFeatured() {
  const { data, error } = await supabase.from("konnect_featured").select("*").eq("id", 1).maybeSingle();
  return {
    featured: data ? normalizeFeatured(data as KonnectFeatured) : DEFAULT_FEATURED,
    error,
  };
}

export function filterKonnectEvents(
  events: KonnectEvent[],
  tab: KonnectFilterTab
): KonnectEvent[] {
  const { upcoming } = partitionKonnectEvents(events);

  if (tab === "upcoming") {
    return upcoming;
  }

  return upcoming.filter((e) => e.session_type === (tab as KonnectSessionType));
}

export async function fetchKonnectRsvpFields(
  scope: KonnectRsvpAppliesTo,
  eventId?: string | null
): Promise<KonnectRsvpField[]> {
  const { data, error } = await supabase
    .from("konnect_rsvp_fields")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error?.code === "42P01") {
    return DEFAULT_KONNECT_RSVP_FIELDS.map((f, i) => ({ ...f, id: `default-${i}` }));
  }
  if (error || !data?.length) {
    return DEFAULT_KONNECT_RSVP_FIELDS.map((f, i) => ({ ...f, id: `default-${i}` }));
  }

  const fields = (data as KonnectRsvpField[]).map((f) => ({
    ...f,
    options: Array.isArray(f.options) ? f.options : [],
  }));

  return fields.filter((f) => {
    if (f.applies_to === "all") return true;
    if (scope === "featured" && f.applies_to === "featured") return true;
    if (scope === "event" && f.applies_to === "event" && (!f.event_id || f.event_id === eventId)) return true;
    return false;
  });
}

export function validateRsvpResponses(
  fields: KonnectRsvpField[],
  values: Record<string, string>
): string | null {
  for (const field of fields) {
    const val = String(values[field.field_key] ?? "").trim();
    if (field.is_required && !val) return `${field.label} is required`;
    if (field.field_type === "email" && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      return `${field.label} must be a valid email`;
    }
  }
  return null;
}

export async function submitKonnectRsvp(payload: {
  eventId?: string | null;
  isFeatured?: boolean;
  userId?: string | null;
  attendeeName: string;
  attendeeEmail: string;
  responses: Record<string, string>;
}) {
  const { error } = await supabase.from("konnect_rsvps").insert({
    event_id: payload.eventId ?? null,
    is_featured: payload.isFeatured ?? false,
    user_id: payload.userId ?? null,
    attendee_name: payload.attendeeName,
    attendee_email: payload.attendeeEmail.trim().toLowerCase(),
    responses: payload.responses,
  });
  return { error };
}

export async function fetchKonnectRsvpCount(eventId?: string | null, isFeatured?: boolean) {
  let q = supabase.from("konnect_rsvps").select("id", { count: "exact", head: true });
  if (isFeatured) q = q.eq("is_featured", true);
  else if (eventId) q = q.eq("event_id", eventId);
  else return 0;
  const { count } = await q;
  return count ?? 0;
}
