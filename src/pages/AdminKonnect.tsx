import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCcw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { AdminKonnectRsvpPanel } from "@/components/admin/AdminKonnectRsvpPanel";
import { adminDb } from "@/lib/admin-db";
import { normalizeEvent, uploadEventCoverImage } from "@/lib/konnect";
import {
  DEFAULT_FEATURED,
  DEFAULT_PAGE_SETTINGS,
  KONNECT_TILE_PRESETS,
  KonnectEvent,
  KonnectFeatured,
  KonnectPageSettings,
  KonnectSessionType,
  emptyEvent,
  imagesFromTextarea,
  labelsFromDate,
  parsePostEventImages,
} from "@/types/konnect";

type Tab = "page" | "events" | "featured" | "rsvp-fields" | "rsvps";

const inputClass =
  "w-full bg-[rgba(240,232,213,0.03)] border border-[rgba(201,168,76,0.1)] rounded-sm py-2.5 px-3 text-sm focus:border-[#C9A84C] outline-none";
const labelClass =
  "text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] font-bold mb-1.5 block";

const AdminKonnect = () => {
  const [tab, setTab] = useState<Tab>("events");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pageSettings, setPageSettings] = useState<KonnectPageSettings>(DEFAULT_PAGE_SETTINGS);
  const [featured, setFeatured] = useState<KonnectFeatured>(DEFAULT_FEATURED);
  const [events, setEvents] = useState<KonnectEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<Partial<KonnectEvent> | null>(null);
  const [isNewEvent, setIsNewEvent] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, featuredRes, eventsRes] = await Promise.all([
        adminDb.from("konnect_page_settings").select("*").eq("id", 1).maybeSingle(),
        adminDb.from("konnect_featured").select("*").eq("id", 1).maybeSingle(),
        adminDb
          .from("konnect_events")
          .select("*")
          .order("sort_order", { ascending: true }),
      ]);

      if (settingsRes.error?.code === "42P01" || featuredRes.error?.code === "42P01") {
        toast.error("Run supabase/konnect_schema.sql in your Supabase SQL Editor first.");
        return;
      }

      if (settingsRes.error) throw settingsRes.error;
      if (featuredRes.error) throw featuredRes.error;
      if (eventsRes.error) throw eventsRes.error;

      if (settingsRes.data) setPageSettings(settingsRes.data as KonnectPageSettings);
      if (featuredRes.data) {
        const f = featuredRes.data as KonnectFeatured;
        setFeatured({
          ...f,
          post_event_images: parsePostEventImages(f.post_event_images),
        });
      }
      setEvents(((eventsRes.data as KonnectEvent[]) || []).map(normalizeEvent));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load Konnect data";
      toast.error(msg);
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
      const { error } = await adminDb
        .from("konnect_page_settings")
        .upsert({ ...pageSettings, id: 1, updated_at: new Date().toISOString() });
      if (error) throw error;
      toast.success("Page settings saved");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const saveFeatured = async () => {
    setSaving(true);
    try {
      const { error } = await adminDb
        .from("konnect_featured")
        .upsert({ ...featured, id: 1, updated_at: new Date().toISOString() });
      if (error) throw error;
      toast.success("Featured workshop saved");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const saveEvent = async () => {
    if (!editingEvent) return;
    if (!editingEvent.category?.trim() || !editingEvent.title?.trim()) {
      toast.error("Category and presenter/title are required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        sort_order: editingEvent.sort_order ?? events.length + 1,
        is_published: editingEvent.is_published ?? true,
        session_type: editingEvent.session_type ?? "in-person",
        event_date: editingEvent.event_date || null,
        month_label: editingEvent.month_label ?? "MAY",
        day_label: editingEvent.day_label ?? "01",
        category: editingEvent.category,
        title: editingEvent.title,
        icon: editingEvent.icon ?? "📅",
        tile_color: editingEvent.tile_color ?? KONNECT_TILE_PRESETS[0],
        cover_image_url: editingEvent.cover_image_url || null,
        registration_url: editingEvent.registration_url || null,
        ko_coins_earned: editingEvent.ko_coins_earned ?? null,
        long_description: editingEvent.long_description || null,
        location: editingEvent.location || null,
        schedule_detail: editingEvent.schedule_detail || null,
        capacity: editingEvent.capacity ?? null,
        post_event_message: editingEvent.post_event_message || null,
        post_event_images: editingEvent.post_event_images ?? [],
        rsvp_enabled: editingEvent.rsvp_enabled !== false,
        updated_at: new Date().toISOString(),
      };

      if (isNewEvent) {
        const { error } = await adminDb.from("konnect_events").insert(payload);
        if (error) throw error;
        toast.success("Event created");
      } else if (editingEvent.id) {
        const { error } = await adminDb
          .from("konnect_events")
          .update(payload)
          .eq("id", editingEvent.id);
        if (error) throw error;
        toast.success("Event updated");
      }

      setEditingEvent(null);
      setIsNewEvent(false);
      await loadAll();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      const { error } = await adminDb.from("konnect_events").delete().eq("id", id);
      if (error) throw error;
      toast.success("Event deleted");
      await loadAll();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const startNewEvent = () => {
    setIsNewEvent(true);
    setEditingEvent(emptyEvent(events.length + 1));
    setTab("events");
  };

  const applyEventDate = (iso: string) => {
    if (!iso || !editingEvent) return;
    const labels = labelsFromDate(iso);
    setEditingEvent({
      ...editingEvent,
      event_date: iso,
      month_label: labels.month_label,
      day_label: labels.day_label,
    });
  };

  return (
    <div className="min-h-screen bg-[#0B1828] text-[#F0E8D5] flex">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800 }} className="text-3xl mb-2">
              Konnect CMS
            </h1>
            <p className="text-[rgba(240,232,213,0.4)] text-sm">
              Manage sessions, RSVP forms, post-event recaps, and page copy — changes appear on{" "}
              <a href="/konnect" target="_blank" rel="noreferrer" className="text-[#FF6B35] hover:underline">
                /konnect
              </a>
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={loadAll}
              disabled={loading}
              className="flex items-center gap-2 bg-[rgba(240,232,213,0.05)] border border-[rgba(201,168,76,0.2)] text-[10px] tracking-[2px] uppercase px-4 py-2 hover:bg-[rgba(201,168,76,0.1)] disabled:opacity-50"
            >
              <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              type="button"
              onClick={startNewEvent}
              className="flex items-center gap-2 bg-[#FF6B35] text-[#0B1828] text-[10px] tracking-[2px] uppercase px-4 py-2 font-bold hover:opacity-90"
            >
              <Plus size={14} /> Add Event
            </button>
          </div>
        </header>

        <div className="flex gap-2 mb-8 flex-wrap">
          {(
            [
              ["page", "Page Copy"],
              ["events", `Events (${events.length})`],
              ["featured", "Featured Workshop"],
              ["rsvp-fields", "RSVP Fields"],
              ["rsvps", "RSVPs"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold border transition-all ${
                tab === id
                  ? "bg-[rgba(255,107,53,0.15)] border-[#FF6B35] text-[#FF6B35]"
                  : "border-[rgba(201,168,76,0.15)] text-[rgba(240,232,213,0.4)] hover:text-[#F0E8D5]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-20 text-center text-[rgba(240,232,213,0.3)]">
            <RefreshCcw size={40} className="mx-auto mb-4 animate-spin" />
            <p className="uppercase tracking-[3px] text-xs">Loading Konnect CMS…</p>
          </div>
        ) : (
          <>
            {tab === "page" && (
              <div className="max-w-2xl space-y-6 bg-[rgba(240,232,213,0.02)] border border-[rgba(201,168,76,0.1)] p-6 rounded-sm">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#C9A84C]">Hero & labels</h2>
                {(
                  [
                    ["tagline", "Tagline"],
                    ["hero_line_1", "Hero line 1 (orange)"],
                    ["hero_line_2", "Hero line 2"],
                    ["hero_line_3", "Hero line 3"],
                    ["sessions_section_label", "Sessions section label"],
                    ["featured_section_label", "Featured section label"],
                    ["filter_upcoming_label", "Tab: Upcoming"],
                    ["filter_online_label", "Tab: Online"],
                    ["filter_in_person_label", "Tab: In-Person"],
                    ["filter_on_demand_label", "Tab: On-Demand"],
                    ["past_section_label", "Past sessions section label"],
                    ["rsvp_section_label", "RSVP section label"],
                    ["post_event_section_label", "Post-event recap label"],
                    ["accent_color", "Accent color (hex)"],
                  ] as const
                ).map(([key, lbl]) => (
                  <div key={key}>
                    <label className={labelClass}>{lbl}</label>
                    <input
                      className={inputClass}
                      value={pageSettings[key] ?? ""}
                      onChange={(e) => setPageSettings({ ...pageSettings, [key]: e.target.value })}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={savePageSettings}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#C9A84C] text-[#0B1828] px-6 py-2.5 text-[10px] uppercase tracking-widest font-bold disabled:opacity-50"
                >
                  <Save size={14} /> Save page settings
                </button>
              </div>
            )}

            {tab === "featured" && (
              <div className="max-w-3xl space-y-4 bg-[rgba(240,232,213,0.02)] border border-[rgba(201,168,76,0.1)] p-6 rounded-sm">
                <label className="flex items-center gap-2 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={featured.rsvp_enabled !== false}
                    onChange={(e) => setFeatured({ ...featured, rsvp_enabled: e.target.checked })}
                  />
                  <span className="text-sm">RSVP form enabled on featured page</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={featured.is_visible}
                    onChange={(e) => setFeatured({ ...featured, is_visible: e.target.checked })}
                  />
                  <span className="text-sm">Show featured banner on public page</span>
                </label>
                <div className="grid sm:grid-cols-2 gap-4">
                  {(
                    [
                      ["icon", "Icon (emoji)"],
                      ["badge_text", "Badge text"],
                      ["title", "Title"],
                      ["description", "Description"],
                      ["schedule_text", "Schedule"],
                      ["seats_text", "Seats"],
                      ["ko_coins_text", "KO Coins line"],
                      ["price_inr", "Price (INR)"],
                      ["price_ko_coins", "Price (KO Coins)"],
                      ["button_label", "RSVP button label"],
                      ["button_color", "Button color"],
                      ["border_color", "Border color"],
                      ["icon_bg_start", "Icon bg start"],
                      ["icon_bg_end", "Icon bg end"],
                    ] as const
                  ).map(([key, lbl]) => (
                    <div key={key} className={key === "description" ? "sm:col-span-2" : ""}>
                      <label className={labelClass}>{lbl}</label>
                      {key === "description" ? (
                        <textarea
                          className={`${inputClass} min-h-[80px]`}
                          value={featured[key]}
                          onChange={(e) => setFeatured({ ...featured, [key]: e.target.value })}
                        />
                      ) : (
                        <input
                          className={inputClass}
                          value={featured[key] ?? ""}
                          onChange={(e) =>
                            setFeatured({
                              ...featured,
                              [key]: e.target.value || (key === "button_url" ? null : e.target.value),
                            })
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <label className={labelClass}>Location (optional)</label>
                  <input
                    className={inputClass}
                    value={featured.location ?? ""}
                    onChange={(e) => setFeatured({ ...featured, location: e.target.value || null })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Post-event message (shown after workshop)</label>
                  <textarea
                    className={`${inputClass} min-h-[80px]`}
                    value={featured.post_event_message ?? ""}
                    onChange={(e) => setFeatured({ ...featured, post_event_message: e.target.value || null })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Post-event image URLs (one per line)</label>
                  <textarea
                    className={`${inputClass} min-h-[80px]`}
                    value={(featured.post_event_images ?? []).join("\n")}
                    onChange={(e) =>
                      setFeatured({ ...featured, post_event_images: imagesFromTextarea(e.target.value) })
                    }
                    placeholder="https://…"
                  />
                </div>
                <button
                  type="button"
                  onClick={saveFeatured}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#C9A84C] text-[#0B1828] px-6 py-2.5 text-[10px] uppercase tracking-widest font-bold disabled:opacity-50 mt-4"
                >
                  <Save size={14} /> Save featured workshop
                </button>
              </div>
            )}

            {tab === "events" && (
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  {events.length === 0 ? (
                    <p className="text-[rgba(240,232,213,0.3)] text-sm p-8 text-center border border-dashed border-[rgba(201,168,76,0.2)]">
                      No events yet. Add one or run the SQL seed.
                    </p>
                  ) : (
                    events.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-stretch gap-3 border border-[rgba(201,168,76,0.1)] bg-[rgba(240,232,213,0.02)] overflow-hidden"
                      >
                        <div
                          className="w-3 shrink-0"
                          style={{ background: ev.tile_color }}
                        />
                        <div className="flex-1 py-3 pr-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] uppercase tracking-widest text-[rgba(240,232,213,0.4)]">
                              {ev.month_label} {ev.day_label} · {ev.session_type}
                            </span>
                            {!ev.is_published && (
                              <span className="text-[9px] bg-[#E63946]/20 text-[#E63946] px-1.5 py-0.5 uppercase">
                                Hidden
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-bold">{ev.category}</div>
                          <div className="text-xs text-[rgba(240,232,213,0.5)]">{ev.title}</div>
                        </div>
                        <div className="flex flex-col justify-center gap-1 pr-3">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEvent(ev);
                              setIsNewEvent(false);
                            }}
                            className="text-[9px] uppercase tracking-widest text-[#C9A84C] hover:underline px-2 py-1"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteEvent(ev.id)}
                            className="text-[9px] uppercase tracking-widest text-[#E63946] hover:underline px-2 py-1 flex items-center gap-1"
                          >
                            <Trash2 size={10} /> Del
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {editingEvent && (
                  <div className="bg-[rgba(240,232,213,0.02)] border border-[rgba(255,107,53,0.25)] p-6 rounded-sm sticky top-6 h-fit">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#FF6B35] mb-4">
                      {isNewEvent ? "New event" : "Edit event"}
                    </h3>

                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingEvent.is_published ?? true}
                          onChange={(e) =>
                            setEditingEvent({ ...editingEvent, is_published: e.target.checked })
                          }
                        />
                        <span className="text-sm">Published (visible on site)</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingEvent.rsvp_enabled !== false}
                          onChange={(e) =>
                            setEditingEvent({ ...editingEvent, rsvp_enabled: e.target.checked })
                          }
                        />
                        <span className="text-sm">RSVP form enabled</span>
                      </label>

                      <div>
                        <label className={labelClass}>Session type</label>
                        <select
                          className={inputClass}
                          value={editingEvent.session_type ?? "in-person"}
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              session_type: e.target.value as KonnectSessionType,
                            })
                          }
                        >
                          <option value="in-person">In-Person</option>
                          <option value="online">Online</option>
                          <option value="on-demand">On-Demand</option>
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>Event date</label>
                        <input
                          type="date"
                          className={inputClass}
                          value={editingEvent.event_date ?? ""}
                          onChange={(e) => applyEventDate(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Month label</label>
                          <input
                            className={inputClass}
                            value={editingEvent.month_label ?? ""}
                            onChange={(e) =>
                              setEditingEvent({ ...editingEvent, month_label: e.target.value.toUpperCase() })
                            }
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Day label</label>
                          <input
                            className={inputClass}
                            value={editingEvent.day_label ?? ""}
                            onChange={(e) =>
                              setEditingEvent({ ...editingEvent, day_label: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Category (small caps line)</label>
                        <input
                          className={inputClass}
                          value={editingEvent.category ?? ""}
                          onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Presenter / title</label>
                        <input
                          className={inputClass}
                          value={editingEvent.title ?? ""}
                          onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Icon (emoji)</label>
                        <input
                          className={inputClass}
                          value={editingEvent.icon ?? ""}
                          onChange={(e) => setEditingEvent({ ...editingEvent, icon: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Event Cover Image (Recommended: 800 × 400 px, max 5MB)</label>
                        <div className="flex items-center gap-4 bg-[rgba(240,232,213,0.03)] border border-[rgba(201,168,76,0.1)] p-4 mb-4 rounded-sm">
                          {editingEvent.cover_image_url ? (
                            <img
                              src={editingEvent.cover_image_url}
                              alt="Cover preview"
                              className="w-24 h-12 border border-white/20 shrink-0 object-contain bg-[#0b1828]"
                            />
                          ) : (
                            <div
                              className="w-24 h-12 border border-white/10 shrink-0 flex items-center justify-center text-[9px] text-[rgba(240,232,213,0.3)] uppercase tracking-wider rounded-sm text-center"
                              style={{ background: editingEvent.tile_color || KONNECT_TILE_PRESETS[0] }}
                            >
                              No Cover
                            </div>
                          )}
                          <div className="space-y-1.5 flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  toast.loading("Uploading event cover...", { id: "upload-event-cover" });
                                  const targetEventId = editingEvent.id || `new-event-${Date.now()}`;
                                  const url = await uploadEventCoverImage(file, targetEventId);
                                  setEditingEvent({ ...editingEvent, cover_image_url: url });
                                  toast.success("Event cover uploaded successfully!", { id: "upload-event-cover" });
                                } catch (err: any) {
                                  toast.error(err.message || "Upload failed", { id: "upload-event-cover" });
                                }
                              }}
                              className="hidden"
                              id="event-cover-upload"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => document.getElementById("event-cover-upload")?.click()}
                                className="px-3 py-1.5 border border-[#C9A84C] text-[#C9A84C] text-[9px] uppercase tracking-[1.5px] font-bold bg-transparent hover:bg-[#C9A84C]/10 transition-all"
                              >
                                {editingEvent.cover_image_url ? "Change" : "Upload"}
                              </button>
                              {editingEvent.cover_image_url && (
                                <button
                                  type="button"
                                  onClick={() => setEditingEvent({ ...editingEvent, cover_image_url: null })}
                                  className="px-3 py-1.5 border border-red-500/50 text-red-400 text-[9px] uppercase tracking-[1.5px] font-bold bg-transparent hover:bg-red-500/10 transition-all"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Tile color</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {KONNECT_TILE_PRESETS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setEditingEvent({ ...editingEvent, tile_color: c })}
                              className="w-8 h-8 border-2 transition-all"
                              style={{
                                background: c,
                                borderColor:
                                  editingEvent.tile_color === c ? "#F0E8D5" : "transparent",
                              }}
                            />
                          ))}
                        </div>
                        <input
                          className={inputClass}
                          value={editingEvent.tile_color ?? ""}
                          onChange={(e) => setEditingEvent({ ...editingEvent, tile_color: e.target.value })}
                          placeholder="#4DC9C9"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Long description (event page)</label>
                        <textarea
                          className={`${inputClass} min-h-[100px]`}
                          value={editingEvent.long_description ?? ""}
                          onChange={(e) =>
                            setEditingEvent({ ...editingEvent, long_description: e.target.value || null })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Location</label>
                          <input
                            className={inputClass}
                            value={editingEvent.location ?? ""}
                            onChange={(e) =>
                              setEditingEvent({ ...editingEvent, location: e.target.value || null })
                            }
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Schedule detail</label>
                          <input
                            className={inputClass}
                            value={editingEvent.schedule_detail ?? ""}
                            onChange={(e) =>
                              setEditingEvent({ ...editingEvent, schedule_detail: e.target.value || null })
                            }
                            placeholder="Sat 10am–1pm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Capacity (optional)</label>
                        <input
                          type="number"
                          className={inputClass}
                          value={editingEvent.capacity ?? ""}
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              capacity: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Post-event message</label>
                        <textarea
                          className={`${inputClass} min-h-[80px]`}
                          value={editingEvent.post_event_message ?? ""}
                          onChange={(e) =>
                            setEditingEvent({ ...editingEvent, post_event_message: e.target.value || null })
                          }
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Post-event image URLs (one per line)</label>
                        <textarea
                          className={`${inputClass} min-h-[80px]`}
                          value={(editingEvent.post_event_images ?? []).join("\n")}
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              post_event_images: imagesFromTextarea(e.target.value),
                            })
                          }
                          placeholder="https://…"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Legacy external URL (optional, unused if RSVP on)</label>
                        <input
                          className={inputClass}
                          value={editingEvent.registration_url ?? ""}
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              registration_url: e.target.value || null,
                            })
                          }
                          placeholder="https://..."
                        />
                      </div>

                      <div>
                        <label className={labelClass}>KO Coins earned (optional)</label>
                        <input
                          type="number"
                          className={inputClass}
                          value={editingEvent.ko_coins_earned ?? ""}
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              ko_coins_earned: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Sort order</label>
                        <input
                          type="number"
                          className={inputClass}
                          value={editingEvent.sort_order ?? 0}
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              sort_order: Number(e.target.value),
                            })
                          }
                        />
                      </div>

                      {/* Preview */}
                      <div>
                        <label className={labelClass}>Preview</label>
                        <div
                          className="relative p-4 min-h-[120px] flex flex-col justify-between text-white overflow-hidden transition-all"
                          style={{
                            background: editingEvent.cover_image_url
                              ? `linear-gradient(to bottom, ${(editingEvent.tile_color ?? "#4DC9C9")}B3 0%, #0B1828FA 100%), url(${editingEvent.cover_image_url}) center/cover no-repeat`
                              : editingEvent.tile_color ?? "#4DC9C9",
                            borderLeft: editingEvent.cover_image_url ? `4px solid ${editingEvent.tile_color ?? "#4DC9C9"}` : undefined,
                          }}
                        >
                          <span className="text-[10px] tracking-[3px] uppercase opacity-80">
                            {editingEvent.month_label}
                          </span>
                          <span
                            className="absolute top-2 right-3 text-5xl font-extrabold opacity-15"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                          >
                            {editingEvent.day_label}
                          </span>
                          <div>
                            <div className="text-[10px] uppercase tracking-wide opacity-85">
                              {editingEvent.category}
                            </div>
                            <div className="font-bold text-sm">{editingEvent.title}</div>
                          </div>
                          <span className="absolute bottom-2 right-3 text-2xl opacity-20">
                            {editingEvent.icon}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-6">
                      <button
                        type="button"
                        onClick={saveEvent}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#FF6B35] text-white py-2.5 text-[10px] uppercase tracking-widest font-bold disabled:opacity-50"
                      >
                        <Save size={14} /> {isNewEvent ? "Create" : "Update"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEvent(null);
                          setIsNewEvent(false);
                        }}
                        className="px-4 py-2.5 border border-[rgba(201,168,76,0.2)] text-[10px] uppercase tracking-widest"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(tab === "rsvp-fields" || tab === "rsvps") && (
              <AdminKonnectRsvpPanel events={events} subTab={tab === "rsvp-fields" ? "fields" : "submissions"} />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminKonnect;
