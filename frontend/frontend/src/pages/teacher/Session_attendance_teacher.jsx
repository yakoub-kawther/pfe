import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Teacher_layout from "../../layouts/Teacher_layout";
import Buttons from "../../components/Buttons";
import Searchbar from "../../components/Searchbar";

const studentsData = [
  { id: 1, name: "Amira Benali",     contact: "0550 123 456" },
  { id: 2, name: "Yacine Moussaoui", contact: "0660 789 012" },
  { id: 3, name: "Sarah Khelifi",    contact: "0770 345 678" },
  { id: 4, name: "Omar Boudriga",    contact: "0550 901 234" },
  { id: 5, name: "Nadia Hammoudi",   contact: "0660 567 890" },
  { id: 6, name: "Karim Zerrouki",   contact: "0770 123 789" },
];

export default function Session_attendance_teacher() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const session    = state?.session;
  const cls        = state?.cls;

  const [search, setSearch] = useState("");
  const [attendance, setAttendance] = useState(
    Object.fromEntries(studentsData.map((s) => [s.id, null]))
  );
  const [saved, setSaved] = useState(false);

  const mark = (id, status) =>
    setAttendance((prev) => ({ ...prev, [id]: prev[id] === status ? null : status }));

  const markAll = (status) =>
    setAttendance(Object.fromEntries(studentsData.map((s) => [s.id, status])));

  const handleSave = () => {
    console.log("Attendance saved:", attendance);
    setSaved(true);
    setTimeout(() => navigate("/Class_sessions_teacher", { state: { cls } }), 1400);
  };

  const filtered      = studentsData.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  const presentCount  = Object.values(attendance).filter((v) => v === "present").length;
  const absentCount   = Object.values(attendance).filter((v) => v === "absent").length;
  const unmarkedCount = studentsData.length - presentCount - absentCount;

  return (
    <Teacher_layout>
      <div style={{ maxWidth: "1100px", margin: "40px auto", fontFamily: "Inter, sans-serif", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Row 1: Title + Searchbar + Save/Cancel */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ minWidth: "220px" }}>
            <h2 style={{ fontSize: "24px", color: "#701366", fontFamily: "Inter, sans-serif", margin: 0 }}>
              Attendance — {cls?.name}
            </h2>
            <p style={{ fontSize: "12px", color: "#b48ab0", margin: "4px 0 0" }}>
              {session?.topic} · {new Date(session?.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · {session?.time}
            </p>
          </div>

          <div style={{ flex: 1 }} />

          {/* Searchbar right before Save/Cancel */}
        
          <Buttons
            cancelPath="/Class_sessions_teacher"
            onSave={handleSave}
          />
        </div>

        {/* Success Banner */}
        {saved && (
          <div style={{ background: "#dcfce7", color: "#16a34a", padding: "12px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: 400, display: "flex", alignItems: "center", gap: "8px" }}>
            Attendance saved successfully! Redirecting…
          </div>
        )}

        {/* Stats Row */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {[
            { label: "Total",    value: studentsData.length, color: "#701366", bg: "white" },
            { label: "Present",  value: presentCount,        color: "#16a34a", bg: "#f0fdf4" },
            { label: "Absent",   value: absentCount,         color: "#dc2626", bg: "#fff5f5" },
            { label: "Unmarked", value: unmarkedCount,       color: "#6b7280", bg: "white" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{
              background: bg, border: "1px solid #f0d8ee", borderRadius: "14px",
              padding: "14px 22px", boxShadow: "0 1px 4px rgba(112,19,102,0.06)",
              flex: "1 1 auto", minWidth: "100px", textAlign: "center",
            }}>
              <p style={{ fontSize: "26px", fontWeight: 400, color, margin: 0 }}>{value}</p>
              <p style={{ fontSize: "12px", color: "#b48ab0", margin: "2px 0 0" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Row 2: All Present / All Absent — in place of the searchbar */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        
        <button
            onClick={() => markAll("present")}
            style={{ padding: "8px 16px", borderRadius: "9px", fontSize: "13px", fontWeight: 400, border: "1.5px solid #16a34a", background: "#dcfce7", color: "#16a34a", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            All Present
          </button>
          <button
            onClick={() => markAll("absent")}
            style={{ padding: "8px 16px", borderRadius: "9px", fontSize: "13px", fontWeight: 400, border: "1.5px solid #dc2626", background: "#fee2e2", color: "#dc2626", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            All Absent
          </button>    
           <div style={{ minWidth: "220px", maxWidth: "280px", marginLeft: "auto" }}>
            <Searchbar
              placeholder="Search student..."
              showAdd={false}
              onSearchChange={(val) => setSearch(val)}
            />
          </div>
        </div>

        {/* Table Card */}
        <div style={{ background: "white", borderRadius: "18px", boxShadow: "0 2px 12px rgba(112,19,102,0.08)", overflow: "hidden", border: "1px solid #f5e0f3" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "linear-gradient(90deg, #f8e0f8 0%, #fdf4fd 100%)", height: "52px" }}>
                {[
                  { label: "Id",           width: "6%",  pl: "28px" },
                  { label: "Student Name", width: "34%" },
                  { label: "Contact",      width: "24%" },
                  { label: "Present",      width: "18%" },
                  { label: "Absent",       width: "18%" },
                ].map(({ label, width, pl }) => (
                  <th key={label} style={{
                    width, paddingLeft: pl || "16px", paddingRight: "16px",
                    fontSize: "13px", fontWeight: 500, fontFamily: "Inter, sans-serif", textAlign: "left",
                    color: "#701366", letterSpacing: "0.04em", textTransform: "uppercase",
                  }}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((student, idx) => {
                const status = attendance[student.id];
                const rowBg  = status === "present" ? "#f0fdf4" : status === "absent" ? "#fff5f5" : "white";
                return (
                  <tr
                    key={student.id}
                    style={{ height: "58px", borderBottom: "1px solid #faeaf9", background: rowBg, transition: "background 0.15s" }}
                  >
                    <td style={{ paddingLeft: "28px", paddingRight: "16px", fontSize: "13px", color: "#c4a3c0", fontWeight: 400 }}>{idx + 1}</td>
                    <td style={{ padding: "0 16px", fontSize: "14px", fontWeight: 400, color: "#701366" }}>
                      {student.name}
                    </td>
                    <td style={{ padding: "0 16px", fontSize: "13px", color: "#6b2163" }}>{student.contact}</td>

                    {/* Present */}
                    <td style={{ padding: "0 16px" }}>
                      <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", userSelect: "none" }}>
                        <div
                          onClick={() => mark(student.id, "present")}
                          style={{
                            width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0,
                            border: `2px solid ${status === "present" ? "#16a34a" : "#d1d5db"}`,
                            background: status === "present" ? "#16a34a" : "white",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", transition: "all 0.15s",
                          }}
                        >
                          {status === "present" && <span style={{ color: "white", fontSize: "13px", fontWeight: 400 }}>✓</span>}
                        </div>
                        {status === "present" && (
                          <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 400 }}>Present</span>
                        )}
                      </label>
                    </td>

                    {/* Absent */}
                    <td style={{ padding: "0 16px" }}>
                      <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", userSelect: "none" }}>
                        <div
                          onClick={() => mark(student.id, "absent")}
                          style={{
                            width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0,
                            border: `2px solid ${status === "absent" ? "#dc2626" : "#d1d5db"}`,
                            background: status === "absent" ? "#dc2626" : "white",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", transition: "all 0.15s",
                          }}
                        >
                          {status === "absent" && <span style={{ color: "white", fontSize: "13px", fontWeight: 400 }}>X</span>}
                        </div>
                        {status === "absent" && (
                          <span style={{ fontSize: "12px", color: "#dc2626", fontWeight: 400 }}>Absent</span>
                        )}
                      </label>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#b48ab0", fontSize: "14px" }}>
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </Teacher_layout>
  );
}