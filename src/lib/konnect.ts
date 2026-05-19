import { supabase } from "@/lib/supabase";
import {
  DEFAULT_FEATURED,
  DEFAULT_PAGE_SETTINGS,
  KonnectEvent,
  KonnectFeatured,
  KonnectFilterTab,
  KonnectPageSettings,
  KonnectSessionType,
} from "@/types/konnect";

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

  return {
    settings: (settingsRes.data as KonnectPageSettings | null) ?? DEFAULT_PAGE_SETTINGS,
    events: (eventsRes.data as KonnectEvent[] | null) ?? [],
    featured: (featuredRes.data as KonnectFeatured | null) ?? DEFAULT_FEATURED,
    error: settingsRes.error || eventsRes.error || featuredRes.error,
  };
}

export function filterKonnectEvents(
  events: KonnectEvent[],
  tab: KonnectFilterTab
): KonnectEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (tab === "upcoming") {
    return events.filter((e) => {
      if (!e.event_date) return true;
      const d = new Date(e.event_date + "T12:00:00");
      return d >= today;
    });
  }

  return events.filter((e) => e.session_type === (tab as KonnectSessionType));
}
