import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  AboutDutyLine,
  AboutPageSettings,
  AboutPillar,
  AboutStat,
  AboutVoice,
  DEFAULT_ABOUT_PAGE_SETTINGS,
  DEFAULT_VOLUNTEER_BENEFITS,
  DEFAULT_VOLUNTEER_FIELDS,
  DEFAULT_VOLUNTEER_FORM_SETTINGS,
  DEFAULT_VOLUNTEER_PAGE_SETTINGS,
  DEFAULT_VOLUNTEER_ROLES,
  VolunteerApplication,
  VolunteerBenefit,
  VolunteerDashboard,
  VolunteerFormField,
  VolunteerFormSettings,
  VolunteerGig,
  VolunteerMemberProfile,
  VolunteerNotice,
  VolunteerPageSettings,
  VolunteerRole,
  normalizeVolunteerField,
} from "@/types/about";

export async function fetchVolunteerPageData() {
  const [pageRes, benefitsRes, rolesRes, formSettingsRes, fieldsRes] = await Promise.all([
    supabase.from("volunteer_page_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("volunteer_benefits").select("*").eq("is_visible", true).order("sort_order", { ascending: true }),
    supabase.from("volunteer_roles").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
    supabase.from("volunteer_form_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("volunteer_form_fields").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
  ]);

  const dbFields = ((fieldsRes.data as VolunteerFormField[] | null) ?? []).map(normalizeVolunteerField);

  return {
    pageSettings: (pageRes.data as VolunteerPageSettings | null) ?? DEFAULT_VOLUNTEER_PAGE_SETTINGS,
    benefits: (benefitsRes.data as VolunteerBenefit[] | null)?.length
      ? (benefitsRes.data as VolunteerBenefit[])
      : DEFAULT_VOLUNTEER_BENEFITS,
    roles: (rolesRes.data as VolunteerRole[] | null)?.length
      ? (rolesRes.data as VolunteerRole[])
      : DEFAULT_VOLUNTEER_ROLES,
    volunteerSettings:
      (formSettingsRes.data as VolunteerFormSettings | null) ?? DEFAULT_VOLUNTEER_FORM_SETTINGS,
    volunteerFields: dbFields.length > 0 ? dbFields : DEFAULT_VOLUNTEER_FIELDS,
    error: pageRes.error || benefitsRes.error || rolesRes.error || formSettingsRes.error || fieldsRes.error,
  };
}

export async function fetchAboutPageData() {
  const [settingsRes, pillarsRes, statsRes, dutyRes, voicesRes, volunteerSettingsRes, fieldsRes] =
    await Promise.all([
      supabase.from("about_page_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("about_pillars").select("*").eq("is_visible", true).order("sort_order", { ascending: true }),
      supabase.from("about_stats").select("*").eq("is_visible", true).order("sort_order", { ascending: true }),
      supabase.from("about_duty_lines").select("*").eq("is_visible", true).order("sort_order", { ascending: true }),
      supabase.from("about_voices").select("*").eq("is_visible", true).order("sort_order", { ascending: true }),
      supabase.from("volunteer_form_settings").select("*").eq("id", 1).maybeSingle(),
      supabase
        .from("volunteer_form_fields")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    ]);

  const dbFields = ((fieldsRes.data as VolunteerFormField[] | null) ?? []).map(normalizeVolunteerField);

  return {
    settings: (settingsRes.data as AboutPageSettings | null) ?? DEFAULT_ABOUT_PAGE_SETTINGS,
    pillars: (pillarsRes.data as AboutPillar[] | null) ?? [],
    stats: (statsRes.data as AboutStat[] | null) ?? [],
    dutyLines: (dutyRes.data as AboutDutyLine[] | null) ?? [],
    voices: (voicesRes.data as AboutVoice[] | null) ?? [],
    volunteerSettings:
      (volunteerSettingsRes.data as VolunteerFormSettings | null) ?? DEFAULT_VOLUNTEER_FORM_SETTINGS,
    volunteerFields: dbFields.length > 0 ? dbFields : DEFAULT_VOLUNTEER_FIELDS,
    error:
      settingsRes.error ||
      pillarsRes.error ||
      statsRes.error ||
      dutyRes.error ||
      voicesRes.error ||
      volunteerSettingsRes.error ||
      fieldsRes.error,
  };
}

export async function fetchUserVolunteerApplication(userId?: string | null, email?: string | null) {
  if (!userId && !email) return { application: null as VolunteerApplication | null, error: null };

  let query = supabase.from("volunteer_applications").select("*").order("created_at", { ascending: false }).limit(1);

  if (userId && email) {
    query = query.or(`user_id.eq.${userId},applicant_email.eq.${email}`);
  } else if (userId) {
    query = query.eq("user_id", userId);
  } else {
    query = query.eq("applicant_email", email!);
  }

  const { data, error } = await query.maybeSingle();
  return { application: (data as VolunteerApplication | null) ?? null, error };
}

export async function fetchVolunteerApprovalStatus(userId?: string | null, email?: string | null) {
  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_approved_volunteer")
      .eq("id", userId)
      .maybeSingle();
    if (profile?.is_approved_volunteer) return true;
  }

  const { application } = await fetchUserVolunteerApplication(userId, email);
  return application?.status === "accepted";
}

export async function fetchVolunteerDashboard(userId: string): Promise<VolunteerDashboard> {
  const empty: VolunteerDashboard = {
    profile: null,
    role: null,
    notices: [],
    myGigs: [],
    openGigs: [],
  };

  const [profileRes, noticesRes, gigsRes, appRes] = await Promise.all([
    supabase
      .from("volunteer_member_profiles")
      .select("*, role:volunteer_roles(*)")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("volunteer_notices")
      .select("*")
      .eq("is_visible", true)
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("volunteer_gigs")
      .select("*, role:volunteer_roles(*)")
      .or(`assigned_user_id.eq.${userId},and(assigned_user_id.is.null,status.eq.open)`)
      .order("created_at", { ascending: false }),
    fetchUserVolunteerApplication(userId, null),
  ]);

  if (profileRes.error?.code === "PGRST205" || noticesRes.error?.code === "PGRST205") {
    return empty;
  }

  const row = profileRes.data as (VolunteerMemberProfile & { role?: VolunteerRole | null }) | null;
  let profile: VolunteerMemberProfile | null = row
    ? { ...row, role: row.role ?? null }
    : null;
  let role: VolunteerRole | null = row?.role ?? null;

  if (!profile && appRes.application?.status === "accepted") {
    const app = appRes.application;
    profile = {
      user_id: userId,
      role_id: app.preferred_role_id,
      location: String(app.responses?.location ?? "").trim() || null,
      availability: String(app.responses?.availability ?? "").trim() || null,
    };
    if (app.preferred_role_id) {
      const { data: roleData } = await supabase
        .from("volunteer_roles")
        .select("*")
        .eq("id", app.preferred_role_id)
        .maybeSingle();
      role = (roleData as VolunteerRole | null) ?? null;
    } else if (app.responses?.volunteer_role_label) {
      role = {
        id: "application",
        sort_order: 0,
        is_active: true,
        is_featured: false,
        title: String(app.responses.volunteer_role_label),
        description: "",
        commitment: null,
        location_type: "remote",
        icon: "🤝",
      };
    }
  }

  const gigs = ((gigsRes.data as VolunteerGig[] | null) ?? []).map((g) => ({
    ...g,
    role: (g as VolunteerGig & { role?: VolunteerRole }).role ?? null,
  }));

  return {
    profile,
    role,
    notices: (noticesRes.data as VolunteerNotice[] | null) ?? [],
    myGigs: gigs.filter((g) => g.assigned_user_id === userId),
    openGigs: gigs.filter((g) => !g.assigned_user_id && g.status === "open"),
  };
}

export async function submitVolunteerApplication(payload: {
  userId?: string | null;
  responses: Record<string, string | boolean>;
  preferredRoleId?: string | null;
}) {
  const name =
    String(payload.responses.full_name ?? payload.responses.name ?? "").trim() || null;
  const email = String(payload.responses.email ?? "").trim() || null;
  const roleId =
    payload.preferredRoleId ?? (String(payload.responses.volunteer_role ?? "").trim() || null);

  return supabase.from("volunteer_applications").insert({
    user_id: payload.userId ?? null,
    applicant_name: name,
    applicant_email: email,
    preferred_role_id: roleId || null,
    responses: payload.responses,
    status: "pending",
  });
}

export function validateVolunteerResponses(
  fields: VolunteerFormField[],
  responses: Record<string, string | boolean>,
  roles: VolunteerRole[] = []
): string | null {
  for (const field of fields) {
    if (!field.is_required) continue;
    const value = responses[field.field_key];
    if (field.field_key === "volunteer_role") {
      if (roles.length === 0) continue;
      if (!String(value ?? "").trim()) return `${field.label} is required`;
      continue;
    }
    if (field.field_type === "checkbox") {
      if (value !== true) return `${field.label} is required`;
      continue;
    }
    if (!String(value ?? "").trim()) return `${field.label} is required`;
  }
  return null;
}

async function resolveUserIdByEmail(email: string): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error || !data?.users) return null;

  const match = data.users.find((u) => u.email?.toLowerCase() === normalized);
  return match?.id ?? null;
}

