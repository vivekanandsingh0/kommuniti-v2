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
  updated_at?: string;
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
  };
}
