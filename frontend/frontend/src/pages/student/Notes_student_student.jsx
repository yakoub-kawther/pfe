import { useNavigate, useLocation } from "react-router-dom";
import Student_layout from "../../layouts/Student_layout";

// All students' grades per class — in real app fetch only the logged-in student's row
const studentsData = {
  1: [
    { id: 1, name: "Amira Benali",  exam: 80,   oral: 75   },
    { id: 2, name: "Karim Meziane", exam: 60,   oral: 65   },
    { id: 3, name: "Lina Hadj",     exam: 10,   oral: 80   },
    { id: 4, name: "Youcef Brahim", exam: 50,   oral: 55   },
    { id: 5, name: "Sara Oukaci",   exam: 70,   oral: 70   },
    { id: 6, name: "Omar Ferhat",   exam: null, oral: null },
  ],
  2: [
    { id: 1, name: "Fatima Zouaoui", exam: 65,   oral: 60   },
    { id: 2, name: "Amine Chaoui",   exam: 85,   oral: 90   },
    { id: 3, name: "Nour Bekhti",    exam: null, oral: null },
    { id: 4, name: "Ryad Khelifi",   exam: 40,   oral: 45   },
  ],
  3: [
    { id: 1, name: "Asma Djaafri",    exam: 95,   oral: 85   },
    { id: 2, name: "Bilal Rahmouni",  exam: 55,   oral: 50   },
    { id: 3, name: "Cylia Moussaoui", exam: null, oral: null },
  ],
  4: [
    { id: 1, name: "Dalia Bensalem", exam: 75,  oral: 70  },
    { id: 2, name: "Elias Bouchama", exam: 100, oral: 100 },
  ],
};

// Simulate logged-in student name — in real app from auth context
const LOGGED_IN_STUDENT = "Amira Benali";

function getAverage(s) {
  const vals = [s.exam, s.oral].filter(v => v !== null && v !== undefined);
  if (!vals.length) return null;
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

function getStatus(avg) {
  if (avg === null) return { label: "Pending", bg: "#f3f4f6", color: "#6b7280" };
  return Number(avg) >= 50
    ? { label: "Pass", bg: "#dcfce7", color: "#15803d" }
    : { label: "Fail", bg: "#fee2e2", color: "#dc2626" };
}

// Score display helper
const ScoreCell = ({ val }) => (
  <td style={{ padding: "12px 16px", fontSize: "14px", color: val !== null && val !== undefined ? "#701366" : "#d1bbd0" }}>
    {val !== null && val !== undefined ? `${val}/100` : "—"}
  </td>
);

export default function Notes_students_student() {
  const navigate  = useNavigate();
  const { state } = useLocation();
  const cls       = state?.cls;

  if (!cls) {
    return (
      <Student_layout>
        <div style={{ padding: "60px", textAlign: "center", color: "#701366", fontFamily: "Inter, sans-serif" }}>
          No class selected.{" "}
          <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate("/Notes_student")}>
            Go back
          </span>
        </div>
      </Student_layout>
    );
  }

  const allStudents  = studentsData[cls.id] || [];

  // Only show the logged-in student's own row
  const myRow = allStudents.find(s => s.name === LOGGED_IN_STUDENT);
  const avg    = myRow ? getAverage(myRow) : null;
  const status = getStatus(avg);

  return (
    <Student_layout>
      <div style={{ maxWidth: "1100px", margin: "40px auto", padding: "0 24px", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Back + Header */}
        <div>
          <p
            onClick={() => navigate("/Notes_student")}
            style={{ fontSize: "14px", color: "#b48ab0", margin: "0 0 8px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
            onMouseEnter={e => e.currentTarget.style.color = "#701366"}
            onMouseLeave={e => e.currentTarget.style.color = "#b48ab0"}
          >
            ← Back
          </p>
          <h2 style={{ fontSize: "24px", color: "#701366", margin: 0 }}>{cls.name} — My Grades</h2>
          <p style={{ fontSize: "13px", color: "#b48ab0", margin: "4px 0 0" }}>
            {cls.language} · Level {cls.level} · {cls.schedule} · {cls.room}
          </p>
        </div>

        {/* Grade card */}
        {!myRow ? (
          <div style={{ background: "white", borderRadius: "18px", border: "1px solid #f5e0f3", padding: "40px", textAlign: "center", color: "#b48ab0", fontSize: "14px" }}>
            You are not enrolled in this class or no grades have been recorded yet.
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {[
                { label: "Exam",    value: myRow.exam !== null ? `${myRow.exam}/100` : "—" },
                { label: "Oral",    value: myRow.oral !== null ? `${myRow.oral}/100` : "—" },
                { label: "Average", value: avg !== null        ? `${avg}/100`        : "—" },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "white", border: "1px solid #f5e0f3", borderRadius: "14px", padding: "20px 28px", boxShadow: "0 1px 6px rgba(112,19,102,0.06)", minWidth: "140px" }}>
                  <div style={{ fontSize: "22px", fontWeight: 500, color: "#701366" }}>{value}</div>
                  <div style={{ fontSize: "12px", color: "#b48ab0", marginTop: "4px" }}>{label}</div>
                </div>
              ))}
              <div style={{ background: "white", border: "1px solid #f5e0f3", borderRadius: "14px", padding: "20px 28px", boxShadow: "0 1px 6px rgba(112,19,102,0.06)", minWidth: "140px" }}>
                <div>
                  <span style={{ background: status.bg, color: status.color, padding: "4px 14px", borderRadius: "9999px", fontSize: "13px", fontWeight: 600 }}>
                    {status.label}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#b48ab0", marginTop: "8px" }}>Result</div>
              </div>
            </div>

            {/* Table — only the student's own row */}
            <div style={{ background: "white", borderRadius: "18px", boxShadow: "0 2px 12px rgba(112,19,102,0.08)", overflow: "hidden", border: "1px solid #f5e0f3" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                <thead>
                  <tr style={{ background: "linear-gradient(90deg, #f8e0f8 0%, #fdf4fd 100%)", height: "52px" }}>
                    {[
                      { label: "Student", width: "32%", pl: "28px" },
                      { label: "Exam",    width: "16%" },
                      { label: "Oral",    width: "16%" },
                      { label: "Average", width: "16%" },
                      { label: "Status",  width: "20%" },
                    ].map(({ label, width, pl }) => (
                      <th key={label} style={{ width, paddingLeft: pl || "16px", paddingRight: "16px", fontSize: "12px", fontWeight: 500, textAlign: "left", color: "#701366", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ height: "60px", borderBottom: "1px solid #faeaf9" }}>
                    <td style={{ paddingLeft: "28px", paddingRight: "16px", fontSize: "14px", fontWeight: 500, color: "#701366" }}>
                      {myRow.name}
                    </td>
                    <ScoreCell val={myRow.exam} />
                    <ScoreCell val={myRow.oral} />
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: avg !== null ? "#701366" : "#d1bbd0" }}>
                      {avg !== null ? `${avg}/100` : "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: status.bg, color: status.color, padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>
    </Student_layout>
  );
}