export type VolunteerFieldType = "text" | "email" | "phone" | "textarea" | "select" | "checkbox" | "url";

export type VolunteerApplicationStatus = "pending" | "reviewed" | "accepted" | "rejected";

export interface AboutPageSettings {
  id: number;
  hero_eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  mission_section_label: string;
  mission_text: string;
  what_section_label: string;
  what_text: string;
  pillars_section_label: string;
  stats_section_label: string;
  duty_section_label: string;
  duty_headline: string;
  duty_footer: string;
  voices_section_label: string;
  voices_subtitle: string;
  volunteer_section_label: string;
  company_section_label: string;
  company_name: string;
  company_cin: string;
  company_location: string;
  company_tagline: string;
  accent_color: string;
  updated_at?: string;
}

export interface AboutPillar {
  id: string;
  sort_order: number;
  is_visible: boolean;
  title: string;
  subtitle: string;
  description: string;
  detail: string;
  icon: string;
  accent_color: string;
  link_href: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AboutStat {
  id: string;
  sort_order: number;
  is_visible: boolean;
  value: string;
  label: string;
  color: string;
  created_at?: string;
  updated_at?: string;
}

export interface AboutDutyLine {
  id: string;
  sort_order: number;
  is_visible: boolean;
  text: string;
  created_at?: string;
  updated_at?: string;
}

export interface AboutVoice {
  id: string;
  sort_order: number;
  is_visible: boolean;
  quote: string;
  name: string;
  country: string;
  initials: string;
  created_at?: string;
  updated_at?: string;
}

export interface VolunteerFormSettings {
  id: number;
  is_open: boolean;
  form_title: string;
  form_description: string;
  success_message: string;
  closed_message: string;
  updated_at?: string;
}

export interface VolunteerFormField {
  id: string;
  sort_order: number;
  is_active: boolean;
  field_key: string;
  label: string;
  field_type: VolunteerFieldType;
  placeholder: string | null;
  help_text: string | null;
  options: string[];
  is_required: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VolunteerApplication {
  id: string;
  user_id: string | null;
  applicant_name: string | null;
  applicant_email: string | null;
  preferred_role_id: string | null;
  responses: Record<string, string | boolean>;
  status: VolunteerApplicationStatus;
  admin_notes: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface VolunteerPageSettings {
  id: number;
  hero_eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  benefits_section_label: string;
  benefits_intro: string;
  roles_section_label: string;
  roles_intro: string;
  featured_roles_label: string;
  all_roles_label: string;
  form_section_label: string;
  cta_title: string;
  cta_description: string;
  accent_color: string;
  updated_at?: string;
}

export interface VolunteerBenefit {
  id: string;
  sort_order: number;
  is_visible: boolean;
  icon: string;
  title: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export type VolunteerLocationType = "remote" | "in-person" | "hybrid";

export interface VolunteerRole {
  id: string;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  title: string;
  description: string;
  commitment: string | null;
  location_type: VolunteerLocationType;
  icon: string;
  created_at?: string;
  updated_at?: string;
}

export type VolunteerGigStatus = "open" | "assigned" | "in_progress" | "completed" | "cancelled";

export interface VolunteerMemberProfile {
  user_id: string;
  role_id: string | null;
  location: string | null;
  availability: string | null;
  joined_at?: string;
  updated_at?: string;
  role?: VolunteerRole | null;
}

export interface VolunteerNotice {
  id: string;
  user_id: string | null;
  title: string;
  body: string;
  is_pinned: boolean;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VolunteerGig {
  id: string;
  assigned_user_id: string | null;
  role_id: string | null;
  title: string;
  description: string;
  location: string | null;
  status: VolunteerGigStatus;
  due_date: string | null;
  ko_coins_reward: number;
  created_at?: string;
  updated_at?: string;
  role?: VolunteerRole | null;
}

export interface VolunteerDashboard {
  profile: VolunteerMemberProfile | null;
  role: VolunteerRole | null;
  notices: VolunteerNotice[];
  myGigs: VolunteerGig[];
  openGigs: VolunteerGig[];
}

export const VOLUNTEER_GIG_STATUSES: { value: VolunteerGigStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const VOLUNTEER_FIELD_TYPES: { value: VolunteerFieldType; label: string }[] = [
  { value: "text", label: "Short text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "textarea", label: "Long text" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "url", label: "URL / link" },
];

export const DEFAULT_ABOUT_PAGE_SETTINGS: AboutPageSettings = {
  id: 1,
  hero_eyebrow: "About Kommuniti",
  hero_title: "Build the Community You Deserve",
  hero_subtitle: "A Feeling of Home.",
  hero_description:
    "Building resilient communities through commerce, creativity, and collective action. Based in Kerala, rooted everywhere.",
  mission_section_label: "WHY KOMMUNITI",
  mission_text:
    "Kommuniti envisions to be a decentralised, international and non-partisan commune where mankind can function as one while expressing their individual uniqueness.",
  what_section_label: "WHAT IS KOMMUNITI",
  what_text:
    "Kommuniti is a decentralized, international, and politically non-partisan commune. We empower mankind to function as one collective consciousness while celebrating individual uniqueness.",
  pillars_section_label: "THREE PILLARS",
  stats_section_label: "BY THE NUMBERS",
  duty_section_label: "OUR DUTY",
  duty_headline: "WE HAVE A DUTY TO UNITE — WHATEVER OUR DIFFERENCES",
  duty_footer: "KOMMUTE · KONNECT · KREATE",
  voices_section_label: "VOICES",
  voices_subtitle: "Stories from our global community",
  volunteer_section_label: "JOIN AS VOLUNTEER",
  company_section_label: "COMPANY",
  company_name: "Kommuniti Private Limited",
  company_cin: "CIN: U74999KL2026PTC083000",
  company_location: "Registered in Kerala, India",
  company_tagline: "Community · Commerce · Action",
  accent_color: "#C9A84C",
};

export const DEFAULT_VOLUNTEER_FORM_SETTINGS: VolunteerFormSettings = {
  id: 1,
  is_open: true,
  form_title: "Volunteer with Kommuniti",
  form_description:
    "Help us build neighbourhood-first community — from events and content to local Kores and beyond.",
  success_message: "Thank you! Your volunteer application has been received. We will be in touch soon.",
  closed_message:
    "Volunteer applications are paused for now. Check back soon or explore Konnect and KO Reads.",
};

/** Fallback when DB fields are missing (before SQL seed or empty table). */
export const DEFAULT_VOLUNTEER_FIELDS: VolunteerFormField[] = [
  { id: "default-1", sort_order: 1, is_active: true, field_key: "full_name", label: "Full name", field_type: "text", placeholder: "Your full name", help_text: null, options: [], is_required: true },
  { id: "default-2", sort_order: 2, is_active: true, field_key: "email", label: "Email", field_type: "email", placeholder: "you@example.com", help_text: null, options: [], is_required: true },
  { id: "default-3", sort_order: 3, is_active: true, field_key: "phone", label: "Phone / WhatsApp", field_type: "phone", placeholder: "+91 ...", help_text: null, options: [], is_required: false },
  { id: "default-4", sort_order: 4, is_active: true, field_key: "location", label: "City / Country", field_type: "text", placeholder: "Where are you based?", help_text: null, options: [], is_required: false },
  { id: "default-role", sort_order: 5, is_active: true, field_key: "volunteer_role", label: "Preferred volunteer role", field_type: "select", placeholder: null, help_text: null, options: [], is_required: true },
  { id: "default-5", sort_order: 6, is_active: true, field_key: "availability", label: "Availability", field_type: "select", placeholder: null, help_text: null, options: ["Full-time", "Part-time", "Weekends only", "Remote only"], is_required: true },
  { id: "default-6", sort_order: 7, is_active: true, field_key: "interests", label: "Areas of interest", field_type: "textarea", placeholder: "Events, content, local Kores, tech, design...", help_text: null, options: [], is_required: false },
  { id: "default-7", sort_order: 8, is_active: true, field_key: "why_volunteer", label: "Why do you want to volunteer?", field_type: "textarea", placeholder: "Tell us what draws you to Kommuniti", help_text: null, options: [], is_required: true },
  { id: "default-8", sort_order: 9, is_active: true, field_key: "skills", label: "Skills & experience", field_type: "textarea", placeholder: "Relevant skills, past community work, links", help_text: null, options: [], is_required: false },
];

export const DEFAULT_VOLUNTEER_PAGE_SETTINGS: VolunteerPageSettings = {
  id: 1,
  hero_eyebrow: "Join the movement",
  hero_title: "Volunteer with Kommuniti",
  hero_subtitle: "Help neighbourhoods become Kores.",
  hero_description:
    "Whether you have five hours a week or five hours a month — your time shapes real community. Earn recognition, grow skills, and belong to something bigger than yourself.",
  benefits_section_label: "WHY VOLUNTEER",
  benefits_intro:
    "Volunteering with Kommuniti is not unpaid labour — it is co-ownership of the communities we are building together.",
  roles_section_label: "OPEN ROLES",
  roles_intro: "These are areas where we are actively looking for volunteers right now.",
  featured_roles_label: "Actively recruiting",
  all_roles_label: "All volunteer roles",
  form_section_label: "APPLY NOW",
  cta_title: "Ready to shape your Kore?",
  cta_description: "Fill in the application below. We review every submission and reply within a week.",
  accent_color: "#C9A84C",
};

export const DEFAULT_VOLUNTEER_BENEFITS: VolunteerBenefit[] = [
  { id: "b1", sort_order: 1, is_visible: true, icon: "🪙", title: "Earn KO Coins", description: "Contributions are recognised in our community economy — your time has tangible value." },
  { id: "b2", sort_order: 2, is_visible: true, icon: "🎓", title: "Learn by doing", description: "Work alongside facilitators, authors, and Kore leaders across Konnect, KO Reads, and events." },
  { id: "b3", sort_order: 3, is_visible: true, icon: "🌻", title: "Belong to a Kore", description: "Volunteers often become core members of neighbourhood hubs — this is how community sticks." },
  { id: "b4", sort_order: 4, is_visible: true, icon: "📜", title: "Official recognition", description: "Approved volunteers receive a profile badge and credit across Kommuniti programmes." },
];

export const DEFAULT_VOLUNTEER_ROLES: VolunteerRole[] = [
  { id: "r1", sort_order: 1, is_active: true, is_featured: true, title: "Community Events Coordinator", description: "Help plan and run Konnect workshops and Kore gatherings.", commitment: "5–8 hrs/week", location_type: "hybrid", icon: "🎓" },
  { id: "r2", sort_order: 2, is_active: true, is_featured: true, title: "KO Reads Community Moderator", description: "Welcome readers and help authors respond to community input.", commitment: "3–5 hrs/week", location_type: "remote", icon: "📖" },
];

export function emptyVolunteerField(sortOrder: number): Omit<VolunteerFormField, "id" | "created_at" | "updated_at"> {
  return {
    sort_order: sortOrder,
    is_active: true,
    field_key: `field_${sortOrder}`,
    label: "New field",
    field_type: "text",
    placeholder: null,
    help_text: null,
    options: [],
    is_required: false,
  };
}

export function emptyAboutPillar(sortOrder: number): Omit<AboutPillar, "id" | "created_at" | "updated_at"> {
  return {
    sort_order: sortOrder,
    is_visible: true,
    title: "New pillar",
    subtitle: "",
    description: "",
    detail: "",
    icon: "◉",
    accent_color: "#C9A84C",
    link_href: null,
  };
}

export function emptyAboutStat(sortOrder: number): Omit<AboutStat, "id" | "created_at" | "updated_at"> {
  return {
    sort_order: sortOrder,
    is_visible: true,
    value: "0",
    label: "Label",
    color: "#C9A84C",
  };
}

export function emptyAboutDutyLine(sortOrder: number): Omit<AboutDutyLine, "id" | "created_at" | "updated_at"> {
  return {
    sort_order: sortOrder,
    is_visible: true,
    text: "New duty line",
  };
}

export function emptyAboutVoice(sortOrder: number): Omit<AboutVoice, "id" | "created_at" | "updated_at"> {
  return {
    sort_order: sortOrder,
    is_visible: true,
    quote: "",
    name: "",
    country: "",
    initials: "",
  };
}

export function emptyVolunteerBenefit(sortOrder: number): Omit<VolunteerBenefit, "id" | "created_at" | "updated_at"> {
  return {
    sort_order: sortOrder,
    is_visible: true,
    icon: "✦",
    title: "New benefit",
    description: "",
  };
}

export function emptyVolunteerRole(sortOrder: number): Omit<VolunteerRole, "id" | "created_at" | "updated_at"> {
  return {
    sort_order: sortOrder,
    is_active: true,
    is_featured: false,
    title: "New role",
    description: "",
    commitment: null,
    location_type: "remote",
    icon: "◉",
  };
}

export function emptyVolunteerNotice(): Omit<VolunteerNotice, "id" | "created_at" | "updated_at"> {
  return {
    user_id: null,
    title: "New notice",
    body: "",
    is_pinned: false,
    is_visible: true,
  };
}

export function emptyVolunteerGig(): Omit<VolunteerGig, "id" | "created_at" | "updated_at"> {
  return {
    assigned_user_id: null,
    role_id: null,
    title: "New gig",
    description: "",
    location: null,
    status: "open",
    due_date: null,
    ko_coins_reward: 0,
  };
}

export function emptyVolunteerMemberProfile(userId: string): Omit<VolunteerMemberProfile, "joined_at" | "updated_at"> {
  return {
    user_id: userId,
    role_id: null,
    location: null,
    availability: null,
  };
}

export function normalizeVolunteerField(row: VolunteerFormField): VolunteerFormField {
  return {
    ...row,
    options: Array.isArray(row.options) ? row.options : [],
  };
}
