import { useNavigate, useLocation } from "react-router-dom";
import Teacher_layout from "../../layouts/Teacher_layout";
import { useState, useEffect } from "react";
import { apiFetch } from "../../services/api";

function getAverage(oral, written) {
  const vals = [oral, written].filter(v => v !== null && v !== undefined);
  if (!vals.length) return null;
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

function getStatus(avg) {
  if (avg === null) return { label: "No grades", bg: "#f3f4f6", color: "#6b7280" };
  return Number(avg) >= 50
    ? { label: "Pass", bg: "#dcfce7", color: "#15803d" }
    : { label: "Fail", bg: "#fee2e2", color: "#dc2626" };
}

export default function Notes_students_teacher() {
  const navigate  = useNavigate();
  const { state } = useLocation();
  const cls       = state?.cls;

  const [students, setStudents] = useState([]); // inscriptions with notes
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!cls?.id) return;

    // Fetch inscriptions + notes in parallel
    Promise.all([
      apiFetch(`/inscriptions/?class_id=${cls.id}&status=confirmed`).then(r => r.json()),
      apiFetch(`/notes/class/?class_id=${cls.id}`).then(r => r.json()),
    ])
      .then(([inscriptions, notes]) => {
        const insList  = Array.isArray(inscriptions) ? inscriptions : (inscriptions.results ?? []);
        const noteList = Array.isArray(notes)        ? notes        : (notes.results ?? []);

        // Map notes by inscription id
        const notesByInscription = {};
        noteList.forEach(n => {
          if (!notesByInscription[n.inscription]) notesByInscription[n.inscription] = {};
          notesByInscription[n.inscription][n.component] = n;
        });

        const mapped = insList.map(ins => ({
          inscriptionId: ins.id,
          studentId    : ins.student,
          studentName  : ins.student_name,
          oral         : notesByInscription[ins.id]?.oral?.mark    ?? null,
          written      : notesByInscription[ins.id]?.written?.mark ?? null,
          oralNoteId   : notesByInscription[ins.id]?.oral?.id      ?? null,
          writtenNoteId: notesByInscription[ins.id]?.written?.id   ?? null,
        }));

        setStudents(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cls?.id]);

  if (!cls) {
    return (
      <Teacher_layout>
        <div style={{ padding: "60px", textAlign: "center", color: "#701366" }}>
          No class selected. <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate("/Notes_teacher")}>Go back</span>
        </div>
      </Teacher_layout>
    );
  }

  const graded = students.filter(s => s.oral !== null || s.written !== null).length;

  return (
    <Teacher_layout>
      <div style={{ maxWidth: "1100px", margin: "40px auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>

        <div>
          <p onClick={() => navigate("/Notes_teacher")}
            style={{ fontSize: "14px", color: "#b48ab0", margin: "0 0 4px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
            onMouseEnter={e => e.currentTarget.style.color = "#701366"}
            onMouseLeave={e => e.currentTarget.style.color = "#b48ab0"}
          >← Back</p>
          <h2 style={{ fontSize: "24px", color: "#701366", fontFamily: "Inter, sans-serif", margin: 0 }}>
            {cls.name} — Student Results
          </h2>
          <p style={{ fontSize: "13px", color: "#b48ab0", margin: "4px 0 0" }}>
            {cls.language?.language_name ?? cls.language} · Level {cls.level?.level_name ?? cls.level}
          </p>
        </div>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {[
            { label: "Total Students", value: students.length },
            { label: "Graded",         value: graded },
            { label: "Pending",        value: students.length - graded },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "white", border: "1px solid #f5e0f3", borderRadius: "14px", padding: "16px 24px", boxShadow: "0 1px 6px rgba(112,19,102,0.06)" }}>
              <div style={{ fontSize: "20px", fontWeight: 500, color: "#701366" }}>{value}</div>
              <div style={{ fontSize: "12px", color: "#b48ab0" }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "white", borderRadius: "18px", boxShadow: "0 2px 12px rgba(112,19,102,0.08)", overflow: "hidden", border: "1px solid #f5e0f3" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "linear-gradient(90deg, #f8e0f8 0%, #fdf4fd 100%)", height: "52px" }}>
                {[
                  { label: "Student", width: "30%", pl: "28px" },
                  { label: "Oral",    width: "16%" },
                  { label: "Written", width: "16%" },
                  { label: "Average", width: "16%" },
                  { label: "Status",  width: "22%" },
                ].map(({ label, width, pl }) => (
                  <th key={label} style={{ width, paddingLeft: pl || "16px", paddingRight: "16px", fontSize: "13px", fontWeight: 500, textAlign: "left", color: "#701366", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#b48ab0", fontSize: "14px" }}>Loading...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#b48ab0", fontSize: "14px" }}>No students found.</td></tr>
              ) : students.map(student => {
                const avg    = getAverage(student.oral, student.written);
                const status = getStatus(avg);
                return (
                  <tr key={student.inscriptionId}
                    onClick={() => navigate("/Notes_add_teacher", { state: { cls, student } })}
                    style={{ height: "60px", borderBottom: "1px solid #faeaf9", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fdf6fd"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ paddingLeft: "28px", paddingRight: "16px", fontSize: "14px", fontWeight: 400, color: "#701366" }}>{student.studentName}</td>
                    <td style={{ padding: "0 16px", fontSize: "14px", color: student.oral !== null ? "#701366" : "#d1bbd0" }}>
                      {student.oral !== null ? `${student.oral}/100` : "—"}
                    </td>
                    <td style={{ padding: "0 16px", fontSize: "14px", color: student.written !== null ? "#701366" : "#d1bbd0" }}>
                      {student.written !== null ? `${student.written}/100` : "—"}
                    </td>
                    <td style={{ padding: "0 16px", fontSize: "14px", color: avg !== null ? "#701366" : "#d1bbd0" }}>
                      {avg !== null ? `${avg}/100` : "—"}
                    </td>
                    <td style={{ padding: "0 16px" }}>
                      <span style={{ background: status.bg, color: status.color, padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 400 }}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </Teacher_layout>
  );
}