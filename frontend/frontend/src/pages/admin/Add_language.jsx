import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";

const inp = {
  width: "100%",
  border: "1px solid #e2d0e2",
  borderRadius: "8px",
  padding: "10px 14px",
  fontSize: "14px",
  color: "#701366",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "Inter, sans-serif",
  backgroundColor: "#fff",
};

const Field = ({ label, children, full = false }) => (
  <div className="flex flex-col gap-1.5" style={full ? { gridColumn: "1 / -1" } : {}}>
    {label ? <label className="text-[13px] text-gray-500 font-Inter">{label}</label> : null}
    {children}
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

const btnBase    = "inline-flex items-center justify-center px-5 py-1.5 h-7 w-12 text-sm rounded-lg border transition-colors font-Inter";
const btnOutline = `${btnBase} border-[#701366] text-[#701366] bg-white hover:bg-[#701366] hover:text-white`;
const btnGhost   = `${btnBase} border-[#701366] text-[#701366] bg-white hover:bg-[#701366] hover:text-white`;
const btnFilled  = `${btnBase} border-[#701366] text-white bg-[#701366] hover:bg-white hover:text-[#701366]`;

const emptyForm = { id: "", language: "", shortcut: "" };

export default function Add_language() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);

  const handle = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleReset = () => setForm(emptyForm);

  const handleSave = () => {
    if (!form.language) { alert("Please enter a language name."); return; }
    console.log("New language:", form);
    navigate("/Languages");
  };

  return (
    <DashboardLayout>
      <div className="w-full pb-10" style={{ padding: "30px clamp(12px, 2vw, 32px)" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <h1 className="text-2xl text-[#701366] font-Inter">Add New Language</h1>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => navigate("/Languages")} className={btnOutline}>cancel</button>
            <button onClick={handleReset}                  className={btnGhost}>reset</button>
            <button onClick={handleSave}                   className={btnFilled}>save</button>
          </div>
        </div>

        <div style={{ marginTop: "30px" }}>
          <Card title="Language Information">
            <div className="grid grid-cols-2" style={{ gap: "18px" }}>

              <Field label="ID" full>
                <input
                  style={inp}
                  value={form.id}
                  onChange={handle("id")}
                  placeholder="e.g. LNG-006"
                />
              </Field>

              <Field label="Language">
                <input
                  style={inp}
                  value={form.language}
                  onChange={handle("language")}
                  placeholder="e.g. German"
                />
              </Field>

              <Field label="Shortcut">
                <input
                  style={inp}
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