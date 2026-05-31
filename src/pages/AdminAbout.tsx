import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCcw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminVolunteerHub from "@/components/admin/AdminVolunteerHub";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { syncVolunteerApproval } from "@/lib/about";
import {
  AboutDutyLine,
  AboutPageSettings,
  AboutPillar,
  AboutStat,
  AboutVoice,
  DEFAULT_ABOUT_PAGE_SETTINGS,
  DEFAULT_VOLUNTEER_FORM_SETTINGS,
  DEFAULT_VOLUNTEER_PAGE_SETTINGS,
  VOLUNTEER_FIELD_TYPES,
  VolunteerApplication,
  VolunteerBenefit,
  VolunteerFormField,
  VolunteerFormSettings,
  VolunteerPageSettings,
  VolunteerRole,
  emptyAboutDutyLine,
  emptyAboutPillar,
  emptyAboutStat,
  emptyAboutVoice,
  emptyVolunteerBenefit,
  emptyVolunteerField,
  emptyVolunteerRole,
  normalizeVolunteerField,
} from "@/types/about";

type Tab = "page" | "pillars" | "stats" | "duty" | "voices" | "vol-page" | "roles" | "vol-hub" | "volunteer" | "applications";

const VOLUNTEER_TABLES_SQL_HINT =
  "Run supabase/about_volunteer_patch.sql (or volunteer_page_schema.sql) in your Supabase SQL Editor, then refresh.";

const isMissingVolunteerTablesError = (error: { code?: string; message?: string } | null | undefined) => {
  if (!error) return false;
  if (error.code === "PGRST205" || error.code === "42P01") return true;
  return /volunteer_(roles|benefits|page_settings)/i.test(error.message ?? "");
};

const formatAdminSaveError = (e: unknown) => {
  if (e && typeof e === "object" && "code" in e && isMissingVolunteerTablesError(e as { code?: string; message?: string })) {
    return VOLUNTEER_TABLES_SQL_HINT;
  }
  if (e instanceof Error) return e.message;
  return "Save failed";
};

const inputClass =
  "w-full bg-[rgba(240,232,213,0.03)] border border-[rgba(201,168,76,0.1)] rounded-sm py-2.5 px-3 text-sm focus:border-[#C9A84C] outline-none";
const labelClass = "text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] font-bold mb-1.5 block";

