import { useNavigate, useLocation } from "react-router-dom";
import Teacher_layout from "../../layouts/Teacher_layout";

const studentsData = {
  1: [
    { id: 1, name: "Amira Benali",    avatar: "AB", exam: 80,  oral: 75 },
    { id: 2, name: "Karim Meziane",   avatar: "KM", exam: 60,  oral: 65 },
    { id: 3, name: "Lina Hadj",       avatar: "LH", exam: 10,  oral: 80 },
    { id: 4, name: "Youcef Brahim",   avatar: "YB", exam: 50,  oral: 55 },
    { id: 5, name: "Sara Oukaci",     avatar: "SO", exam: 70,  oral: 70 },
    { id: 6, name: "Omar Ferhat",     avatar: "OF", exam: null,  oral: null },
  ],
  2: [
    { id: 1, name: "Fatima Zouaoui",  avatar: "FZ", exam: 65, oral: 60 },
    { id: 2, name: "Amine Chaoui",    avatar: "AC", exam: 85, oral: 90 },
    { id: 3, name: "Nour Bekhti",     avatar: "NB", exam: null, oral: null },
    { id: 4, name: "Ryad Khelifi",    avatar: "RK", exam: 40, oral: 45 },
  ],
  3: [
    { id: 1, name: "Asma Djaafri",    avatar: "AD", exam: 95,  oral: 85 },
    { id: 2, name: "Bilal Rahmouni",  avatar: "BR", exam: 55,  oral: 50 },
    { id: 3, name: "Cylia Moussaoui", avatar: "CM", exam: null, oral: null },
  ],
  4: [
    { id: 1, name: "Dalia Bensalem",  avatar: "DB", exam: 75, oral: 70 },
    { id: 2, name: "Elias Bouchama",  avatar: "EB", exam: 100, oral: 100 },
  ],
};

function getAverage(s) {
  const vals = [s.exam, s.oral].filter(v => v !== null && v !== undefined);
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
  const navigate = useNavigate();
  const { state } = useLocation();
  const cls = state?.cls;

  if (!cls) {
    return (
      <Teacher_layout>
        <div style={{ padding: "60px", textAlign: "center", color: "#701366" }}>
          No class selected. <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate("/Notes_teacher")}>Go back</span>
        </div>
      </Teacher_layout>
    );
  }

  const students = studentsData[cls.id] || [];
  const graded   = students.filter(s => s.exam !== null).length;

  return (
    <Teacher_layout>
      <div style={{ maxWidth: "1100px", margin: "40px auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Back + Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
          <div style={{ minWidth: "180px" }}>
            <p
              onClick={() => navigate("/Notes_teacher")}
              style={{ fontSize: "14px", color: "#b48ab0", margin: "0 0 4px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
              onMouseEnter={e => e.currentTarget.style.color = "#701366"}
              onMouseLeave={e => e.currentTarget.style.color = "#b48ab0"}
            >
              ← Back
            </p>
            <div>
              <h2 style={{ fontSize: "24px", color: "#701366", fontFamily: "Inter, sans-serif", margin: 0 }}>
                {cls.name} — Student Results
              </h2>
              <p style={{ fontSize: "13px", color: "#b48ab0", margin: "4px 0 0" }}>
                {cls.language} · Level {cls.level} · {cls.schedule} · {cls.room}
              </p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {[
            { label: "Total Students", value: students.length },
            { label: "Graded",         value: graded },
            { label: "Pending",        value: students.length - graded },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "white", border: "1px solid #f5e0f3", borderRadius: "14px", padding: "16px 24px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 1px 6px rgba(112,19,102,0.06)" }}>
              <div>
                <div style={{ fontSize: "20px", fontWeight: 500, color: "#701366" }}>{value}</div>
                <div style={{ fontSize: "12px", color: "#b48ab0" }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "white", borderRadius: "18px", boxShadow: "0 2px 12px rgba(112,19,102,0.08)", overflow: "hidden", border: "1px solid #f5e0f3" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "linear-gradient(90deg, #f8e0f8 0%, #fdf4fd 100%)", height: "52px" }}>
                {[
                  { label: "Student", width: "28%", pl: "28px" },
                  { label: "Exam ",  width: "14%" },
                  { label: "Oral",    width: "14%" },
                  { label: "Average", width: "14%" },
                  { label: "Status",  width: "16%" },
                ].map(({ label, width, pl }) => (
                  <th key={label} style={{ width, paddingLeft: pl || "16px", paddingRight: "16px", fontSize: "13px", fontWeight: 500, textAlign: "left", color: "#701366", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const avg    = getAverage(student);
                const status = getStatus(avg);
                return (
                  <tr
                    key={student.id}
                    onClick={() => navigate("/Notes_add_teacher", { state: { cls, student } })}
                    style={{ height: "60px", borderBottom: "1px solid #faeaf9", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fdf6fd"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ paddingLeft: "28px", paddingRight: "16px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 400, color: "#701366" }}>{student.name}</span>
                    </td>
                    {[student.exam, student.oral].map((val, i) => (
                      <td key={i} style={{ paddingLeft: "16px", paddingRight: "16px", fontSize: "14px", color: val !== null ? "#701366" : "#d1bbd0" }}>
                        {val !== null && val !== undefined ? `${val}/100` : "—"}
                      </td>
                    ))}
                    <td style={{ paddingLeft: "16px", paddingRight: "16px", fontSize: "14px", fontWeight: 400, color: avg !== null ? "#701366" : "#d1bbd0" }}>
                      {avg !== null ? `${avg}/100` : "—"}
                    </td>
                    <td style={{ paddingLeft: "16px", paddingRight: "16px" }}>
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