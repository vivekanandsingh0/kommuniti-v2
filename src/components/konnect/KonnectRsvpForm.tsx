import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { fetchKonnectRsvpFields, submitKonnectRsvp, validateRsvpResponses } from "@/lib/konnect";
import { KonnectRsvpAppliesTo, KonnectRsvpField } from "@/types/konnect";

type KonnectRsvpFormProps = {
  scope: KonnectRsvpAppliesTo;
  eventId?: string | null;
  accent?: string;
  submitLabel?: string;
  onSuccess?: () => void;
  brochureUrl?: string | null;
  waGroupLink?: string | null;
  postRsvpMessage?: string | null;
};

const inputClass =
  "w-full bg-[rgba(240,232,213,0.03)] border border-[rgba(201,168,76,0.15)] rounded-sm py-3 px-3 text-sm text-[#F0E8D5] focus:border-[#FF6B35] outline-none";

const KonnectRsvpForm = ({
  scope,
  eventId,
  accent = "#FF6B35",
  submitLabel = "Submit RSVP",
  onSuccess,
  brochureUrl,
  waGroupLink,
  postRsvpMessage,
}: KonnectRsvpFormProps) => {
  const { user } = useAuth();
  const [fields, setFields] = useState<KonnectRsvpField[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchKonnectRsvpFields(scope, eventId).then((f) => {
      setFields(f);
      const initial: Record<string, string> = {};
      if (user?.email) initial.email = user.email;
      if (user?.profile?.full_name) initial.full_name = user.profile.full_name;
      else if (user?.user_metadata?.full_name) initial.full_name = String(user.user_metadata.full_name);
      setValues(initial);
      setLoading(false);
    });
  }, [scope, eventId, user]);

  const setField = (key: string, val: string) => setValues((v) => ({ ...v, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateRsvpResponses(fields, values);
    if (err) {
      toast.error(err);
      return;
    }

    const email = (values.email || user?.email || "").trim().toLowerCase();
    const name = (values.full_name || user?.profile?.full_name || user?.email?.split("@")[0] || "Guest").trim();

    if (!email) {
      toast.error("Email is required");
      return;
    }

    setSubmitting(true);
    const { error } = await submitKonnectRsvp({
      eventId: scope === "event" ? eventId : null,
      isFeatured: scope === "featured",
      userId: user?.id ?? null,
      attendeeName: name,
      attendeeEmail: email,
      responses: values,
    });
    setSubmitting(false);

    if (error) {
      toast.error(error.message || "RSVP failed — run konnect_rsvp_schema.sql in Supabase");
      return;
    }

    setSubmitted(true);
    toast.success("You're registered! We'll be in touch.");
    onSuccess?.();
  };

  if (loading) {
    return <p className="text-[rgba(240,232,213,0.4)] text-sm py-6">Loading RSVP form…</p>;
  }

  if (submitted) {
    return (
      <div className="border border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.06)] p-6 rounded-sm text-center space-y-4">
        <div>
          <p className="text-lg font-bold text-[#C9A84C] mb-1">You're registered!</p>
          <p className="text-sm text-[rgba(240,232,213,0.7)] leading-relaxed">
            {postRsvpMessage || "Thank you for registering. Check your email for updates."}
          </p>
        </div>

        {(brochureUrl || waGroupLink) && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            {brochureUrl && (
              <a
                href={brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-[#C9A84C] text-[#C9A84C] text-[10px] uppercase tracking-widest font-bold hover:bg-[#C9A84C]/10 transition-all"
              >
                📥 Download Brochure
              </a>
            )}
            {waGroupLink && (
              <a
                href={waGroupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#25D366] text-[#0B1828] text-[10px] uppercase tracking-widest font-bold hover:opacity-90 transition-all"
              >
                💬 Join WhatsApp Group
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.id}>
          <label className="text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.45)] font-bold mb-1.5 block">
            {field.label}
            {field.is_required && <span className="text-[#FF6B35]"> *</span>}
          </label>
          {field.field_type === "textarea" ? (
            <textarea
              className={`${inputClass} min-h-[100px]`}
              placeholder={field.placeholder ?? undefined}
              value={values[field.field_key] ?? ""}
              onChange={(e) => setField(field.field_key, e.target.value)}
            />
          ) : field.field_type === "select" ? (
            <select
              className={inputClass}
              value={values[field.field_key] ?? ""}
              onChange={(e) => setField(field.field_key, e.target.value)}
            >
              <option value="">Select…</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.field_type === "email" ? "email" : field.field_type === "tel" ? "tel" : "text"}
              className={inputClass}
              placeholder={field.placeholder ?? undefined}
              value={values[field.field_key] ?? ""}
              onChange={(e) => setField(field.field_key, e.target.value)}
            />
          )}
          {field.help_text && (
            <p className="text-[10px] text-[rgba(240,232,213,0.35)] mt-1">{field.help_text}</p>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={submitting}
        style={{ background: accent }}
        className="w-full sm:w-auto text-[#0B1828] font-bold text-[11px] uppercase tracking-[2px] px-8 py-3 disabled:opacity-50 hover:opacity-90 transition-opacity"
      >
        {submitting ? "Submitting…" : submitLabel}
      </button>
    </form>
  );
};

export default KonnectRsvpForm;
