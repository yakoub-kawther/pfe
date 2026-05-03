import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import Buttons from "../../components/Buttons";
import { apiFetch } from "../../services/api";

const inp = {
  width          : "100%",
  border         : "1px solid #e2d0e2",
  borderRadius   : "8px",
  padding        : "10px 14px",
  fontSize       : "14px",
  color          : "#701366",
  outline        : "none",
  boxSizing      : "border-box",
  fontFamily     : "Inter, sans-serif",
  backgroundColor: "#fff",
};

const Field = ({ label, children, full = false, error }) => (
  <div className="flex flex-col gap-1.5" style={full ? { gridColumn: "1 / -1" } : {}}>
    {label ? <label className="text-[13px] text-gray-500 font-Inter">{label}</label> : null}
    {children}
    {error && <span style={{ color: "#dc2626", fontSize: "12px", fontFamily: "Inter, sans-serif" }}>{error}</span>}
  </div>
);

const Card = ({ title, children }) => (
  <div
    className="bg-white rounded-2xl border border-gray-100"
    style={{ padding: "24px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
  >
    <h3 className="text-[#701366] font-Inter" style={{ fontSize: "16px", marginBottom: "20px" }}>
      {title}
    </h3>
    {children}
  </div>
);

const emptyForm = { language_name: "", shortcut: "" };

export default function Add_language() {
  const navigate = useNavigate();
  const [form, setForm]       = useState(emptyForm);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const handle = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleReset = () => { setForm(emptyForm); setErrors({}); };

  const handleSave = async () => {
    if (!form.language_name) { setErrors({ language_name: "Language name is required." }); return; }

    setLoading(true);
    try {
      const res = await apiFetch("/academic/languages/", {
        method: "POST",
        body  : {
          language_name: form.language_name,
          shortcut     : form.shortcut || null,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        if (typeof data === "object") {
          const mapped = {};
          for (const [key, val] of Object.entries(data)) {
            mapped[key] = Array.isArray(val) ? val[0] : val;
          }
          setErrors(mapped);
        } else {
          setErrors({ general: "Failed to save. Please try again." });
        }
        return;
      }

      navigate("/Languages");

    } catch {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full pb-10" style={{ padding: "30px clamp(12px, 2vw, 32px)" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <h1 className="text-2xl text-[#701366] font-Inter">Add New Language</h1>
          <Buttons
            cancelPath="/Languages"
            showReset={true}
            onReset={handleReset}
            onSave={handleSave}
            loading={loading}
          />
        </div>

        {errors.general && (
          <p style={{ color: "#dc2626", fontSize: "13px", fontFamily: "Inter, sans-serif" }}>
            {errors.general}
          </p>
        )}

        <div style={{ marginTop: "30px" }}>
          <Card title="Language Information">
            <div className="grid grid-cols-2" style={{ gap: "18px" }}>

              <Field label="Language" error={errors.language_name}>
                <input
                  style={{ ...inp, borderColor: errors.language_name ? "#dc2626" : "#e2d0e2" }}
                  value={form.language_name}
                  onChange={handle("language_name")}
                  placeholder="e.g. German"
                />
              </Field>

              <Field label="Shortcut" error={errors.shortcut}>
                <input
                  style={{ ...inp, borderColor: errors.shortcut ? "#dc2626" : "#e2d0e2" }}
                  value={form.shortcut}
                  onChange={handle("shortcut")}
                  placeholder="e.g. DE"
                  maxLength={5}
                />
              </Field>

            </div>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}