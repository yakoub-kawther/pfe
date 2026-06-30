import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Teacher_layout from "../../layouts/Teacher_layout";
import Buttons from "../../components/Buttons";
import { apiFetch } from "../../services/api";

const inputStyle = (focused) => ({
  width: "100%", padding: "10px 14px",
  border: `1.5px solid ${focused ? "#701366" : "#f0d8ee"}`,
  borderRadius: "10px", fontSize: "15px", fontWeight: 400,
  color: "#701366", outline: "none",
  background: focused ? "#fdf4fd" : "white",
  transition: "border 0.2s, background 0.2s", boxSizing: "border-box",
});

const scoreColor = (val) => {
  if (val === "" || val === null || isNaN(val)) return "#b48ab0";
  return Number(val) >= 50 ? "#15803d" : "#dc2626";
};

export default function Notes_add_teacher() {
  const navigate  = useNavigate();
  const { state } = useLocation();
  const cls     = state?.cls;
  const student = state?.student; // { inscriptionId, studentName, oral, written, oralNoteId, writtenNoteId }

  const [grades,  setGrades]  = useState({
    oral   : student?.oral    ?? "",
    written: student?.written ?? "",
  });
  const [focused, setFocused] = useState({});
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [errors,  setErrors]  = useState({});

  if (!cls || !student) {
    return (
      <Teacher_layout>
        <div style={{ padding: "60px", textAlign: "center", color: "#701366" }}>
          Missing data. <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate("/Notes_teacher")}>Go back</span>
        </div>
      </Teacher_layout>
    );
  }

  const fields = [
    { key: "oral",    label: "Oral",    description: "Oral evaluation",  noteId: student.oralNoteId    },
    { key: "written", label: "Written", description: "Written exam",     noteId: student.writtenNoteId },
  ];

  const getAverage = () => {
    const vals = Object.values(grades).filter(v => v !== "" && !isNaN(Number(v)));
    if (!vals.length) return null;
    return (vals.reduce((a, b) => a + Number(b), 0) / vals.length).toFixed(1);
  };

  const validate = () => {
    const errs = {};
    Object.entries(grades).forEach(([key, val]) => {
      if (val === "") return;
      const n = Number(val);
      if (isNaN(n) || n < 0 || n > 100) errs[key] = "Must be 0 – 100";
    });
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    setErrors({});
    try {
      for (const field of fields) {
        const val = grades[field.key];
        if (val === "" || val === null) continue;

        if (field.noteId) {
          // Update existing note
          await apiFetch(`/notes/${field.noteId}/`, {
            method: "PUT",
            body: { mark: Number(val) },
          });
        } else {
          // Create new note
          await apiFetch("/notes/", {
            method: "POST",
            body: {
              inscription_id: student.inscriptionId,
              component     : field.key,
              mark          : Number(val),
            },
          });
        }
      }
      setSaved(true);
      setTimeout(() => navigate("/Notes_students_teacher", { state: { cls } }), 1400);
    } catch {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const avg    = getAverage();
  const status = avg === null
    ? { label: "No grades yet", bg: "#f3f4f6", color: "#6b7280" }
    : Number(avg) >= 50
      ? { label: "Pass", bg: "#dcfce7", color: "#15803d" }
      : { label: "Fail", bg: "#fee2e2", color: "#dc2626" };

  return (
    <Teacher_layout>
      <div style={{ maxWidth: "700px", margin: "40px auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>

        <div>
          <h2 style={{ fontSize: "24px", color: "#701366", fontFamily: "Inter, sans-serif", margin: 0 }}>Add / Edit Results</h2>
          <p style={{ fontSize: "13px", color: "#b48ab0", margin: "4px 0 0" }}>
            {cls.name} · {cls.language?.language_name ?? cls.language} · Level {cls.level?.level_name ?? cls.level}
          </p>
        </div>

        {/* Student card */}
        <div style={{ background: "linear-gradient(135deg,#fdf0fd,#fff5fe)", border: "1px solid #f0d8ee", borderRadius: "18px", padding: "24px", display: "flex", alignItems: "center", gap: "18px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg,#f3c6f1,#e88fe4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", fontWeight: 400, color: "#701366", flexShrink: 0 }}>
            {student.studentName?.charAt(0) ?? "S"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "18px", fontWeight: 400, color: "#701366" }}>{student.studentName}</div>
            <div style={{ fontSize: "13px", color: "#b48ab0", marginTop: "2px" }}>Student · {cls.name}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: 400, color: scoreColor(avg), lineHeight: 1 }}>
              {avg !== null ? avg : "—"}
            </div>
            <div style={{ fontSize: "11px", color: "#b48ab0", marginTop: "2px" }}>Average /100</div>
            <span style={{ display: "inline-block", marginTop: "6px", background: status.bg, color: status.color, padding: "3px 10px", borderRadius: "9999px", fontSize: "12px", fontWeight: 500 }}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Inputs */}
        <div style={{ background: "white", border: "1px solid #f5e0f3", borderRadius: "18px", padding: "28px", boxShadow: "0 2px 12px rgba(112,19,102,0.07)", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ fontSize: "15px", fontWeight: 500, color: "#701366", marginBottom: "4px" }}>Grades (out of 100)</div>

          {fields.map(({ key, label, description }) => (
            <div key={key}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 500, color: "#701366", marginBottom: "8px" }}>
                {label}
                <span style={{ fontSize: "12px", color: "#b48ab0", fontWeight: 400 }}>— {description}</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="number" min="0" max="100" step="1"
                  placeholder="Enter grade (0 – 100)"
                  value={grades[key]}
                  onChange={e => { setGrades(p => ({ ...p, [key]: e.target.value })); setSaved(false); setErrors(p => ({ ...p, [key]: null })); }}
                  onFocus={() => setFocused(p => ({ ...p, [key]: true }))}
                  onBlur={()  => setFocused(p => ({ ...p, [key]: false }))}
                  style={inputStyle(focused[key])}
                />
                {grades[key] !== "" && !isNaN(Number(grades[key])) && (
                  <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", fontWeight: 700, color: scoreColor(grades[key]) }}>
                    {Number(grades[key]) >= 50 ? "✓" : "✕"}
                  </span>
                )}
              </div>
              {errors[key] && <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#dc2626" }}>{errors[key]}</p>}
            </div>
          ))}

          <div style={{ background: "#fdf4fd", border: "1px solid #f0d8ee", borderRadius: "12px", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", color: "#701366", fontWeight: 500 }}>Calculated Average</span>
            <span style={{ fontSize: "18px", fontWeight: 400, color: scoreColor(avg) }}>
              {avg !== null ? `${avg} / 100` : "—"}
            </span>
          </div>
        </div>

        {errors.general && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "12px 16px", borderRadius: "10px", fontSize: "13px" }}>⚠ {errors.general}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Buttons
            onCancel={() => navigate("/Notes_students_teacher", { state: { cls } })}
            onSave={handleSave}
            saveLabel={saving ? "Saving..." : "Save Grades"}
          />
        </div>

        {saved && (
          <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "14px 20px", color: "#15803d", fontSize: "14px", fontWeight: 500 }}>
            ✓ Grades saved for <strong>{student.studentName}</strong>
          </div>
        )}

      </div>
    </Teacher_layout>
  );
}