import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiFetch } from "../../services/api";

const inp = (hasError) => ({
  width          : "100%",
  border         : `1px solid ${hasError ? "#ef4444" : "#e2d0e2"}`,
  borderRadius   : "8px",
  padding        : "10px 14px",
  fontSize       : "14px",
  color          : "#701366",
  outline        : "none",
  boxSizing      : "border-box",
  fontFamily     : "Inter, sans-serif",
  backgroundColor: "#fff",
  transition     : "border-color 0.2s",
});

const readField = {
  ...inp(false),
  backgroundColor: "#faf5fa",
  minHeight: "40px",
  display: "flex",
  alignItems: "center",
};

const Field = ({ label, children, full = false }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px", ...(full ? { gridColumn: "1 / -1" } : {}), minWidth: 0 }}>
    {label ? <label style={{ fontSize: "13px", color: "#6b7280", fontFamily: "Inter, sans-serif" }}>{label}</label> : null}
    {children}
  </div>
);

const ReadField = ({ label, value }) => (
  <Field label={label}>
    <div style={readField}>
      {value || <span style={{ color: "#c9a8c9" }}>—</span>}
    </div>
  </Field>
);

const Card = ({ title, children }) => (
  <div style={{ background: "white", borderRadius: "16px", border: "1px solid #f3f4f6", padding: "24px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", boxSizing: "border-box", width: "100%", minWidth: 0 }}>
    <h3 style={{ fontSize: "19px", fontWeight: 700, color: "#701366", fontFamily: "Inter, sans-serif", marginBottom: "20px", margin: "0 0 20px 0" }}>{title}</h3>
    {children}
  </div>
);

function getStrength(pw) {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: "Weak",   color: "#ef4444", width: "25%"  };
  if (score === 2) return { label: "Fair",   color: "#f97316", width: "50%"  };
  if (score === 3) return { label: "Good",   color: "#eab308", width: "75%"  };
  return             { label: "Strong", color: "#22c55e", width: "100%" };
}

const DIRECTOR_EMAIL = "yousraztn.contact@gmail.com";

const Eye = ({ visible }) =>
  visible ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

