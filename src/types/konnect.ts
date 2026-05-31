export type KonnectSessionType = "online" | "in-person" | "on-demand";

export type KonnectFilterTab = "upcoming" | KonnectSessionType;

export interface KonnectPageSettings {
  id: number;
  tagline: string;
  hero_line_1: string;
  hero_line_2: string;
  hero_line_3: string;
  sessions_section_label: string;
  featured_section_label: string;
  past_section_label?: string;
  rsvp_section_label?: string;
  post_event_section_label?: string;
  filter_upcoming_label: string;
  filter_online_label: string;
  filter_in_person_label: string;
  filter_on_demand_label: string;
  accent_color: string;
  updated_at?: string;
}

export interface KonnectEvent {
  id: string;
  sort_order: number;
  is_published: boolean;
  session_type: KonnectSessionType;
  event_date: string | null;
  month_label: string;
  day_label: string;
  category: string;
  title: string;
  icon: string;
  tile_color: string;
  registration_url: string | null;
  ko_coins_earned: number | null;
  long_description?: string | null;
  location?: string | null;
  schedule_detail?: string | null;
  capacity?: number | null;
  post_event_message?: string | null;
  post_event_images?: string[];
  rsvp_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface KonnectFeatured {
  id: number;
  is_visible: boolean;
  icon: string;
  badge_text: string;
  title: string;
  description: string;
  schedule_text: string;
  seats_text: string;
  ko_coins_text: string;
  price_inr: string;
  price_ko_coins: string;
  button_label: string;
  button_url: string | null;
  button_color: string;
  border_color: string;
  icon_bg_start: string;
  icon_bg_end: string;
  location?: string | null;
  post_event_message?: string | null;
  post_event_images?: string[];
  rsvp_enabled?: boolean;
  updated_at?: string;
}

export type KonnectRsvpFieldType = "text" | "email" | "tel" | "textarea" | "select";
export type KonnectRsvpAppliesTo = "all" | "event" | "featured";

export interface KonnectRsvpField {
  id: string;
  sort_order: number;
  is_active: boolean;
  applies_to: KonnectRsvpAppliesTo;
  event_id: string | null;
  field_key: string;
  label: string;
  field_type: KonnectRsvpFieldType;
  placeholder: string | null;
  help_text: string | null;
  options: string[];
  is_required: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface KonnectRsvp {
  id: string;
  event_id: string | null;
  is_featured: boolean;
  user_id: string | null;
  attendee_name: string | null;
  attendee_email: string;
  responses: Record<string, string>;
  created_at?: string;
}

export const KONNECT_TILE_PRESETS = [
  "#4DC9C9",
  "#8B1A1A",
  "#7B6FBA",
  "#E8823A",
  "#3B8C5E",
  "#8B9A2A",
  "#2C2C2C",
  "#6B7B8D",
] as const;

export const DEFAULT_PAGE_SETTINGS: KonnectPageSettings = {
  id: 1,
  tagline: "Skill up · Share forward · Earn KO Coins",
  hero_line_1: "Konnect.",
  hero_line_2: "Learn from your",
  hero_line_3: "community.",
  sessions_section_label: "2026 · Upcoming Sessions Across Kores",
  featured_section_label: "Featured Workshop Series",
  past_section_label: "Past Sessions",
  rsvp_section_label: "RSVP",
  post_event_section_label: "Event recap",
  filter_upcoming_label: "Upcoming",
  filter_online_label: "Online",
  filter_in_person_label: "In-Person",
  filter_on_demand_label: "On-Demand",
  accent_color: "#FF6B35",
};

export const DEFAULT_FEATURED: KonnectFeatured = {
  id: 1,
  is_visible: true,
  icon: "🌱",
  badge_text: "6-Week Series · Online + In-Person",
  title: "Regenerative Living Intensive",
  description:
    "A comprehensive 6-week programme across natural building, organic farming, community finance, and sustainable living. Facilitated by 6 Kore experts.",
  schedule_text: "Every Saturday, 6 weeks",
  seats_text: "20 seats remaining",
  ko_coins_text: "Earn 500 KO Coins",
  price_inr: "₹3,500",
  price_ko_coins: "or 875 KO Coins",
  button_label: "Book Now",
  button_url: null,
  button_color: "#FF6B35",
  border_color: "#FF6B35",
  icon_bg_start: "#3A1800",
  icon_bg_end: "#1A0800",
  rsvp_enabled: true,
  post_event_images: [],
};

export function labelsFromDate(isoDate: string): { month_label: string; day_label: string } {
  const d = new Date(isoDate + "T12:00:00");
  return {
    month_label: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day_label: String(d.getDate()).padStart(2, "0"),
  };
}

export function emptyEvent(sortOrder: number): Omit<KonnectEvent, "id" | "created_at" | "updated_at"> {
  return {
    sort_order: sortOrder,
    is_published: true,
    session_type: "in-person",
    event_date: null,
    month_label: "MAY",
    day_label: "01",
    category: "",
    title: "",
    icon: "📅",
    tile_color: KONNECT_TILE_PRESETS[0],
    registration_url: null,
    ko_coins_earned: null,
    long_description: null,
    location: null,
    schedule_detail: null,
    capacity: null,
    post_event_message: null,
    post_event_images: [],
    rsvp_enabled: true,
  };
}

export const DEFAULT_KONNECT_RSVP_FIELDS: Omit<KonnectRsvpField, "id" | "created_at" | "updated_at">[] = [
  { sort_order: 1, is_active: true, applies_to: "all", event_id: null, field_key: "full_name", label: "Full name", field_type: "text", placeholder: "Your name", help_text: null, options: [], is_required: true },
  { sort_order: 2, is_active: true, applies_to: "all", event_id: null, field_key: "email", label: "Email", field_type: "email", placeholder: "you@example.com", help_text: null, options: [], is_required: true },
  { sort_order: 3, is_active: true, applies_to: "all", event_id: null, field_key: "phone", label: "Phone / WhatsApp", field_type: "tel", placeholder: "+91 …", help_text: null, options: [], is_required: false },
];

export function emptyRsvpField(sortOrder: number): Omit<KonnectRsvpField, "id" | "created_at" | "updated_at"> {
  return {
    sort_order: sortOrder,
    is_active: true,
    applies_to: "all",
    event_id: null,
    field_key: `field_${sortOrder}`,
    label: "New field",
    field_type: "text",
    placeholder: null,
    help_text: null,
    options: [],
    is_required: false,
  };
}

export function parsePostEventImages(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((u): u is string => typeof u === "string" && u.trim().length > 0);
  return [];
}

export function imagesFromTextarea(text: string): string[] {
  return text.split(/\r?\n|,/).map((s) => s.trim()).filter(Boolean);
}
