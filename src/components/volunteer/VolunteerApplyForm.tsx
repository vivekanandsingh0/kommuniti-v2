import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Send } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import {
  fetchUserVolunteerApplication,
  submitVolunteerApplication,
  validateVolunteerResponses,
} from "@/lib/about";
import {
  VolunteerFormField,
  VolunteerFormSettings,
  VolunteerRole,
} from "@/types/about";

const inputClass =
  "w-full bg-[rgba(240,232,213,0.04)] border border-[rgba(201,168,76,0.15)] p-3 outline-none focus:border-[#C9A84C] text-[#F0E8D5]";

const VolunteerFieldInput = ({
  field,
  value,
  roles,
  onChange,
}: {
  field: VolunteerFormField;
  value: string | boolean;
  roles: VolunteerRole[];
  onChange: (key: string, val: string | boolean) => void;
}) => {
  if (field.field_key === "volunteer_role") {
    const displayValue = String(value ?? "") || "__placeholder__";
    return (
      <Select
        value={displayValue}
        onValueChange={(v) => {
          if (v === "__placeholder__") return;
          onChange(field.field_key, v);
        }}
      >
        <SelectTrigger
          className={`${inputClass} h-auto min-h-[46px] rounded-none shadow-none focus:ring-1 focus:ring-[#C9A84C] focus:ring-offset-0`}
        >
          <SelectValue placeholder="Select a role..." />
        </SelectTrigger>
        <SelectContent className="bg-[#0B1828] border-[rgba(201,168,76,0.25)] text-[#F0E8D5]">
          <SelectItem value="__placeholder__" disabled className="text-[rgba(240,232,213,0.45)]">
            Select a role...
          </SelectItem>
          {roles.map((role) => (
            <SelectItem
              key={role.id}
              value={role.id}
              className="text-[#F0E8D5] focus:bg-[rgba(201,168,76,0.15)] focus:text-[#F0E8D5] data-[highlighted]:bg-[rgba(201,168,76,0.15)] data-[highlighted]:text-[#F0E8D5]"
            >
              {role.title}
              {role.is_featured ? " · Featured" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.field_type === "textarea") {
    return (
      <textarea
        className={`${inputClass} min-h-[100px]`}
        placeholder={field.placeholder ?? undefined}
        value={String(value ?? "")}
        onChange={(e) => onChange(field.field_key, e.target.value)}
      />
    );
  }

  if (field.field_type === "select") {
    const selectValue = String(value ?? "");
    const displayValue = selectValue || "__placeholder__";
    return (
      <Select
        value={displayValue}
        onValueChange={(v) => {
          if (v === "__placeholder__") return;
          onChange(field.field_key, v);
        }}
      >
        <SelectTrigger
          className={`${inputClass} h-auto min-h-[46px] rounded-none shadow-none focus:ring-1 focus:ring-[#C9A84C] focus:ring-offset-0`}
        >
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent className="bg-[#0B1828] border-[rgba(201,168,76,0.25)] text-[#F0E8D5]">
          <SelectItem value="__placeholder__" disabled className="text-[rgba(240,232,213,0.45)]">
            Select...
          </SelectItem>
          {field.options.map((opt) => (
            <SelectItem
              key={opt}
              value={opt}
              className="text-[#F0E8D5] focus:bg-[rgba(201,168,76,0.15)] focus:text-[#F0E8D5] data-[highlighted]:bg-[rgba(201,168,76,0.15)] data-[highlighted]:text-[#F0E8D5]"
            >
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.field_type === "checkbox") {
    return (
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={value === true}
          onChange={(e) => onChange(field.field_key, e.target.checked)}
          className="mt-1"
        />
        <span className="text-sm text-[rgba(240,232,213,0.65)]">{field.placeholder || field.label}</span>
      </label>
    );
  }

  const inputType =
    field.field_type === "email" ? "email" : field.field_type === "phone" ? "tel" : field.field_type === "url" ? "url" : "text";

  return (
    <input
      type={inputType}
      className={inputClass}
      placeholder={field.placeholder ?? undefined}
      value={String(value ?? "")}
      onChange={(e) => onChange(field.field_key, e.target.value)}
    />
  );
};

type VolunteerApplyFormProps = {
  accentColor?: string;
  volunteerSettings: VolunteerFormSettings;
  volunteerFields: VolunteerFormField[];
  roles: VolunteerRole[];
  preselectedRoleId?: string | null;
  showHeader?: boolean;
  startExpanded?: boolean;
};

const VolunteerApplyForm = ({
  accentColor = "#C9A84C",
  volunteerSettings,
  volunteerFields,
  roles,
  preselectedRoleId,
  showHeader = true,
  startExpanded = false,
}: VolunteerApplyFormProps) => {
  const { user } = useAuth();
  const [responses, setResponses] = useState<Record<string, string | boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingApplication, setExistingApplication] = useState<{ status: string } | null>(null);
  const [formExpanded, setFormExpanded] = useState(startExpanded);

  const activeFields = useMemo(
    () =>
      volunteerFields.filter((f) => {
        if (f.is_active === false) return false;
        if (f.field_key === "volunteer_role" && roles.length === 0) return false;
        return true;
      }),
    [volunteerFields, roles]
  );

  useEffect(() => {
    const prefill: Record<string, string | boolean> = {};
    if (user) {
      const name =
        user.profile?.full_name ||
        (user.user_metadata as { full_name?: string })?.full_name ||
        "";
      if (name) prefill.full_name = name;
      if (user.email) prefill.email = user.email;
    }
    if (preselectedRoleId) prefill.volunteer_role = preselectedRoleId;
    setResponses(prefill);

    if (user) {
      fetchUserVolunteerApplication(user.id, user.email).then(({ application }) => {
        if (application) {
          setExistingApplication(application);
          if (application.status === "pending" || application.status === "reviewed") {
            setSubmitted(true);
          }
        }
      });
    }
  }, [user?.id, user?.email, preselectedRoleId]);

  useEffect(() => {
    if (preselectedRoleId) setFormExpanded(true);
  }, [preselectedRoleId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!volunteerSettings.is_open) return;

    const validationError = validateVolunteerResponses(activeFields, responses, roles);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const roleId = String(responses.volunteer_role ?? "").trim() || null;
    const roleTitle = roles.find((r) => r.id === roleId)?.title;
    const payloadResponses = {
      ...responses,
      ...(roleTitle ? { volunteer_role_label: roleTitle } : {}),
    };

    setSubmitting(true);
    const { error } = await submitVolunteerApplication({
      userId: user?.id ?? null,
      responses: payloadResponses,
      preferredRoleId: roleId,
    });
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setSubmitted(true);
    toast.success("Application submitted");
  };

  if (existingApplication?.status === "accepted" || user?.profile?.is_approved_volunteer) {
    return (
      <div className="border p-8" style={{ borderColor: `${accentColor}40`, background: `${accentColor}08` }}>
        <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Syne', sans-serif", color: accentColor }}>
          You&apos;re an approved Kommuniti volunteer
        </h3>
        <p className="text-[rgba(240,232,213,0.6)] leading-relaxed mb-4">
          Thank you for helping build neighbourhood-first community. Your badge is on your profile.
        </p>
        {user && (
          <Link to="/profile" className="text-[10px] uppercase tracking-[2px] font-bold" style={{ color: accentColor }}>
            View profile →
          </Link>
        )}
      </div>
    );
  }

  if (submitted || existingApplication?.status === "pending" || existingApplication?.status === "reviewed") {
    return (
      <div className="border p-8 text-center" style={{ borderColor: `${accentColor}40`, background: `${accentColor}08` }}>
        <p className="text-lg leading-relaxed">{volunteerSettings.success_message}</p>
        <p className="text-sm text-[rgba(240,232,213,0.45)] mt-3">
          Status: {existingApplication?.status ?? "pending"} — we&apos;ll review and get back to you.
        </p>
      </div>
    );
  }

  if (!volunteerSettings.is_open) {
    return (
      <div className="border border-white/10 p-8">
        <p className="text-[rgba(240,232,213,0.55)]">{volunteerSettings.closed_message}</p>
      </div>
    );
  }

  return (
    <div>
      {showHeader && (
        <>
          <h3 className="text-3xl sm:text-4xl font-extrabold mb-3" style={{ fontFamily: "'Syne', sans-serif", color: accentColor }}>
            {volunteerSettings.form_title}
          </h3>
          <p className="text-[rgba(240,232,213,0.55)] leading-relaxed mb-8">{volunteerSettings.form_description}</p>
        </>
      )}

      {!formExpanded ? (
        <button
          type="button"
          onClick={() => setFormExpanded(true)}
          className="inline-flex items-center gap-2 px-8 py-3 text-[11px] uppercase tracking-[2px] font-bold text-[#0B1828]"
          style={{ background: accentColor }}
        >
          <Send size={14} />
          Apply now — open form
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 border p-6 sm:p-8"
          style={{ borderColor: `${accentColor}30`, background: "rgba(240,232,213,0.02)" }}
        >
          {activeFields.map((field) => (
            <div key={field.id}>
              {field.field_type !== "checkbox" && (
                <label className="block text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.4)] mb-2">
                  {field.label}
                  {field.is_required && <span className="text-[#E63946]"> *</span>}
                </label>
              )}
              <VolunteerFieldInput
                field={field}
                value={responses[field.field_key] ?? ""}
                roles={roles}
                onChange={(key, val) => setResponses((prev) => ({ ...prev, [key]: val }))}
              />
              {field.help_text && (
                <p className="text-xs text-[rgba(240,232,213,0.35)] mt-1">{field.help_text}</p>
              )}
            </div>
          ))}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-8 py-3 text-[11px] uppercase tracking-[2px] font-bold text-[#0B1828] disabled:opacity-50"
              style={{ background: accentColor }}
            >
              <Heart size={14} />
              {submitting ? "Submitting..." : "Submit application"}
            </button>
            <button
              type="button"
              onClick={() => setFormExpanded(false)}
              className="text-[10px] uppercase tracking-[2px] text-[rgba(240,232,213,0.45)] px-4 py-3 border border-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default VolunteerApplyForm;