const PwField = ({ label, field, form, setForm, show, onToggle, hasError }) => (
  <Field label={label}>
    <div style={{ position: "relative" }}>
      <input
        type={show[field] ? "text" : "password"}
        value={form[field]}
        onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
        placeholder="••••••••"
        style={{ ...inp(hasError), padding: "10px 40px 10px 14px" }}
      />
      <button type="button" onClick={() => onToggle(field)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#a07aa0", padding: 0, display: "flex" }}>
        <Eye visible={show[field]} />
      </button>
    </div>
  </Field>
);

export default function Settings() {
  const [me,      setMe]      = useState(null);
  const [form,    setForm]    = useState({ current: "", next: "", confirm: "" });
  const [show,    setShow]    = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");

  useEffect(() => {
    apiFetch("/account/me/")
      .then(res => res.json())
      .then(data => setMe(data))
      .catch(() => {});
  }, []);

  const strength = getStrength(form.next);
  const toggle   = (field) => setShow((s) => ({ ...s, [field]: !s[field] }));

  const handleReset = () => {
    setForm({ current: "", next: "", confirm: "" });
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    setError(""); setSuccess("");
    if (!form.current) return setError("Please enter your current password.");
    if (form.next.length < 8) return setError("New password must be at least 8 characters.");
    if (form.next !== form.confirm) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const res = await apiFetch("/account/reset-password/", {
        method: "POST",
        body: {
          old_password: form.current,
          new_password: form.next,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || "Failed to update password.");
        return;
      }

      setSuccess("Password updated successfully!");
      setForm({ current: "", next: "", confirm: "" });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", minWidth: 0, boxSizing: "border-box" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
          <h1 style={{
            fontSize: "32px",
            fontWeight: 700,
            color: "#701366",
            margin: 0,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}>
            Settings
          </h1>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
            <button
              onClick={handleReset}
              style={{ padding: "8px 20px", borderRadius: "8px", border: "1.5px solid #e2d0e2", background: "#fff", color: "#701366", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: "pointer" }}
              onMouseEnter={e => { e.target.style.borderColor = "#701366"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#e2d0e2"; }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{ padding: "8px 24px", borderRadius: "8px", border: "1.5px solid #701366", background: loading ? "#a855a0" : "#701366", color: "#fff", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: loading ? "not-allowed" : "pointer", fontWeight: "600" }}
              onMouseEnter={e => { if (!loading) e.target.style.background = "#5a0f52"; }}
              onMouseLeave={e => { if (!loading) e.target.style.background = "#701366"; }}
            >
              {loading ? "Saving..." : "Save Password"}
            </button>
          </div>
        </div>

        {/* Success banner */}
        {success && (
          <div style={{ background: "#f0fdf4", color: "#166534", padding: "14px 20px", borderRadius: "10px", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid #bbf7d0" }}>
            <span style={{ fontSize: "18px" }}>✓</span>
            {success}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div style={{ background: "#fef2f2", color: "#991b1b", padding: "12px 20px", borderRadius: "10px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start", minWidth: 0, marginTop: "8px" }}>

          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>

            <Card title="Account Information">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <ReadField label="Full Name" value={me?.full_name} />
                <ReadField label="Username"  value={me?.username}  />
                <ReadField label="Role" value={me?.role} />
              </div>
              <p style={{ fontSize: "11px", color: "#9ca3af", fontFamily: "Inter, sans-serif", marginTop: "16px" }}>
                * Account details can only be updated by the system administrator.
              </p>
            </Card>

            <Card title="Support">
              <a href={`https://mail.google.com/mail/?view=cm&to=${DIRECTOR_EMAIL}&subject=Support%20Request`} target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "block" }}>
                <div
                  style={{ background: "linear-gradient(135deg, #701366 0%, #9c1e8e 100%)", borderRadius: "14px", padding: "10px 20px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer", transition: "opacity 0.2s, transform 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1";   e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", fontFamily: "Inter, sans-serif", marginBottom: "3px" }}>Contact Director</p>
                    <p style={{ color: "white", fontSize: "12.5px", fontFamily: "Inter, sans-serif", fontWeight: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{DIRECTOR_EMAIL}</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </a>
              <p style={{ fontSize: "11px", color: "#9ca3af", fontFamily: "Inter, sans-serif", lineHeight: 1.6, marginTop: "14px" }}>
                Click above to open your email app and write to the director directly. We typically respond within one business day.
              </p>
            </Card>
          </div>

          {/* RIGHT — Change Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
            <Card title="Change Password">
              <p style={{ fontSize: "11px", color: "#c192c1", fontFamily: "Inter, sans-serif", marginBottom: "20px", lineHeight: 1.6 }}>
                Choose a strong password you haven't used before.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "18px" }}>
                <PwField label="Current Password" field="current" form={form} setForm={setForm} show={show} onToggle={toggle} />
                <PwField label="New Password"     field="next"    form={form} setForm={setForm} show={show} onToggle={toggle} />

                {form.next && strength && (
                  <div>
                    <div style={{ height: "4px", background: "#f0e6f0", borderRadius: "99px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: strength.width, background: strength.color, borderRadius: "99px", transition: "width 0.35s ease, background 0.35s ease" }} />
                    </div>
                    <p style={{ fontSize: "11px", fontFamily: "Inter, sans-serif", marginTop: "4px", color: strength.color }}>{strength.label}</p>
                  </div>
                )}

                <PwField label="Confirm New Password" field="confirm" form={form} setForm={setForm} show={show} onToggle={toggle} />

                <ul style={{ fontSize: "11px", color: "#9ca3af", fontFamily: "Inter, sans-serif", listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                  {[
                    ["At least 8 characters",  form.next.length >= 8],
                    ["One uppercase letter",    /[A-Z]/.test(form.next)],
                    ["One number",             /[0-9]/.test(form.next)],
                    ["One special character",  /[^A-Za-z0-9]/.test(form.next)],
                    ["Passwords match",        form.next && form.next === form.confirm],
                  ].map(([rule, ok]) => (
                    <li key={rule} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ color: ok ? "#22c55e" : "#d1b3d1", fontSize: "12px" }}>{ok ? "✓" : "○"}</span>
                      <span style={{ color: ok ? "#22c55e" : undefined }}>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}