const AdminAbout = () => {
  const [tab, setTab] = useState<Tab>("page");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pageSettings, setPageSettings] = useState<AboutPageSettings>(DEFAULT_ABOUT_PAGE_SETTINGS);
  const [pillars, setPillars] = useState<AboutPillar[]>([]);
  const [stats, setStats] = useState<AboutStat[]>([]);
  const [dutyLines, setDutyLines] = useState<AboutDutyLine[]>([]);
  const [voices, setVoices] = useState<AboutVoice[]>([]);
  const [volunteerSettings, setVolunteerSettings] = useState<VolunteerFormSettings>(DEFAULT_VOLUNTEER_FORM_SETTINGS);
  const [volunteerFields, setVolunteerFields] = useState<VolunteerFormField[]>([]);
  const [volunteerPageSettings, setVolunteerPageSettings] = useState<VolunteerPageSettings>(DEFAULT_VOLUNTEER_PAGE_SETTINGS);
  const [volunteerBenefits, setVolunteerBenefits] = useState<VolunteerBenefit[]>([]);
  const [volunteerRoles, setVolunteerRoles] = useState<VolunteerRole[]>([]);
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);

  const [editingPillar, setEditingPillar] = useState<Partial<AboutPillar> | null>(null);
  const [editingStat, setEditingStat] = useState<Partial<AboutStat> | null>(null);
  const [editingDuty, setEditingDuty] = useState<Partial<AboutDutyLine> | null>(null);
  const [editingVoice, setEditingVoice] = useState<Partial<AboutVoice> | null>(null);
  const [editingBenefit, setEditingBenefit] = useState<Partial<VolunteerBenefit> | null>(null);
  const [editingRole, setEditingRole] = useState<Partial<VolunteerRole> | null>(null);
  const [editingField, setEditingField] = useState<Partial<VolunteerFormField> | null>(null);
  const [activeApplication, setActiveApplication] = useState<VolunteerApplication | null>(null);

  const [isNewPillar, setIsNewPillar] = useState(false);
  const [isNewStat, setIsNewStat] = useState(false);
  const [isNewDuty, setIsNewDuty] = useState(false);
  const [isNewVoice, setIsNewVoice] = useState(false);
  const [isNewBenefit, setIsNewBenefit] = useState(false);
  const [isNewRole, setIsNewRole] = useState(false);
  const [isNewField, setIsNewField] = useState(false);
  const [volunteerTablesMissing, setVolunteerTablesMissing] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, pillarsRes, statsRes, dutyRes, voicesRes, vSettingsRes, fieldsRes, vPageRes, benefitsRes, rolesRes, appsRes] =
        await Promise.all([
          supabaseAdmin.from("about_page_settings").select("*").eq("id", 1).maybeSingle(),
          supabaseAdmin.from("about_pillars").select("*").order("sort_order", { ascending: true }),
          supabaseAdmin.from("about_stats").select("*").order("sort_order", { ascending: true }),
          supabaseAdmin.from("about_duty_lines").select("*").order("sort_order", { ascending: true }),
          supabaseAdmin.from("about_voices").select("*").order("sort_order", { ascending: true }),
          supabaseAdmin.from("volunteer_form_settings").select("*").eq("id", 1).maybeSingle(),
          supabaseAdmin.from("volunteer_form_fields").select("*").order("sort_order", { ascending: true }),
          supabaseAdmin.from("volunteer_page_settings").select("*").eq("id", 1).maybeSingle(),
          supabaseAdmin.from("volunteer_benefits").select("*").order("sort_order", { ascending: true }),
          supabaseAdmin.from("volunteer_roles").select("*").order("sort_order", { ascending: true }),
          supabaseAdmin
            .from("volunteer_applications")
            .select("*")
            .order("created_at", { ascending: false }),
        ]);

      if (settingsRes.error?.code === "42P01") {
        toast.error("Run supabase/about_schema.sql in your Supabase SQL Editor first.");
        return;
      }

      const missingVolunteerTables =
        isMissingVolunteerTablesError(rolesRes.error) ||
        isMissingVolunteerTablesError(benefitsRes.error) ||
        isMissingVolunteerTablesError(vPageRes.error);
      setVolunteerTablesMissing(missingVolunteerTables);
      if (missingVolunteerTables) {
        toast.error(VOLUNTEER_TABLES_SQL_HINT, { duration: 8000 });
      }

      if (settingsRes.data) setPageSettings(settingsRes.data as AboutPageSettings);
      setPillars((pillarsRes.data as AboutPillar[]) || []);
      setStats((statsRes.data as AboutStat[]) || []);
      setDutyLines((dutyRes.data as AboutDutyLine[]) || []);
      setVoices((voicesRes.data as AboutVoice[]) || []);
      if (vSettingsRes.data) setVolunteerSettings(vSettingsRes.data as VolunteerFormSettings);
      setVolunteerFields(((fieldsRes.data as VolunteerFormField[]) || []).map(normalizeVolunteerField));
      if (vPageRes.data) setVolunteerPageSettings(vPageRes.data as VolunteerPageSettings);
      setVolunteerBenefits((benefitsRes.data as VolunteerBenefit[]) || []);
      setVolunteerRoles((rolesRes.data as VolunteerRole[]) || []);
      setApplications((appsRes.data as VolunteerApplication[]) || []);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load About CMS data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const savePageSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabaseAdmin
        .from("about_page_settings")
        .upsert({ ...pageSettings, id: 1, updated_at: new Date().toISOString() });
      if (error) throw error;
      toast.success("Page settings saved");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const saveVolunteerSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabaseAdmin
        .from("volunteer_form_settings")
        .upsert({ ...volunteerSettings, id: 1, updated_at: new Date().toISOString() });
      if (error) throw error;
      toast.success("Volunteer form settings saved");
    } catch (e: unknown) {
      toast.error(formatAdminSaveError(e));
    } finally {
      setSaving(false);
    }
  };

  const saveVolunteerPageSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabaseAdmin
        .from("volunteer_page_settings")
        .upsert({ ...volunteerPageSettings, id: 1, updated_at: new Date().toISOString() });
      if (error) throw error;
      toast.success("Volunteer page settings saved");
    } catch (e: unknown) {
      toast.error(formatAdminSaveError(e));
    } finally {
      setSaving(false);
    }
  };

  const saveBenefit = async () => {
    if (!editingBenefit?.title?.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        sort_order: editingBenefit.sort_order ?? volunteerBenefits.length + 1,
        is_visible: editingBenefit.is_visible ?? true,
        icon: editingBenefit.icon ?? "✦",
        title: editingBenefit.title,
        description: editingBenefit.description ?? "",
        updated_at: new Date().toISOString(),
      };
      if (isNewBenefit) {
        const { error } = await supabaseAdmin.from("volunteer_benefits").insert(payload);
        if (error) throw error;
      } else if (editingBenefit.id) {
        const { error } = await supabaseAdmin.from("volunteer_benefits").update(payload).eq("id", editingBenefit.id);
        if (error) throw error;
      }
      toast.success("Benefit saved");
      setEditingBenefit(null);
      setIsNewBenefit(false);
      await loadAll();
    } catch (e: unknown) {
      toast.error(formatAdminSaveError(e));
    } finally {
      setSaving(false);
    }
  };

  const saveRole = async () => {
    if (!editingRole?.title?.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        sort_order: editingRole.sort_order ?? volunteerRoles.length + 1,
        is_active: editingRole.is_active ?? true,
        is_featured: editingRole.is_featured ?? false,
        title: editingRole.title,
        description: editingRole.description ?? "",
        commitment: editingRole.commitment || null,
        location_type: editingRole.location_type ?? "remote",
        icon: editingRole.icon ?? "◉",
        updated_at: new Date().toISOString(),
      };
      if (isNewRole) {
        const { error } = await supabaseAdmin.from("volunteer_roles").insert(payload);
        if (error) throw error;
      } else if (editingRole.id) {
        const { error } = await supabaseAdmin.from("volunteer_roles").update(payload).eq("id", editingRole.id);
        if (error) throw error;
      }
      toast.success("Role saved");
      setEditingRole(null);
      setIsNewRole(false);
      await loadAll();
    } catch (e: unknown) {
      toast.error(formatAdminSaveError(e));
    } finally {
      setSaving(false);
    }
  };

  const savePillar = async () => {
    if (!editingPillar?.title?.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        sort_order: editingPillar.sort_order ?? pillars.length + 1,
        is_visible: editingPillar.is_visible ?? true,
        title: editingPillar.title,
        subtitle: editingPillar.subtitle ?? "",
        description: editingPillar.description ?? "",
        detail: editingPillar.detail ?? "",
        icon: editingPillar.icon ?? "◉",
        accent_color: editingPillar.accent_color ?? "#C9A84C",
        link_href: editingPillar.link_href || null,
        updated_at: new Date().toISOString(),
      };
      if (isNewPillar) {
        const { error } = await supabaseAdmin.from("about_pillars").insert(payload);
        if (error) throw error;
      } else if (editingPillar.id) {
        const { error } = await supabaseAdmin.from("about_pillars").update(payload).eq("id", editingPillar.id);
        if (error) throw error;
      }
      toast.success("Pillar saved");
      setEditingPillar(null);
      setIsNewPillar(false);
      await loadAll();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const saveStat = async () => {
    if (!editingStat?.value?.trim() || !editingStat?.label?.trim()) {
      toast.error("Value and label are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        sort_order: editingStat.sort_order ?? stats.length + 1,
        is_visible: editingStat.is_visible ?? true,
        value: editingStat.value,
        label: editingStat.label,
        color: editingStat.color ?? "#C9A84C",
        updated_at: new Date().toISOString(),
      };
      if (isNewStat) {
        const { error } = await supabaseAdmin.from("about_stats").insert(payload);
        if (error) throw error;
      } else if (editingStat.id) {
        const { error } = await supabaseAdmin.from("about_stats").update(payload).eq("id", editingStat.id);
        if (error) throw error;
      }
      toast.success("Stat saved");
      setEditingStat(null);
      setIsNewStat(false);
      await loadAll();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const saveDuty = async () => {
    if (!editingDuty?.text?.trim()) {
      toast.error("Text is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        sort_order: editingDuty.sort_order ?? dutyLines.length + 1,
        is_visible: editingDuty.is_visible ?? true,
        text: editingDuty.text,
        updated_at: new Date().toISOString(),
      };
      if (isNewDuty) {
        const { error } = await supabaseAdmin.from("about_duty_lines").insert(payload);
        if (error) throw error;
      } else if (editingDuty.id) {
        const { error } = await supabaseAdmin.from("about_duty_lines").update(payload).eq("id", editingDuty.id);
        if (error) throw error;
      }
      toast.success("Duty line saved");
      setEditingDuty(null);
      setIsNewDuty(false);
      await loadAll();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const saveVoice = async () => {
    if (!editingVoice?.quote?.trim() || !editingVoice?.name?.trim()) {
      toast.error("Quote and name are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        sort_order: editingVoice.sort_order ?? voices.length + 1,
        is_visible: editingVoice.is_visible ?? true,
        quote: editingVoice.quote,
        name: editingVoice.name,
        country: editingVoice.country ?? "",
        initials: editingVoice.initials ?? editingVoice.name.slice(0, 2).toUpperCase(),
        updated_at: new Date().toISOString(),
      };
      if (isNewVoice) {
        const { error } = await supabaseAdmin.from("about_voices").insert(payload);
        if (error) throw error;
      } else if (editingVoice.id) {
        const { error } = await supabaseAdmin.from("about_voices").update(payload).eq("id", editingVoice.id);
        if (error) throw error;
      }
      toast.success("Voice saved");
      setEditingVoice(null);
      setIsNewVoice(false);
      await loadAll();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const saveField = async () => {
    if (!editingField?.field_key?.trim() || !editingField?.label?.trim()) {
      toast.error("Field key and label are required");
      return;
    }
    setSaving(true);
    try {
      const options =
        typeof editingField.options === "string"
          ? (editingField.options as unknown as string).split(",").map((s) => s.trim()).filter(Boolean)
          : editingField.options ?? [];

      const payload = {
        sort_order: editingField.sort_order ?? volunteerFields.length + 1,
        is_active: editingField.is_active ?? true,
        field_key: editingField.field_key.trim(),
        label: editingField.label,
        field_type: editingField.field_type ?? "text",
        placeholder: editingField.placeholder || null,
        help_text: editingField.help_text || null,
        options,
        is_required: editingField.is_required ?? false,
        updated_at: new Date().toISOString(),
      };

      if (isNewField) {
        const { error } = await supabaseAdmin.from("volunteer_form_fields").insert(payload);
        if (error) throw error;
      } else if (editingField.id) {
        const { error } = await supabaseAdmin.from("volunteer_form_fields").update(payload).eq("id", editingField.id);
        if (error) throw error;
      }
      toast.success("Form field saved");
      setEditingField(null);
      setIsNewField(false);
      await loadAll();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteRow = async (table: string, id: string, label: string) => {
    if (!confirm(`Delete this ${label}?`)) return;
    try {
      const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
      if (error) throw error;
      toast.success("Deleted");
      await loadAll();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const updateApplication = async (nextStatus?: VolunteerApplication["status"]) => {
    if (!activeApplication) return;
    const status = nextStatus ?? activeApplication.status;
    setSaving(true);
    try {
      const { error } = await supabaseAdmin
        .from("volunteer_applications")
        .update({
          status,
          admin_notes: activeApplication.admin_notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeApplication.id);
      if (error) throw error;

      const syncRes = await syncVolunteerApproval({ ...activeApplication, status });
      if (syncRes.error) {
        toast.error(`Application saved but profile badge failed: ${syncRes.error.message}`);
      } else if (status === "accepted" && !syncRes.linked) {
        toast.message("Approved — no linked account yet (applicant email not registered). Badge will apply when they sign up.");
      } else if (status === "accepted") {
        toast.success("Volunteer approved — profile badge updated");
      } else {
        toast.success("Application updated");
      }

      setActiveApplication(null);
      await loadAll();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "page", label: "Page Copy" },
    { id: "pillars", label: `Pillars (${pillars.length})` },
    { id: "stats", label: `Stats (${stats.length})` },
    { id: "duty", label: `Duty Lines (${dutyLines.length})` },
    { id: "voices", label: `Voices (${voices.length})` },
    { id: "vol-page", label: "Volunteer Page" },
    { id: "roles", label: `Roles (${volunteerRoles.length})` },
    { id: "vol-hub", label: "Volunteer Hub" },
    { id: "volunteer", label: "Volunteer Form" },
    { id: "applications", label: `Applications (${applications.length})` },
  ];

  const roleTitleById = (id: string | null | undefined) =>
    id ? volunteerRoles.find((r) => r.id === id)?.title ?? id : null;

  const renderField = (label: string, node: React.ReactNode, key?: string) => (
    <div key={key}>
      <label className={labelClass}>{label}</label>
      {node}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5] flex">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800 }} className="text-3xl mb-2">
              About CMS
            </h1>
            <p className="text-[rgba(240,232,213,0.4)] text-sm">
              Manage About page copy, pillars, and volunteer content — live at{" "}
              <a href="/about" target="_blank" rel="noreferrer" className="text-[#C9A84C] hover:underline">
                /about
              </a>{" "}
              and{" "}
              <a href="/volunteer" target="_blank" rel="noreferrer" className="text-[#C9A84C] hover:underline">
                /volunteer
              </a>
            </p>
          </div>
          <button
            type="button"
            onClick={loadAll}
            disabled={loading}
            className="flex items-center gap-2 bg-[rgba(240,232,213,0.05)] border border-[rgba(201,168,76,0.2)] text-[10px] tracking-[2px] uppercase px-4 py-2"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </header>

        {volunteerTablesMissing && (
          <div className="mb-6 border border-[#FF6B35]/40 bg-[#FF6B35]/10 p-4 text-sm leading-relaxed">
            <p className="font-bold text-[#FF6B35] mb-1">Volunteer page tables not found</p>
            <p className="text-[rgba(240,232,213,0.65)]">
              Roles and benefits cannot be saved until you run{" "}
              <code className="text-[#C9A84C]">supabase/about_volunteer_patch.sql</code> in the Supabase SQL Editor, then click Refresh.
            </p>
          </div>
        )}

        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold border transition-all ${
                tab === id
                  ? "bg-[#C9A84C] text-[#0B1828] border-[#C9A84C]"
                  : "border-[rgba(201,168,76,0.2)] text-[rgba(240,232,213,0.5)] hover:border-[#C9A84C]/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "page" && (
          <div className="max-w-3xl space-y-4">
            {[
              ["hero_eyebrow", "Hero eyebrow"],
              ["hero_title", "Hero title"],
              ["hero_subtitle", "Hero subtitle"],
              ["hero_description", "Hero description", true],
              ["mission_section_label", "Mission section label"],
              ["mission_text", "Mission text", true],
              ["what_section_label", "What section label"],
              ["what_text", "What text", true],
              ["pillars_section_label", "Pillars section label"],
              ["stats_section_label", "Stats section label"],
              ["duty_section_label", "Duty section label"],
              ["duty_headline", "Duty headline"],
              ["duty_footer", "Duty footer"],
              ["voices_section_label", "Voices section label"],
              ["voices_subtitle", "Voices subtitle"],
              ["volunteer_section_label", "Volunteer section label"],
              ["company_section_label", "Company section label"],
              ["company_name", "Company name"],
              ["company_cin", "Company CIN"],
              ["company_location", "Company location"],
              ["company_tagline", "Company tagline"],
              ["accent_color", "Accent color"],
            ].map(([key, label, multiline]) =>
              renderField(
                label,
                multiline ? (
                  <textarea
                    className={`${inputClass} min-h-[80px]`}
                    value={(pageSettings as Record<string, string>)[key]}
                    onChange={(e) => setPageSettings({ ...pageSettings, [key]: e.target.value })}
                  />
                ) : (
                  <input
                    className={inputClass}
                    value={(pageSettings as Record<string, string>)[key]}
                    onChange={(e) => setPageSettings({ ...pageSettings, [key]: e.target.value })}
                  />
                ),
                key
              )
            )}
            <button
              type="button"
              onClick={savePageSettings}
              disabled={saving}
              className="flex items-center gap-2 bg-[#C9A84C] text-[#0B1828] px-6 py-3 text-[10px] uppercase font-bold"
            >
              <Save size={14} /> Save page settings
            </button>
          </div>
        )}

        {tab === "pillars" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setIsNewPillar(true);
                  setEditingPillar(emptyAboutPillar(pillars.length + 1));
                }}
                className="flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-[#C9A84C] mb-4"
              >
                <Plus size={14} /> Add pillar
              </button>
              {pillars.map((p) => (
                <div key={p.id} className="border border-white/10 p-4 flex justify-between gap-3">
                  <div>
                    <div className="font-bold">{p.icon} {p.title}</div>
                    <div className="text-[10px] text-[rgba(240,232,213,0.4)]">{p.subtitle}</div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setIsNewPillar(false); setEditingPillar(p); }} className="text-[10px] uppercase text-[#C9A84C]">Edit</button>
                    <button type="button" onClick={() => deleteRow("about_pillars", p.id, "pillar")} className="text-[10px] uppercase text-red-400"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
            {editingPillar && (
              <div className="border border-[#C9A84C]/20 p-5 space-y-3">
                {renderField("Title", <input className={inputClass} value={editingPillar.title ?? ""} onChange={(e) => setEditingPillar({ ...editingPillar, title: e.target.value })} />)}
                {renderField("Subtitle", <input className={inputClass} value={editingPillar.subtitle ?? ""} onChange={(e) => setEditingPillar({ ...editingPillar, subtitle: e.target.value })} />)}
                {renderField("Description", <textarea className={`${inputClass} min-h-[80px]`} value={editingPillar.description ?? ""} onChange={(e) => setEditingPillar({ ...editingPillar, description: e.target.value })} />)}
                {renderField("Detail", <textarea className={`${inputClass} min-h-[60px]`} value={editingPillar.detail ?? ""} onChange={(e) => setEditingPillar({ ...editingPillar, detail: e.target.value })} />)}
                {renderField("Icon", <input className={inputClass} value={editingPillar.icon ?? ""} onChange={(e) => setEditingPillar({ ...editingPillar, icon: e.target.value })} />)}
                {renderField("Accent color", <input className={inputClass} value={editingPillar.accent_color ?? ""} onChange={(e) => setEditingPillar({ ...editingPillar, accent_color: e.target.value })} />)}
                {renderField("Link href", <input className={inputClass} value={editingPillar.link_href ?? ""} onChange={(e) => setEditingPillar({ ...editingPillar, link_href: e.target.value })} placeholder="/konnect" />)}
                {renderField("Sort order", <input type="number" className={inputClass} value={editingPillar.sort_order ?? 0} onChange={(e) => setEditingPillar({ ...editingPillar, sort_order: Number(e.target.value) })} />)}
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editingPillar.is_visible ?? true} onChange={(e) => setEditingPillar({ ...editingPillar, is_visible: e.target.checked })} />
                  Visible
                </label>
                <button type="button" onClick={savePillar} disabled={saving} className="bg-[#C9A84C] text-[#0B1828] px-4 py-2 text-[10px] uppercase font-bold">Save pillar</button>
              </div>
            )}
          </div>
        )}

        {tab === "stats" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <button type="button" onClick={() => { setIsNewStat(true); setEditingStat(emptyAboutStat(stats.length + 1)); }} className="flex items-center gap-2 text-[10px] uppercase text-[#C9A84C] mb-4"><Plus size={14} /> Add stat</button>
              {stats.map((s) => (
                <div key={s.id} className="border border-white/10 p-4 flex justify-between">
                  <div><span className="font-bold" style={{ color: s.color }}>{s.value}</span> — {s.label}</div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setIsNewStat(false); setEditingStat(s); }} className="text-[10px] uppercase text-[#C9A84C]">Edit</button>
                    <button type="button" onClick={() => deleteRow("about_stats", s.id, "stat")}><Trash2 size={12} className="text-red-400" /></button>
                  </div>
                </div>
              ))}
            </div>
            {editingStat && (
              <div className="border border-[#C9A84C]/20 p-5 space-y-3">
                {renderField("Value", <input className={inputClass} value={editingStat.value ?? ""} onChange={(e) => setEditingStat({ ...editingStat, value: e.target.value })} />)}
                {renderField("Label", <input className={inputClass} value={editingStat.label ?? ""} onChange={(e) => setEditingStat({ ...editingStat, label: e.target.value })} />)}
                {renderField("Color", <input className={inputClass} value={editingStat.color ?? ""} onChange={(e) => setEditingStat({ ...editingStat, color: e.target.value })} />)}
                {renderField("Sort order", <input type="number" className={inputClass} value={editingStat.sort_order ?? 0} onChange={(e) => setEditingStat({ ...editingStat, sort_order: Number(e.target.value) })} />)}
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editingStat.is_visible ?? true} onChange={(e) => setEditingStat({ ...editingStat, is_visible: e.target.checked })} /> Visible</label>
                <button type="button" onClick={saveStat} className="bg-[#C9A84C] text-[#0B1828] px-4 py-2 text-[10px] uppercase font-bold">Save stat</button>
              </div>
            )}
          </div>
        )}

        {tab === "duty" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <button type="button" onClick={() => { setIsNewDuty(true); setEditingDuty(emptyAboutDutyLine(dutyLines.length + 1)); }} className="flex items-center gap-2 text-[10px] uppercase text-[#C9A84C] mb-4"><Plus size={14} /> Add line</button>
              {dutyLines.map((d) => (
                <div key={d.id} className="border border-white/10 p-4 flex justify-between gap-3">
                  <p className="text-sm">{d.text}</p>
                  <div className="flex gap-2 shrink-0">
                    <button type="button" onClick={() => { setIsNewDuty(false); setEditingDuty(d); }} className="text-[10px] uppercase text-[#C9A84C]">Edit</button>
                    <button type="button" onClick={() => deleteRow("about_duty_lines", d.id, "line")}><Trash2 size={12} className="text-red-400" /></button>
                  </div>
                </div>
              ))}
            </div>
            {editingDuty && (
              <div className="border border-[#C9A84C]/20 p-5 space-y-3">
                {renderField("Text", <textarea className={`${inputClass} min-h-[80px]`} value={editingDuty.text ?? ""} onChange={(e) => setEditingDuty({ ...editingDuty, text: e.target.value })} />)}
                {renderField("Sort order", <input type="number" className={inputClass} value={editingDuty.sort_order ?? 0} onChange={(e) => setEditingDuty({ ...editingDuty, sort_order: Number(e.target.value) })} />)}
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editingDuty.is_visible ?? true} onChange={(e) => setEditingDuty({ ...editingDuty, is_visible: e.target.checked })} /> Visible</label>
                <button type="button" onClick={saveDuty} className="bg-[#C9A84C] text-[#0B1828] px-4 py-2 text-[10px] uppercase font-bold">Save line</button>
              </div>
            )}
          </div>
        )}

        {tab === "voices" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <button type="button" onClick={() => { setIsNewVoice(true); setEditingVoice(emptyAboutVoice(voices.length + 1)); }} className="flex items-center gap-2 text-[10px] uppercase text-[#C9A84C] mb-4"><Plus size={14} /> Add voice</button>
              {voices.map((v) => (
                <div key={v.id} className="border border-white/10 p-4 flex justify-between gap-3">
                  <div><div className="font-bold">{v.name}</div><p className="text-xs text-[rgba(240,232,213,0.45)] line-clamp-2">{v.quote}</p></div>
                  <div className="flex gap-2 shrink-0">
                    <button type="button" onClick={() => { setIsNewVoice(false); setEditingVoice(v); }} className="text-[10px] uppercase text-[#C9A84C]">Edit</button>
                    <button type="button" onClick={() => deleteRow("about_voices", v.id, "voice")}><Trash2 size={12} className="text-red-400" /></button>
                  </div>
                </div>
              ))}
            </div>
            {editingVoice && (
              <div className="border border-[#C9A84C]/20 p-5 space-y-3">
                {renderField("Quote", <textarea className={`${inputClass} min-h-[80px]`} value={editingVoice.quote ?? ""} onChange={(e) => setEditingVoice({ ...editingVoice, quote: e.target.value })} />)}
                {renderField("Name", <input className={inputClass} value={editingVoice.name ?? ""} onChange={(e) => setEditingVoice({ ...editingVoice, name: e.target.value })} />)}
                {renderField("Country", <input className={inputClass} value={editingVoice.country ?? ""} onChange={(e) => setEditingVoice({ ...editingVoice, country: e.target.value })} />)}
                {renderField("Initials", <input className={inputClass} value={editingVoice.initials ?? ""} onChange={(e) => setEditingVoice({ ...editingVoice, initials: e.target.value })} />)}
                {renderField("Sort order", <input type="number" className={inputClass} value={editingVoice.sort_order ?? 0} onChange={(e) => setEditingVoice({ ...editingVoice, sort_order: Number(e.target.value) })} />)}
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editingVoice.is_visible ?? true} onChange={(e) => setEditingVoice({ ...editingVoice, is_visible: e.target.checked })} /> Visible</label>
                <button type="button" onClick={saveVoice} className="bg-[#C9A84C] text-[#0B1828] px-4 py-2 text-[10px] uppercase font-bold">Save voice</button>
              </div>
            )}
          </div>
        )}

        {tab === "vol-page" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="max-w-xl space-y-4">
              <h3 className="font-bold text-lg">Page copy</h3>
              {[
                ["hero_eyebrow", "Hero eyebrow"],
                ["hero_title", "Hero title"],
                ["hero_subtitle", "Hero subtitle"],
                ["hero_description", "Hero description", true],
                ["benefits_section_label", "Benefits section label"],
                ["benefits_intro", "Benefits intro", true],
                ["roles_section_label", "Roles section label"],
                ["roles_intro", "Roles intro", true],
                ["featured_roles_label", "Featured roles label"],
                ["all_roles_label", "All roles label"],
                ["form_section_label", "Form section label"],
                ["cta_title", "Apply CTA title"],
                ["cta_description", "Apply CTA description", true],
                ["accent_color", "Accent color"],
              ].map(([key, label, multiline]) =>
                renderField(
                  label,
                  multiline ? (
                    <textarea
                      className={`${inputClass} min-h-[80px]`}
                      value={(volunteerPageSettings as Record<string, string>)[key]}
                      onChange={(e) => setVolunteerPageSettings({ ...volunteerPageSettings, [key]: e.target.value })}
                    />
                  ) : (
                    <input
                      className={inputClass}
                      value={(volunteerPageSettings as Record<string, string>)[key]}
                      onChange={(e) => setVolunteerPageSettings({ ...volunteerPageSettings, [key]: e.target.value })}
                    />
                  ),
                  key
                )
              )}
              <button
                type="button"
                onClick={saveVolunteerPageSettings}
                disabled={saving}
                className="flex items-center gap-2 bg-[#C9A84C] text-[#0B1828] px-6 py-3 text-[10px] uppercase font-bold"
              >
                <Save size={14} /> Save page settings
              </button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Benefits ({volunteerBenefits.length})</h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewBenefit(true);
                    setEditingBenefit(emptyVolunteerBenefit(volunteerBenefits.length + 1));
                  }}
                  className="flex items-center gap-1 text-[10px] uppercase text-[#C9A84C]"
                >
                  <Plus size={14} /> Add benefit
                </button>
              </div>
              <div className="space-y-2 mb-6">
                {volunteerBenefits.map((b) => (
                  <div key={b.id} className="border border-white/10 p-3 flex justify-between gap-2 text-sm">
                    <div>
                      <span className="font-bold">{b.icon} {b.title}</span>
                      {!b.is_visible && <span className="text-[10px] text-[rgba(240,232,213,0.35)] ml-2">hidden</span>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button type="button" onClick={() => { setIsNewBenefit(false); setEditingBenefit(b); }} className="text-[10px] uppercase text-[#C9A84C]">Edit</button>
                      <button type="button" onClick={() => deleteRow("volunteer_benefits", b.id, "benefit")}><Trash2 size={12} className="text-red-400" /></button>
                    </div>
                  </div>
                ))}
              </div>
              {editingBenefit && (
                <div className="border border-[#C9A84C]/20 p-5 space-y-3">
                  {renderField("Icon", <input className={inputClass} value={editingBenefit.icon ?? ""} onChange={(e) => setEditingBenefit({ ...editingBenefit, icon: e.target.value })} />)}
                  {renderField("Title", <input className={inputClass} value={editingBenefit.title ?? ""} onChange={(e) => setEditingBenefit({ ...editingBenefit, title: e.target.value })} />)}
                  {renderField("Description", <textarea className={`${inputClass} min-h-[80px]`} value={editingBenefit.description ?? ""} onChange={(e) => setEditingBenefit({ ...editingBenefit, description: e.target.value })} />)}
                  {renderField("Sort order", <input type="number" className={inputClass} value={editingBenefit.sort_order ?? 0} onChange={(e) => setEditingBenefit({ ...editingBenefit, sort_order: Number(e.target.value) })} />)}
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editingBenefit.is_visible ?? true} onChange={(e) => setEditingBenefit({ ...editingBenefit, is_visible: e.target.checked })} /> Visible</label>
                  <button type="button" onClick={saveBenefit} className="bg-[#C9A84C] text-[#0B1828] px-4 py-2 text-[10px] uppercase font-bold">Save benefit</button>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "roles" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-sm text-[rgba(240,232,213,0.45)] mb-2">
                Roles appear in the volunteer application dropdown. Mark roles as &quot;Featured&quot; to highlight them on /volunteer.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsNewRole(true);
                  setEditingRole(emptyVolunteerRole(volunteerRoles.length + 1));
                }}
                className="flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-[#C9A84C] mb-4"
              >
                <Plus size={14} /> Add role
              </button>
              {volunteerRoles.map((r) => (
                <div key={r.id} className="border border-white/10 p-4 flex justify-between gap-3">
                  <div>
                    <div className="font-bold">{r.icon} {r.title}</div>
                    <div className="text-[10px] text-[rgba(240,232,213,0.4)]">
                      {r.is_featured ? "Featured · " : ""}{r.location_type}{r.commitment ? ` · ${r.commitment}` : ""}
                      {!r.is_active && " · inactive"}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button type="button" onClick={() => { setIsNewRole(false); setEditingRole(r); }} className="text-[10px] uppercase text-[#C9A84C]">Edit</button>
                    <button type="button" onClick={() => deleteRow("volunteer_roles", r.id, "role")}><Trash2 size={12} className="text-red-400" /></button>
                  </div>
                </div>
              ))}
            </div>
            {editingRole && (
              <div className="border border-[#C9A84C]/20 p-5 space-y-3">
                {renderField("Title", <input className={inputClass} value={editingRole.title ?? ""} onChange={(e) => setEditingRole({ ...editingRole, title: e.target.value })} />)}
                {renderField("Description", <textarea className={`${inputClass} min-h-[80px]`} value={editingRole.description ?? ""} onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })} />)}
                {renderField("Commitment", <input className={inputClass} value={editingRole.commitment ?? ""} onChange={(e) => setEditingRole({ ...editingRole, commitment: e.target.value })} placeholder="e.g. 5–8 hrs/week" />)}
                {renderField("Location type", (
                  <select className={inputClass} value={editingRole.location_type ?? "remote"} onChange={(e) => setEditingRole({ ...editingRole, location_type: e.target.value as VolunteerRole["location_type"] })}>
                    <option value="remote">Remote</option>
                    <option value="in-person">In person</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                ))}
                {renderField("Icon", <input className={inputClass} value={editingRole.icon ?? ""} onChange={(e) => setEditingRole({ ...editingRole, icon: e.target.value })} />)}
                {renderField("Sort order", <input type="number" className={inputClass} value={editingRole.sort_order ?? 0} onChange={(e) => setEditingRole({ ...editingRole, sort_order: Number(e.target.value) })} />)}
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editingRole.is_featured ?? false} onChange={(e) => setEditingRole({ ...editingRole, is_featured: e.target.checked })} /> Featured (actively recruiting)</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editingRole.is_active ?? true} onChange={(e) => setEditingRole({ ...editingRole, is_active: e.target.checked })} /> Active (shown in dropdown)</label>
                <button type="button" onClick={saveRole} className="bg-[#C9A84C] text-[#0B1828] px-4 py-2 text-[10px] uppercase font-bold">Save role</button>
              </div>
            )}
          </div>
        )}

        {tab === "vol-hub" && (
          <AdminVolunteerHub roles={volunteerRoles} applications={applications} onRefresh={loadAll} />
        )}

        {tab === "volunteer" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4 max-w-xl">
              <h3 className="font-bold text-lg">Form settings</h3>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={volunteerSettings.is_open} onChange={(e) => setVolunteerSettings({ ...volunteerSettings, is_open: e.target.checked })} />
                Applications open
              </label>
              {renderField("Form title", <input className={inputClass} value={volunteerSettings.form_title} onChange={(e) => setVolunteerSettings({ ...volunteerSettings, form_title: e.target.value })} />)}
              {renderField("Form description", <textarea className={`${inputClass} min-h-[80px]`} value={volunteerSettings.form_description} onChange={(e) => setVolunteerSettings({ ...volunteerSettings, form_description: e.target.value })} />)}
              {renderField("Success message", <textarea className={`${inputClass} min-h-[60px]`} value={volunteerSettings.success_message} onChange={(e) => setVolunteerSettings({ ...volunteerSettings, success_message: e.target.value })} />)}
              {renderField("Closed message", <textarea className={`${inputClass} min-h-[60px]`} value={volunteerSettings.closed_message} onChange={(e) => setVolunteerSettings({ ...volunteerSettings, closed_message: e.target.value })} />)}
              <button type="button" onClick={saveVolunteerSettings} disabled={saving} className="flex items-center gap-2 bg-[#C9A84C] text-[#0B1828] px-4 py-2 text-[10px] uppercase font-bold"><Save size={14} /> Save form settings</button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Form fields</h3>
                <button type="button" onClick={() => { setIsNewField(true); setEditingField(emptyVolunteerField(volunteerFields.length + 1)); }} className="flex items-center gap-1 text-[10px] uppercase text-[#C9A84C]"><Plus size={14} /> Add field</button>
              </div>
              <div className="space-y-2 mb-6">
                {volunteerFields.map((f) => (
                  <div key={f.id} className="border border-white/10 p-3 flex justify-between gap-2 text-sm">
                    <div>
                      <span className="font-bold">{f.label}</span>
                      <span className="text-[10px] text-[rgba(240,232,213,0.4)] ml-2">{f.field_key} · {f.field_type}{f.is_required ? " · required" : ""}</span>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setIsNewField(false); setEditingField(f); }} className="text-[10px] uppercase text-[#C9A84C]">Edit</button>
                      <button type="button" onClick={() => deleteRow("volunteer_form_fields", f.id, "field")}><Trash2 size={12} className="text-red-400" /></button>
                    </div>
                  </div>
                ))}
              </div>
              {editingField && (
                <div className="border border-[#C9A84C]/20 p-5 space-y-3">
                  {renderField("Field key (unique)", <input className={inputClass} value={editingField.field_key ?? ""} onChange={(e) => setEditingField({ ...editingField, field_key: e.target.value })} disabled={!isNewField} />)}
                  {renderField("Label", <input className={inputClass} value={editingField.label ?? ""} onChange={(e) => setEditingField({ ...editingField, label: e.target.value })} />)}
                  {renderField("Type", (
                    <select className={inputClass} value={editingField.field_type ?? "text"} onChange={(e) => setEditingField({ ...editingField, field_type: e.target.value as VolunteerFormField["field_type"] })}>
                      {VOLUNTEER_FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  ))}
                  {renderField("Placeholder", <input className={inputClass} value={editingField.placeholder ?? ""} onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })} />)}
                  {renderField("Help text", <input className={inputClass} value={editingField.help_text ?? ""} onChange={(e) => setEditingField({ ...editingField, help_text: e.target.value })} />)}
                  {(editingField.field_type === "select") && renderField("Options (comma-separated)", (
                    <input className={inputClass} value={(editingField.options ?? []).join(", ")} onChange={(e) => setEditingField({ ...editingField, options: e.target.value.split(",").map((s) => s.trim()) })} />
                  ))}
                  {renderField("Sort order", <input type="number" className={inputClass} value={editingField.sort_order ?? 0} onChange={(e) => setEditingField({ ...editingField, sort_order: Number(e.target.value) })} />)}
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editingField.is_required ?? false} onChange={(e) => setEditingField({ ...editingField, is_required: e.target.checked })} /> Required</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editingField.is_active ?? true} onChange={(e) => setEditingField({ ...editingField, is_active: e.target.checked })} /> Active</label>
                  <button type="button" onClick={saveField} className="bg-[#C9A84C] text-[#0B1828] px-4 py-2 text-[10px] uppercase font-bold">Save field</button>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "applications" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              {applications.length === 0 && <p className="text-[rgba(240,232,213,0.4)] text-sm">No applications yet.</p>}
              {applications.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => setActiveApplication(app)}
                  className={`w-full text-left border p-4 transition-colors ${activeApplication?.id === app.id ? "border-[#C9A84C]" : "border-white/10 hover:border-white/20"}`}
                >
                  <div className="font-bold">{app.applicant_name || "Anonymous"}</div>
                  <div className="text-xs text-[rgba(240,232,213,0.45)]">{app.applicant_email}</div>
                  {(app.preferred_role_id || app.responses?.volunteer_role_label) && (
                    <div className="text-xs text-[#FF6B35] mt-1">
                      Role: {app.responses?.volunteer_role_label ?? roleTitleById(app.preferred_role_id) ?? "—"}
                    </div>
                  )}
                  <div className="text-[10px] uppercase tracking-[2px] mt-2 text-[#C9A84C]">{app.status}</div>
                  <div className="text-[10px] text-[rgba(240,232,213,0.35)] mt-1">
                    {app.created_at ? new Date(app.created_at).toLocaleString() : ""}
                  </div>
                </button>
              ))}
            </div>
            {activeApplication && (
              <div className="border border-[#C9A84C]/20 p-5 space-y-4">
                <h3 className="font-bold text-lg">Application detail</h3>
                {(activeApplication.preferred_role_id || activeApplication.responses?.volunteer_role_label) && (
                  <div className="border border-[#FF6B35]/30 bg-[#FF6B35]/5 p-3 text-sm">
                    <span className="text-[10px] uppercase text-[rgba(240,232,213,0.4)]">Preferred role</span>
                    <div className="font-bold text-[#FF6B35]">
                      {activeApplication.responses?.volunteer_role_label ??
                        roleTitleById(activeApplication.preferred_role_id) ??
                        "—"}
                    </div>
                  </div>
                )}
                {renderField("Status", (
                  <select className={inputClass} value={activeApplication.status} onChange={(e) => setActiveApplication({ ...activeApplication, status: e.target.value as VolunteerApplication["status"] })}>
                    {(["pending", "reviewed", "accepted", "rejected"] as const).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                ))}
                {renderField("Admin notes", <textarea className={`${inputClass} min-h-[80px]`} value={activeApplication.admin_notes ?? ""} onChange={(e) => setActiveApplication({ ...activeApplication, admin_notes: e.target.value })} />)}
                <div>
                  <p className={labelClass}>Responses</p>
                  <div className="space-y-2 text-sm">
                    {Object.entries(activeApplication.responses ?? {}).map(([key, val]) => (
                      <div key={key} className="border border-white/5 p-2">
                        <div className="text-[10px] uppercase text-[rgba(240,232,213,0.4)]">{key}</div>
                        <div className="text-[rgba(240,232,213,0.75)]">{String(val)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateApplication("accepted")}
                    disabled={saving || activeApplication.status === "accepted"}
                    className="bg-[#4CAF50] text-[#0B1828] px-4 py-2 text-[10px] uppercase font-bold disabled:opacity-50"
                  >
                    Approve volunteer
                  </button>
                  <button
                    type="button"
                    onClick={() => updateApplication("rejected")}
                    disabled={saving || activeApplication.status === "rejected"}
                    className="border border-red-400/40 text-red-300 px-4 py-2 text-[10px] uppercase font-bold disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => updateApplication()}
                    disabled={saving}
                    className="bg-[#C9A84C] text-[#0B1828] px-4 py-2 text-[10px] uppercase font-bold"
                  >
                    Save status
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminAbout;
