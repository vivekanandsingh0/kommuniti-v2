import { useCallback, useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminDb } from "@/lib/admin-db";
import {
  VOLUNTEER_GIG_STATUSES,
  VolunteerApplication,
  VolunteerGig,
  VolunteerMemberProfile,
  VolunteerNotice,
  VolunteerRole,
  emptyVolunteerGig,
  emptyVolunteerNotice,
} from "@/types/about";

type HubTab = "members" | "notices" | "gigs";

type ApprovedMember = {
  userId: string;
  name: string;
  email: string;
  profile: VolunteerMemberProfile | null;
  roleTitle: string | null;
};

const inputClass =
  "w-full bg-[rgba(240,232,213,0.03)] border border-[rgba(201,168,76,0.1)] rounded-sm py-2.5 px-3 text-sm focus:border-[#C9A84C] outline-none";
const labelClass = "text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] font-bold mb-1.5 block";

type AdminVolunteerHubProps = {
  roles: VolunteerRole[];
  applications: VolunteerApplication[];
  onRefresh: () => Promise<void>;
};

const AdminVolunteerHub = ({ roles, applications, onRefresh }: AdminVolunteerHubProps) => {
  const [hubTab, setHubTab] = useState<HubTab>("members");
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<ApprovedMember[]>([]);
  const [notices, setNotices] = useState<VolunteerNotice[]>([]);
  const [gigs, setGigs] = useState<VolunteerGig[]>([]);
  const [editingMember, setEditingMember] = useState<Partial<VolunteerMemberProfile> | null>(null);
  const [editingNotice, setEditingNotice] = useState<Partial<VolunteerNotice> | null>(null);
  const [editingGig, setEditingGig] = useState<Partial<VolunteerGig> | null>(null);
  const [isNewNotice, setIsNewNotice] = useState(false);
  const [isNewGig, setIsNewGig] = useState(false);

  const loadHub = useCallback(async () => {
    const accepted = applications.filter((a) => a.status === "accepted");
    const [profilesRes, noticesRes, gigsRes] = await Promise.all([
      adminDb.from("volunteer_member_profiles").select("*, role:volunteer_roles(*)"),
      adminDb.from("volunteer_notices").select("*").order("created_at", { ascending: false }),
      adminDb.from("volunteer_gigs").select("*, role:volunteer_roles(*)").order("created_at", { ascending: false }),
    ]);

    const profiles = (profilesRes.data ?? []) as (VolunteerMemberProfile & { role?: VolunteerRole })[];

    const memberList: ApprovedMember[] = accepted.map((app) => {
      const userId = app.user_id ?? "";
      const profileRow = userId ? profiles.find((p) => p.user_id === userId) ?? null : null;
      const roleTitle =
        profileRow?.role?.title ??
        (app.responses?.volunteer_role_label ? String(app.responses.volunteer_role_label) : null) ??
        roles.find((r) => r.id === app.preferred_role_id)?.title ??
        null;

      return {
        userId,
        name: app.applicant_name ?? "Volunteer",
        email: app.applicant_email ?? "",
        profile: profileRow,
        roleTitle,
      };
    });

    setMembers(memberList);
    setNotices((noticesRes.data as VolunteerNotice[]) ?? []);
    setGigs((gigsRes.data as VolunteerGig[]) ?? []);
  }, [applications, roles]);

  useEffect(() => {
    loadHub();
  }, [loadHub]);

  const saveMemberProfile = async () => {
    if (!editingMember?.user_id) return;
    setSaving(true);
    try {
      const { error } = await adminDb.from("volunteer_member_profiles").upsert(
        {
          user_id: editingMember.user_id,
          role_id: editingMember.role_id || null,
          location: editingMember.location?.trim() || null,
          availability: editingMember.availability?.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
      if (error) throw error;
      toast.success("Volunteer profile updated");
      setEditingMember(null);
      await loadHub();
      await onRefresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Save failed — run volunteer_hub_schema.sql first");
    } finally {
      setSaving(false);
    }
  };

  const saveNotice = async () => {
    if (!editingNotice?.title?.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        user_id: editingNotice.user_id || null,
        title: editingNotice.title,
        body: editingNotice.body ?? "",
        is_pinned: editingNotice.is_pinned ?? false,
        is_visible: editingNotice.is_visible ?? true,
        updated_at: new Date().toISOString(),
      };
      if (isNewNotice) {
        const { error } = await adminDb.from("volunteer_notices").insert(payload);
        if (error) throw error;
      } else if (editingNotice.id) {
        const { error } = await adminDb.from("volunteer_notices").update(payload).eq("id", editingNotice.id);
        if (error) throw error;
      }
      toast.success("Notice saved");
      setEditingNotice(null);
      setIsNewNotice(false);
      await loadHub();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const saveGig = async () => {
    if (!editingGig?.title?.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const status = editingGig.status ?? "open";
      const assigned = editingGig.assigned_user_id || null;
      const payload = {
        assigned_user_id: assigned,
        role_id: editingGig.role_id || null,
        title: editingGig.title,
        description: editingGig.description ?? "",
        location: editingGig.location?.trim() || null,
        status: assigned && status === "open" ? "assigned" : status,
        due_date: editingGig.due_date || null,
        ko_coins_reward: editingGig.ko_coins_reward ?? 0,
        updated_at: new Date().toISOString(),
      };
      if (isNewGig) {
        const { error } = await adminDb.from("volunteer_gigs").insert(payload);
        if (error) throw error;
      } else if (editingGig.id) {
        const { error } = await adminDb.from("volunteer_gigs").update(payload).eq("id", editingGig.id);
        if (error) throw error;
      }
      toast.success("Gig saved");
      setEditingGig(null);
      setIsNewGig(false);
      await loadHub();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteRow = async (table: string, id: string, label: string) => {
    if (!confirm(`Delete this ${label}?`)) return;
    try {
      const { error } = await adminDb.from(table).delete().eq("id", id);
      if (error) throw error;
      toast.success("Deleted");
      await loadHub();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const renderField = (label: string, node: React.ReactNode, key?: string) => (
    <div key={key}>
      <label className={labelClass}>{label}</label>
      {node}
    </div>
  );

  const hubTabs: { id: HubTab; label: string }[] = [
    { id: "members", label: `Members (${members.length})` },
    { id: "notices", label: `Notices (${notices.length})` },
    { id: "gigs", label: `Gigs (${gigs.length})` },
  ];

  return (
    <div>
      <p className="text-sm text-[rgba(240,232,213,0.45)] mb-6 max-w-2xl">
        Manage approved volunteer profiles, post notices (all volunteers or individual), and create gigs they see on their profile.
      </p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {hubTabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setHubTab(id)}
            className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold border transition-all ${
              hubTab === id
                ? "bg-[#4895EF] text-[#0B1828] border-[#4895EF]"
                : "border-[rgba(201,168,76,0.2)] text-[rgba(240,232,213,0.5)] hover:border-[#4895EF]/40"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {hubTab === "members" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            {members.length === 0 && (
              <p className="text-sm text-[rgba(240,232,213,0.4)]">No approved volunteers yet — approve applications first.</p>
            )}
            {members.map((m) => (
              <button
                key={m.email || m.userId}
                type="button"
                onClick={() => {
                  if (!m.userId) {
                    toast.message("This volunteer has no linked account yet — badge applies when they sign up.");
                    return;
                  }
                  setEditingMember(
                    m.profile ?? {
                      user_id: m.userId,
                      role_id: applications.find((a) => a.user_id === m.userId)?.preferred_role_id ?? null,
                      location: String(applications.find((a) => a.user_id === m.userId)?.responses?.location ?? "") || null,
                      availability: String(applications.find((a) => a.user_id === m.userId)?.responses?.availability ?? "") || null,
                    }
                  );
                }}
                className={`w-full text-left border p-4 transition-colors ${
                  editingMember?.user_id === m.profile?.user_id ? "border-[#C9A84C]" : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="font-bold">{m.name}</div>
                <div className="text-xs text-[rgba(240,232,213,0.45)]">{m.email}</div>
                <div className="text-[10px] uppercase tracking-[2px] text-[#C9A84C] mt-2">
                  {m.roleTitle ?? "No role set"} · {m.profile?.location ?? "No location"}
                  {!m.userId && " · No account linked"}
                </div>
              </button>
            ))}
          </div>

          {editingMember && editingMember.user_id && (
            <div className="border border-[#C9A84C]/20 p-5 space-y-3">
              <h3 className="font-bold">Edit volunteer profile</h3>
              {renderField(
                "Role",
                <select
                  className={inputClass}
                  value={editingMember.role_id ?? ""}
                  onChange={(e) => setEditingMember({ ...editingMember, role_id: e.target.value || null })}
                >
                  <option value="">— Select role —</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              )}
              {renderField(
                "Location",
                <input
                  className={inputClass}
                  value={editingMember.location ?? ""}
                  onChange={(e) => setEditingMember({ ...editingMember, location: e.target.value })}
                  placeholder="City / Country"
                />
              )}
              {renderField(
                "Availability",
                <input
                  className={inputClass}
                  value={editingMember.availability ?? ""}
                  onChange={(e) => setEditingMember({ ...editingMember, availability: e.target.value })}
                  placeholder="e.g. Weekends, Part-time"
                />
              )}
              <button
                type="button"
                onClick={saveMemberProfile}
                disabled={saving}
                className="bg-[#C9A84C] text-[#0B1828] px-4 py-2 text-[10px] uppercase font-bold flex items-center gap-2"
              >
                <Save size={14} /> Save profile
              </button>
            </div>
          )}
        </div>
      )}

      {hubTab === "notices" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                setIsNewNotice(true);
                setEditingNotice(emptyVolunteerNotice());
              }}
              className="flex items-center gap-2 text-[10px] uppercase text-[#4895EF] mb-4"
            >
              <Plus size={14} /> Add notice
            </button>
            {notices.map((n) => (
              <div key={n.id} className="border border-white/10 p-4 flex justify-between gap-3">
                <div>
                  <div className="font-bold text-sm">{n.title}</div>
                  <div className="text-[10px] text-[rgba(240,232,213,0.4)]">
                    {n.user_id ? "Individual" : "All volunteers"}
                    {n.is_pinned ? " · Pinned" : ""}
                    {!n.is_visible ? " · Hidden" : ""}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewNotice(false);
                      setEditingNotice(n);
                    }}
                    className="text-[10px] uppercase text-[#4895EF]"
                  >
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteRow("volunteer_notices", n.id, "notice")}>
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editingNotice && (
            <div className="border border-[#4895EF]/20 p-5 space-y-3">
              {renderField(
                "Title",
                <input
                  className={inputClass}
                  value={editingNotice.title ?? ""}
                  onChange={(e) => setEditingNotice({ ...editingNotice, title: e.target.value })}
                />
              )}
              {renderField(
                "Body",
                <textarea
                  className={`${inputClass} min-h-[120px]`}
                  value={editingNotice.body ?? ""}
                  onChange={(e) => setEditingNotice({ ...editingNotice, body: e.target.value })}
                />
              )}
              {renderField(
                "Target volunteer (blank = all)",
                <select
                  className={inputClass}
                  value={editingNotice.user_id ?? ""}
                  onChange={(e) => setEditingNotice({ ...editingNotice, user_id: e.target.value || null })}
                >
                  <option value="">All approved volunteers</option>
                  {members
                    .filter((m) => m.userId && applications.some((a) => a.user_id === m.userId))
                    .map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                </select>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editingNotice.is_pinned ?? false}
                  onChange={(e) => setEditingNotice({ ...editingNotice, is_pinned: e.target.checked })}
                />
                Pin to top
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editingNotice.is_visible ?? true}
                  onChange={(e) => setEditingNotice({ ...editingNotice, is_visible: e.target.checked })}
                />
                Visible
              </label>
              <button type="button" onClick={saveNotice} className="bg-[#4895EF] text-[#0B1828] px-4 py-2 text-[10px] uppercase font-bold">
                Save notice
              </button>
            </div>
          )}
        </div>
      )}

      {hubTab === "gigs" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                setIsNewGig(true);
                setEditingGig(emptyVolunteerGig());
              }}
              className="flex items-center gap-2 text-[10px] uppercase text-[#FF6B35] mb-4"
            >
              <Plus size={14} /> Add gig
            </button>
            {gigs.map((g) => (
              <div key={g.id} className="border border-white/10 p-4 flex justify-between gap-3">
                <div>
                  <div className="font-bold text-sm">{g.title}</div>
                  <div className="text-[10px] text-[rgba(240,232,213,0.4)]">
                    {g.status}
                    {g.assigned_user_id ? " · Assigned" : " · Open pool"}
                    {g.ko_coins_reward ? ` · ${g.ko_coins_reward} coins` : ""}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewGig(false);
                      setEditingGig(g);
                    }}
                    className="text-[10px] uppercase text-[#FF6B35]"
                  >
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteRow("volunteer_gigs", g.id, "gig")}>
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editingGig && (
            <div className="border border-[#FF6B35]/20 p-5 space-y-3">
              {renderField(
                "Title",
                <input
                  className={inputClass}
                  value={editingGig.title ?? ""}
                  onChange={(e) => setEditingGig({ ...editingGig, title: e.target.value })}
                />
              )}
              {renderField(
                "Description",
                <textarea
                  className={`${inputClass} min-h-[80px]`}
                  value={editingGig.description ?? ""}
                  onChange={(e) => setEditingGig({ ...editingGig, description: e.target.value })}
                />
              )}
              {renderField(
                "Location",
                <input
                  className={inputClass}
                  value={editingGig.location ?? ""}
                  onChange={(e) => setEditingGig({ ...editingGig, location: e.target.value })}
                />
              )}
              {renderField(
                "Related role",
                <select
                  className={inputClass}
                  value={editingGig.role_id ?? ""}
                  onChange={(e) => setEditingGig({ ...editingGig, role_id: e.target.value || null })}
                >
                  <option value="">Any role</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              )}
              {renderField(
                "Assign to volunteer (blank = open gig)",
                <select
                  className={inputClass}
                  value={editingGig.assigned_user_id ?? ""}
                  onChange={(e) => setEditingGig({ ...editingGig, assigned_user_id: e.target.value || null })}
                >
                  <option value="">Open — any volunteer can see</option>
                  {members
                    .filter((m) => m.userId && applications.some((a) => a.user_id === m.userId))
                    .map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.name}
                      </option>
                    ))}
                </select>
              )}
              {renderField(
                "Status",
                <select
                  className={inputClass}
                  value={editingGig.status ?? "open"}
                  onChange={(e) => setEditingGig({ ...editingGig, status: e.target.value as VolunteerGig["status"] })}
                >
                  {VOLUNTEER_GIG_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              )}
              {renderField(
                "Due date",
                <input
                  type="date"
                  className={inputClass}
                  value={editingGig.due_date ?? ""}
                  onChange={(e) => setEditingGig({ ...editingGig, due_date: e.target.value || null })}
                />
              )}
              {renderField(
                "KO Coins reward",
                <input
                  type="number"
                  className={inputClass}
                  value={editingGig.ko_coins_reward ?? 0}
                  onChange={(e) => setEditingGig({ ...editingGig, ko_coins_reward: Number(e.target.value) })}
                />
              )}
              <button type="button" onClick={saveGig} className="bg-[#FF6B35] text-[#0B1828] px-4 py-2 text-[10px] uppercase font-bold">
                Save gig
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminVolunteerHub;