/** Called from admin when application status changes — links user + sets profile badge. */
export async function syncVolunteerApproval(application: VolunteerApplication) {
  let userId = application.user_id;
  const email = application.applicant_email?.trim().toLowerCase();

  if (!userId && email) {
    userId = await resolveUserIdByEmail(email);
    if (userId) {
      await supabaseAdmin
        .from("volunteer_applications")
        .update({ user_id: userId, updated_at: new Date().toISOString() })
        .eq("id", application.id);
    }
  }

  if (!userId) {
    return { error: null, linked: false };
  }

  const isApproved = application.status === "accepted";

  const { data: existing } = await supabaseAdmin.from("profiles").select("id").eq("id", userId).maybeSingle();

  const profilePayload = {
    id: userId,
    is_approved_volunteer: isApproved,
    updated_at: new Date().toISOString(),
  };

  const { error } = existing
    ? await supabaseAdmin.from("profiles").update({ is_approved_volunteer: isApproved, updated_at: profilePayload.updated_at }).eq("id", userId)
    : await supabaseAdmin.from("profiles").insert(profilePayload);

  if (!error && isApproved) {
    await supabaseAdmin.from("volunteer_member_profiles").upsert(
      {
        user_id: userId,
        role_id: application.preferred_role_id,
        location: String(application.responses?.location ?? "").trim() || null,
        availability: String(application.responses?.availability ?? "").trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  }

  return { error, linked: true };
}
