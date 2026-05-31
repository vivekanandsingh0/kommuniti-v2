export interface ComingSoonPageConfig {
  path: string;
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
  icon: string;
}

export interface SiteNavLink {
  label: string;
  href: string;
  color: string;
  icon: string;
  subtitle?: string;
  description?: string;
}

/** Phase 1 — live at launch */
export const LIVE_LAUNCH_LINKS: SiteNavLink[] = [
  {
    label: "Konnect",
    href: "/konnect",
    color: "#FF6B35",
    icon: "🎓",
    subtitle: "Workshops & events",
    description:
      "Join talks, intensives, and community learning. Show up, connect, and earn KO Coins.",
  },
  {
    label: "KO Reads",
    href: "/koreads",
    color: "#C77DFF",
    icon: "📖",
    subtitle: "Community-powered books",
    description:
      "Read chapters, contribute ideas, and help authors build stories with the community.",
  },
  {
    label: "About",
    href: "/about",
    color: "#F0E8D5",
    icon: "🌻",
    subtitle: "Mission & story",
    description:
      "Why Kommuniti exists — decentralised community, commerce, and collective action.",
  },
  {
    label: "Volunteer",
    href: "/volunteer",
    color: "#C9A84C",
    icon: "🤝",
    subtitle: "Join the movement",
    description:
      "Explore benefits, see open roles, and apply to help neighbourhoods become Kores.",
  },
];

/** Add new unbuilt routes here — App.tsx maps them automatically. */
export const COMING_SOON_ROUTES: ComingSoonPageConfig[] = [
  {
    path: "/kommute",
    title: "Kommute",
    subtitle: "Travel & cultural exchange",
    description:
      "Curated stays, neighbourhood journeys, and community travel across Kores — experience places as a guest, not a tourist.",
    accentColor: "#6BBFB5",
    icon: "🗺️",
  },
  {
    path: "/kores",
    title: "Kores",
    subtitle: "Find your neighbourhood",
    description:
      "Discover local community hubs, see who is gathering near you, and find the Kore that fits your rhythm.",
    accentColor: "#C9A84C",
    icon: "◉",
  },
  {
    path: "/kreate",
    title: "Kreate",
    subtitle: "Innovate and transform",
    description:
      "An incubation space for ideas — connect with tribe members, build the right ecosystem, and take your vision to market.",
    accentColor: "#AAFF00",
    icon: "⚡",
  },
  {
    path: "/kostore",
    title: "KO Store",
    subtitle: "Community marketplace",
    description:
      "A social, equitable marketplace for products that help you grow as a healthy and responsible citizen.",
    accentColor: "#C9A84C",
    icon: "🛒",
  },
];

export const COMING_SOON_NAV_LINKS: SiteNavLink[] = COMING_SOON_ROUTES.map((route) => ({
  label: route.title,
  href: route.path,
  color: route.accentColor,
  icon: route.icon,
  subtitle: route.subtitle,
  description: route.description,
}));

/** @deprecated Use LIVE_LAUNCH_LINKS */
export const LIVE_PRODUCT_LINKS = LIVE_LAUNCH_LINKS;

export function getComingSoonConfig(pathname: string): ComingSoonPageConfig | null {
  return COMING_SOON_ROUTES.find((route) => route.path === pathname) ?? null;
}

export function isComingSoonPath(pathname: string): boolean {
  return COMING_SOON_ROUTES.some((route) => route.path === pathname);
}
