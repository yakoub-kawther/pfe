import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";

const Card = ({ title, icon, children }) => (
  <div
    className="bg-white rounded-2xl border border-gray-100"
    style={{ padding: "24px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
  >
    <div className="flex items-center gap-2 mb-6">
      {icon && <span className="text-[#701366] text-lg">{icon}</span>}
      <h3 className="text-[#701366] font-Inter" style={{ fontSize: "16px" }}>
        {title}
      </h3>
    </div>
    {children}
  </div>
);

const ReadField = ({ label, value }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-[13px] text-gray-500 font-Inter">{label}</label>}
    <div
      style={{
        width: "100%",
        border: "1px solid #e2d0e2",
        borderRadius: "8px",
        padding: "10px 14px",
        fontSize: "14px",
        color: "#701366",
        boxSizing: "border-box",
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#faf5fa",
        minHeight: "40px",
      }}
    >
      {value || <span style={{ color: "#c9a8c9" }}>—</span>}
    </div>
  </div>
);

const btnBase    = "inline-flex items-center justify-center px-5 py-1.5 text-sm rounded-lg border transition-colors font-Inter";
const btnOutline = `${btnBase} border-[#701366] text-[#701366] bg-white h-8 w-12  hover:bg-[#701366] hover:text-white`;
const btnFilled  = `${btnBase} border-[#701366] text-white bg-[#701366] hover:bg-white hover:text-[#701366]`;

function getStrength(pw) {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: "Weak",   color: "#ef4444", width: "25%" };
  if (score === 2) return { label: "Fair",   color: "#f97316", width: "50%" };
  if (score === 3) return { label: "Good",   color: "#eab308", width: "75%" };
  return              { label: "Strong", color: "#22c55e", width: "100%" };
}

const DIRECTOR_EMAIL = "yousraztn.contact@gmail.com";

// ── Eye icon  ───────────────────────
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

// ── Password field  ─────────────────
const PwField = ({ label, field, form, setForm, show, onToggle }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[13px] text-gray-500 font-Inter">{label}</label>
    <div style={{ position: "relative" }}>
      <input
        type={show[field] ? "text" : "password"}
        value={form[field]}
        onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
        placeholder="••••••••"
        style={{
          width: "100%",
          border: "1px solid #e2d0e2",
          borderRadius: "8px",
          padding: "10px 40px 10px 14px",
          fontSize: "14px",
          color: "#333",
          boxSizing: "border-box",
          fontFamily: "Inter, sans-serif",
          backgroundColor: "#fff",
          minHeight: "40px",
          outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#701366")}
        onBlur={(e)  => (e.target.style.borderColor = "#e2d0e2")}
      />
      <button
        type="button"
        onClick={() => onToggle(field)}
        style={{
          position: "absolute", right: "12px", top: "50%",
          transform: "translateY(-50%)", background: "none", border: "none",
          cursor: "pointer", color: "#a07aa0", padding: 0, display: "flex",
        }}
      >
        <Eye visible={show[field]} />
      </button>
    </div>
  </div>
);

export default function Settings() {
  const manager = {
    name:  "Amira Benali",
    email: "amira.benali@school.dz",
    role:  "Head Manager",
  };

  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");

  const strength = getStrength(form.next);
  const toggle = (field) => setShow((s) => ({ ...s, [field]: !s[field] }));

  const handleSave = () => {
    setError(""); setSuccess("");
    if (!form.current) return setError("Please enter your current password.");
    if (form.next.length < 8) return setError("New password must be at least 8 characters.");
    if (form.next !== form.confirm) return setError("Passwords do not match.");
    setSuccess("Password updated successfully!");
    setForm({ current: "", next: "", confirm: "" });
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-10" style={{ padding: "30px 16px" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl text-[#701366] font-Inter">Settings</h1>
        </div>

        <div className="grid grid-cols-2" style={{ gap: "24px", alignItems: "start" , marginTop: "30px"}}>

          {/* LEFT column */}
          <div className="flex flex-col" style={{ gap: "24px" }}>

            {/* Account Info*/}
            <Card title="Account Information">
              <div className="grid grid-cols-1" style={{ gap: "16px" , marginTop: "20px" }}>
                <ReadField label="Full Name" value={manager.name} />
                <ReadField label="Email"     value={manager.email} />
                <ReadField label="Role"      value={manager.role} />
              </div>
              <p className="text-[11px] text-gray-400 font-Inter mt-4">
                * Account details can only be updated by the system administrator.
              </p>
            </Card>

            {/* Support  */}
            <Card title="Support" >
              <a
                href={`https://mail.google.com/mail/?view=cm&to=${DIRECTOR_EMAIL}&subject=Support%20Request`} target="_blank" rel="noreferrer"
                style={{ textDecoration: "none", display: "block", marginBottom: "14px" , marginTop: "10px"}}
              >
                <div
                  style={{
                    background: "linear-gradient(135deg, #701366 0%, #9c1e8e 100%)",
                    borderRadius: "14px",
                    padding: "10px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    cursor: "pointer",
                    transition: "opacity 0.2s, transform 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.opacity = "0.9";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* icon bubble */}
                  <div style={{
                    width: "42px", height: "42px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.18)", 
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </div>

                  {/* label + email */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", fontFamily: "Inter, sans-serif", marginBottom: "3px" }}>
                      Contact Director
                    </p>
                    <p style={{
                      color: "white", fontSize: "12.5px", fontFamily: "Inter, sans-serif", fontWeight: 400,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {DIRECTOR_EMAIL}
                    </p>
                  </div>

                  {/* arrow */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </a>

              <p className="text-[11px] text-gray-400 font-Inter leading-relaxed">
                Click above to open your email app and write to the director directly. We typically respond within one business day.
              </p>
            </Card>
          </div>

          {/* RIGHT — Change Password */}
          <Card title="Change Password">
            <p className="text-[11px] text-[#c192c1] font-Inter mb-6 leading-relaxed">
              Choose a strong password you haven't used before.
            </p>

            <div className="grid grid-cols-1" style={{ gap: "18px", marginTop: "20px" }}>
              <PwField label="Current Password"     field="current" form={form} setForm={setForm} show={show} onToggle={toggle} />
              <PwField label="New Password"         field="next"    form={form} setForm={setForm} show={show} onToggle={toggle} />

              {form.next && strength && (
                <div>
                  <div style={{ height: "4px", background: "#f0e6f0", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: strength.width, background: strength.color,
                      borderRadius: "99px", transition: "width 0.35s ease, background 0.35s ease",
                    }} />
                  </div>
                  <p className="text-[11px] font-Inter mt-1" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                </div>
              )}

              <PwField label="Confirm New Password" field="confirm" form={form} setForm={setForm} show={show} onToggle={toggle} />

              <ul className="text-[11px] text-gray-400 font-Inter space-y-0.5 list-none" style={{ paddingLeft: "0", margin: "0" }}>
                {[
                  ["At least 8 characters",   form.next.length >= 8],
                  ["One uppercase letter",     /[A-Z]/.test(form.next)],
                  ["One number",               /[0-9]/.test(form.next)],
                  ["One special character",    /[^A-Za-z0-9]/.test(form.next)],
                  ["Passwords match",          form.next && form.next === form.confirm],
                ].map(([rule, ok]) => (
                  <li key={rule} className="flex items-center gap-1.5">
                    <span style={{ color: ok ? "#22c55e" : "#d1b3d1", fontSize: "12px" }}>
                      {ok ? "✓" : "○"}
                    </span>
                    <span style={{ color: ok ? "#22c55e" : undefined }}>{rule}</span>
                  </li>
                ))}
              </ul>

              {error   && <p className="text-[13px] font-Inter" style={{ color: "#ef4444" }}>⚠ {error}</p>}
              {success && <p className="text-[13px] font-Inter" style={{ color: "#22c55e" }}>✓ {success}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setForm({ current: "", next: "", confirm: "" }); setError(""); setSuccess(""); }}
                  className={btnOutline}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className={btnFilled}
                  style={{ flex: 1 }}
                >
                  Save Password
                </button>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}