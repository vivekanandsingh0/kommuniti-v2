import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCcw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminDb } from "@/lib/admin-db";
import {
  KonnectEvent,
  KonnectRsvp,
  KonnectRsvpAppliesTo,
  KonnectRsvpField,
  KonnectRsvpFieldType,
  emptyRsvpField,
} from "@/types/konnect";

const inputClass =
  "w-full bg-[rgba(240,232,213,0.03)] border border-[rgba(201,168,76,0.1)] rounded-sm py-2.5 px-3 text-sm focus:border-[#C9A84C] outline-none";
const labelClass =
  "text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] font-bold mb-1.5 block";

type Props = {
  events: KonnectEvent[];
  subTab: "fields" | "submissions";
};

export function AdminKonnectRsvpPanel({ events, subTab }: Props) {
  const [fields, setFields] = useState<KonnectRsvpField[]>([]);
  const [rsvps, setRsvps] = useState<KonnectRsvp[]>([]);
  const [editingField, setEditingField] = useState<Partial<KonnectRsvpField> | null>(null);
  const [isNewField, setIsNewField] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadFields = useCallback(async () => {
    const { data, error } = await adminDb
      .from("konnect_rsvp_fields")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error?.code === "42P01") {
      toast.error("Run supabase/konnect_rsvp_schema.sql in Supabase first.");
      return;
    }
    if (error) throw error;
    setFields(
      ((data as KonnectRsvpField[]) ?? []).map((f) => ({
        ...f,
        options: Array.isArray(f.options) ? f.options : [],
      }))
    );
  }, []);

  const loadRsvps = useCallback(async () => {
    const { data, error } = await adminDb
      .from("konnect_rsvps")
      .select("*")
      .order("created_at", { ascending: false });
    if (error?.code === "42P01") return;
    if (error) throw error;
    setRsvps((data as KonnectRsvp[]) ?? []);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadFields(), loadRsvps()]);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load RSVP data");
    } finally {
      setLoading(false);
    }
  }, [loadFields, loadRsvps]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const saveField = async () => {
    if (!editingField?.label?.trim() || !editingField.field_key?.trim()) {
      toast.error("Label and field key are required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        sort_order: editingField.sort_order ?? fields.length + 1,
        is_active: editingField.is_active ?? true,
        applies_to: (editingField.applies_to ?? "all") as KonnectRsvpAppliesTo,
        event_id: editingField.applies_to === "event" ? editingField.event_id || null : null,
        field_key: editingField.field_key.trim().replace(/\s+/g, "_").toLowerCase(),
        label: editingField.label.trim(),
        field_type: (editingField.field_type ?? "text") as KonnectRsvpFieldType,
        placeholder: editingField.placeholder || null,
        help_text: editingField.help_text || null,
        options: editingField.field_type === "select" ? editingField.options ?? [] : [],
        is_required: editingField.is_required ?? false,
        updated_at: new Date().toISOString(),
      };

      if (isNewField) {
        const { error } = await adminDb.from("konnect_rsvp_fields").insert(payload);
        if (error) throw error;
        toast.success("Field created");
      } else if (editingField.id) {
        const { error } = await adminDb.from("konnect_rsvp_fields").update(payload).eq("id", editingField.id);
        if (error) throw error;
        toast.success("Field updated");
      }

      setEditingField(null);
      setIsNewField(false);
      await loadFields();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteField = async (id: string) => {
    if (!confirm("Delete this RSVP field?")) return;
    try {
      const { error } = await adminDb.from("konnect_rsvp_fields").delete().eq("id", id);
      if (error) throw error;
      toast.success("Field deleted");
      await loadFields();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const eventTitle = (eventId: string | null) => {
    if (!eventId) return "—";
    const ev = events.find((e) => e.id === eventId);
    return ev ? `${ev.category} · ${ev.title}` : eventId.slice(0, 8);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[rgba(240,232,213,0.3)]">
        <RefreshCcw size={32} className="mx-auto mb-3 animate-spin" />
        <p className="text-xs uppercase tracking-widest">Loading RSVP data…</p>
      </div>
    );
  }

  if (subTab === "submissions") {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-[rgba(240,232,213,0.5)]">{rsvps.length} registration(s)</p>
          <button
            type="button"
            onClick={loadRsvps}
            className="text-[10px] uppercase tracking-widest text-[#C9A84C] hover:underline"
          >
            Refresh
          </button>
        </div>
        {rsvps.length === 0 ? (
          <p className="text-sm text-[rgba(240,232,213,0.3)] p-8 border border-dashed border-[rgba(201,168,76,0.2)] text-center">
            No RSVPs yet.
          </p>
        ) : (
          <div className="overflow-x-auto border border-[rgba(201,168,76,0.1)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[rgba(240,232,213,0.03)] text-[10px] uppercase tracking-widest text-[rgba(240,232,213,0.4)]">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Event</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Responses</th>
                </tr>
              </thead>
              <tbody>
                {rsvps.map((r) => (
                  <tr key={r.id} className="border-t border-[rgba(201,168,76,0.08)]">
                    <td className="p-3 text-xs text-[rgba(240,232,213,0.5)] whitespace-nowrap">
                      {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                    </td>
                    <td className="p-3 text-xs">
                      {r.is_featured ? (
                        <span className="text-[#FF6B35]">Featured workshop</span>
                      ) : (
                        eventTitle(r.event_id)
                      )}
                    </td>
                    <td className="p-3">{r.attendee_name || "—"}</td>
                    <td className="p-3">{r.attendee_email}</td>
                    <td className="p-3 text-xs text-[rgba(240,232,213,0.55)] max-w-xs">
                      {Object.entries(r.responses || {})
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => {
            setIsNewField(true);
            setEditingField(emptyRsvpField(fields.length + 1));
          }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#FF6B35] font-bold mb-4"
        >
          <Plus size={14} /> Add RSVP field
        </button>

        {fields.length === 0 ? (
          <p className="text-sm text-[rgba(240,232,213,0.3)] p-8 border border-dashed border-[rgba(201,168,76,0.2)] text-center">
            No custom fields. Run konnect_rsvp_schema.sql or add fields here.
          </p>
        ) : (
          fields.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 border border-[rgba(201,168,76,0.1)] bg-[rgba(240,232,213,0.02)] p-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold">{f.label}</span>
                  {!f.is_active && (
                    <span className="text-[9px] bg-[#E63946]/20 text-[#E63946] px-1.5 uppercase">Off</span>
                  )}
                  {f.is_required && (
                    <span className="text-[9px] text-[#FF6B35] uppercase">Required</span>
                  )}
                </div>
                <div className="text-[10px] text-[rgba(240,232,213,0.4)] uppercase tracking-wider">
                  {f.field_key} · {f.field_type} · {f.applies_to}
                  {f.event_id ? ` · ${eventTitle(f.event_id)}` : ""}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingField(f);
                  setIsNewField(false);
                }}
                className="text-[9px] uppercase tracking-widest text-[#C9A84C] hover:underline px-2"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => deleteField(f.id)}
                className="text-[9px] uppercase tracking-widest text-[#E63946] hover:underline px-2"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))
        )}
      </div>

      {editingField && (
        <div className="bg-[rgba(240,232,213,0.02)] border border-[rgba(255,107,53,0.25)] p-6 sticky top-6 h-fit">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#FF6B35] mb-4">
            {isNewField ? "New RSVP field" : "Edit field"}
          </h3>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editingField.is_active ?? true}
                onChange={(e) => setEditingField({ ...editingField, is_active: e.target.checked })}
              />
              <span className="text-sm">Active (shown on form)</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editingField.is_required ?? false}
                onChange={(e) => setEditingField({ ...editingField, is_required: e.target.checked })}
              />
              <span className="text-sm">Required</span>
            </label>

            <div>
              <label className={labelClass}>Label</label>
              <input
                className={inputClass}
                value={editingField.label ?? ""}
                onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Field key (unique id)</label>
              <input
                className={inputClass}
                value={editingField.field_key ?? ""}
                onChange={(e) => setEditingField({ ...editingField, field_key: e.target.value })}
                disabled={!isNewField}
              />
            </div>

            <div>
              <label className={labelClass}>Field type</label>
              <select
                className={inputClass}
                value={editingField.field_type ?? "text"}
                onChange={(e) =>
                  setEditingField({
                    ...editingField,
                    field_type: e.target.value as KonnectRsvpFieldType,
                  })
                }
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="tel">Phone</option>
                <option value="textarea">Long text</option>
                <option value="select">Dropdown</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Applies to</label>
              <select
                className={inputClass}
                value={editingField.applies_to ?? "all"}
                onChange={(e) =>
                  setEditingField({
                    ...editingField,
                    applies_to: e.target.value as KonnectRsvpAppliesTo,
                    event_id: e.target.value === "event" ? editingField.event_id : null,
                  })
                }
              >
                <option value="all">All events & featured</option>
                <option value="event">Specific session only</option>
                <option value="featured">Featured workshop only</option>
              </select>
            </div>

            {editingField.applies_to === "event" && (
              <div>
                <label className={labelClass}>Session</label>
                <select
                  className={inputClass}
                  value={editingField.event_id ?? ""}
                  onChange={(e) => setEditingField({ ...editingField, event_id: e.target.value || null })}
                >
                  <option value="">All sessions (event-type fields)</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.month_label} {ev.day_label} — {ev.category}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className={labelClass}>Placeholder</label>
              <input
                className={inputClass}
                value={editingField.placeholder ?? ""}
                onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value || null })}
              />
            </div>

            <div>
              <label className={labelClass}>Help text</label>
              <input
                className={inputClass}
                value={editingField.help_text ?? ""}
                onChange={(e) => setEditingField({ ...editingField, help_text: e.target.value || null })}
              />
            </div>

            {editingField.field_type === "select" && (
              <div>
                <label className={labelClass}>Options (one per line)</label>
                <textarea
                  className={`${inputClass} min-h-[80px]`}
                  value={(editingField.options ?? []).join("\n")}
                  onChange={(e) =>
                    setEditingField({
                      ...editingField,
                      options: e.target.value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean),
                    })
                  }
                />
              </div>
            )}

            <div>
              <label className={labelClass}>Sort order</label>
              <input
                type="number"
                className={inputClass}
                value={editingField.sort_order ?? 0}
                onChange={(e) =>
                  setEditingField({ ...editingField, sort_order: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={saveField}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-[#FF6B35] text-white py-2.5 text-[10px] uppercase tracking-widest font-bold disabled:opacity-50"
            >
              <Save size={14} /> {isNewField ? "Create" : "Update"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingField(null);
                setIsNewField(false);
              }}
              className="px-4 py-2.5 border border-[rgba(201,168,76,0.2)] text-[10px] uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
