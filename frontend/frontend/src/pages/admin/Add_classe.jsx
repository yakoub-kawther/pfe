import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import Buttons from "../../components/Buttons";
import { apiFetch } from "../../services/api";

/* ── Shared input styles ── */
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
const sel = { ...inp, cursor: "pointer" };

/* ── Reusable atoms ── */
const Field = ({ label, children, full = false }) => (
  <div className="flex flex-col gap-1.5" style={full ? { gridColumn: "1 / -1" } : {}}>
    {label && <label className="text-[13px] text-gray-500 font-medium">{label}</label>}
    {children}
  </div>
);

const Card = ({ title, children }) => (
  <div
    className="bg-white rounded-2xl border border-gray-100"
    style={{ padding: "24px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
  >
    <h3 className="text-[#701366] font-semibold" style={{ fontSize: "16px", marginBottom: "20px" }}>
      {title}
    </h3>
    {children}
  </div>
);

/* ── Empty form shape ── */
const emptyForm = {
  name: "", language: "", level: "", teacher: "",
  year: "", start_date: "", status: "active",
};

/* ════════════════════════════════════════ */
export default function Add_classe() {
  const navigate = useNavigate();

  const [form, setForm]           = useState(emptyForm);
  const [teachers, setTeachers]   = useState([]);
  const [languages, setLanguages] = useState([]);
  const [levels, setLevels]       = useState([]);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);

  /* ── Fetch dropdown data ── */
  useEffect(() => {
    apiFetch("/persons/teachers/")
      .then((res) => res.json())
      .then((data) => setTeachers(Array.isArray(data) ? data : (data.results ?? [])))
      .catch((err) => console.error("Failed to fetch teachers:", err));

    apiFetch("/academic/languages/")
      .then((res) => res.json())
      .then((data) => setLanguages(Array.isArray(data) ? data : (data.results ?? [])))
      .catch((err) => console.error("Failed to fetch languages:", err));

    apiFetch("/academic/levels/")
      .then((res) => res.json())
      .then((data) => setLevels(Array.isArray(data) ? data : (data.results ?? [])))
      .catch((err) => console.error("Failed to fetch levels:", err));
  }, []);

  /* ── Derived: teachers filtered by selected language ── */
  const filteredTeachers = form.language
    ? teachers.filter((t) => String(t.language?.id) === String(form.language))
    : teachers;

  /* ── Handlers ── */
  const handle = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Reset teacher whenever language changes
  const handleLanguageChange = (e) => {
    setForm((prev) => ({ ...prev, language: e.target.value, teacher: "" }));
  };

  const handleReset = () => {
    setForm(emptyForm);
    setError(null);
  };

  const handleSave = async () => {
  if (!form.name)     { setError("Please enter a class name."); return; }
  if (!form.language) { setError("Please select a language."); return; }
  if (!form.level)    { setError("Please select a level."); return; }
  if (!form.teacher)  { setError("Please select a teacher."); return; }

  setError(null);
  setSaving(true);

  try {
    const res = await apiFetch("/academic/classes/", {
      method: "POST",
      body: {
        name:     form.name,
        language: Number(form.language),
        level:    Number(form.level),
        teacher:  Number(form.teacher),
        year:     form.year,
        status:   form.status,
        start_date: form.start_date,
      },
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(JSON.stringify(data));
    }

    navigate("/Classes");
  } catch (err) {
    setError(err.message || "Failed to save class.");
  } finally {
    setSaving(false);
  }
};
  /* ── Render ── */
  return (
    <DashboardLayout>
      <div style={{
        width: "70%", margin: "0 auto", display: "flex",
        flexDirection: "column", gap: "24px", paddingTop: "24px",
        paddingBottom: "40px", boxSizing: "border-box",
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <h1 style={{ fontSize: "24px", color: "#701366", fontFamily: "Inter, sans-serif", margin: 0 }}>
            Add New Class
          </h1>
          <Buttons
            cancelPath="/Classes"
            showReset={true}
            onReset={handleReset}
            onSave={handleSave}
            disabled={saving}
          />
        </div>

        {/* Global error */}
        {error && (
          <div style={{
            padding: "12px 16px", borderRadius: "8px",
            background: "#fee2e2", color: "#b91c1c",
            fontSize: "14px", fontFamily: "Inter, sans-serif",
            border: "1px solid #fecaca",
          }}>
            {error}
          </div>
        )}

        {/* Class Information */}
        <Card title="Class Information">
          <div className="grid grid-cols-2" style={{ gap: "18px" }}>

            <Field label="Class Name" full>
              <input
                style={inp}
                value={form.name}
                onChange={handle("name")}
                placeholder="e.g. Class A"
              />
            </Field>

            {/* Language — controls teacher dropdown */}
            <Field label="Language">
              <select style={sel} value={form.language} onChange={handleLanguageChange}>
                <option value="">Select language</option>
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.language_name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Level">
              <select style={sel} value={form.level} onChange={handle("level")}>
                <option value="">Select level</option>
                {levels.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.level_name}
                  </option>
                ))}
              </select>
            </Field>

            {/* Teacher — disabled until a language is chosen */}
            <Field label="Teacher">
              <select
                style={{
                  ...sel,
                  opacity: !form.language ? 0.5 : 1,
                  cursor:  !form.language ? "not-allowed" : "pointer",
                }}
                value={form.teacher}
                onChange={handle("teacher")}
                disabled={!form.language}
              >
                <option value="">
                  {!form.language
                    ? "Select a language first"
                    : filteredTeachers.length === 0
                      ? "No teachers for this language"
                      : "Select a teacher"}
                </option>
                {filteredTeachers.map((t) => {
                  const p = t.employee?.person ?? {};
                  return (
                    <option key={t.employee?.person_id} value={t.employee?.person_id}>
                      {p.first_name} {p.last_name}
                    </option>
                  );
                })}
              </select>
            </Field>

            <Field label="Academic Year">
              <input
                style={inp}
                value={form.year}
                onChange={handle("year")}
                placeholder="e.g. 2025-2026"
              />
            </Field>

            <Field label="Status">
               <select style={sel} value={form.status} onChange={handle("status")}>
               <option value="active">Active</option>
               <option value="inactive">Inactive</option>
                </select>
                </Field>

              <Field label="Start Date">
              <input
                type="date"
                style={inp}
                value={form.start_date}
                onChange={handle("start_date")}
              />
            </Field>

          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
}