import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Teacher_layout from "../../layouts/Teacher_layout";
import Searchbar from "../../components/Searchbar";
import Buttons from "../../components/Buttons";
import { apiFetch } from "../../services/api";

export default function Session_attendance_teacher() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const session    = state?.session;
  const cls        = state?.cls;

  const [students,   setStudents]   = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");

  // Fetch enrolled students
  useEffect(() => {
  if (!cls?.id) return;
  apiFetch(`/inscriptions/?class_id=${cls.id}&status=confirmed`)
    .then(r => r.json())
    .then(data => {
      const list = Array.isArray(data) ? data : (data.results ?? []);
      setStudents(list);
      const init = {};
      list.forEach(s => { init[s.student] = null; }); // ✅ s.student is the person_id
      setAttendance(init);
    })
    .catch(() => {})
    .finally(() => setLoading(false));
}, [cls?.id]);

const getStudentId   = (s) => s.student;                  
const getStudentName = (s) => s.student_name ?? "—";      

const mark = (id, status) =>
  setAttendance(prev => ({ ...prev, [id]: prev[id] === status ? null : status }));

const markAll = (status) => {
  const updated = {};
  students.forEach(s => { updated[s.student] = status; }); 
  setAttendance(updated);
};

  const handleSave = async () => {
    console.log("attendance state:", attendance);
console.log("students:", students.map(s => s.student));
    setError(null);
    const unmarked = students.some(s => attendance[s.student] === null || attendance[s.student] === undefined);
    if (unmarked) {
      setError("Please mark attendance for all students before saving.");
      return;
    }

    setSaving(true);
    try {
      const attendance_list = students.map(s => ({
  student_id: s.student,
  status: attendance[s.student],
}));

      const res = await apiFetch("/attendance/bulk-mark/", {
        method: "POST",
        body: {
          session_id     : session.id,
          attendance_list,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || "Failed to save attendance.");
        return;
      }

      setSaved(true);
      setTimeout(() => navigate("/Class_sessions_teacher", { state: { cls } }), 1400);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = students.filter(s =>
    getStudentName(s).toLowerCase().includes(search.toLowerCase())
  );

  const presentCount  = Object.values(attendance).filter(v => v === "present").length;
  const absentCount   = Object.values(attendance).filter(v => v === "absent").length;
  const unmarkedCount = students.length - presentCount - absentCount;

  const formatTime = (t) => t ? t.slice(0, 5) : "";
  const timeStr = session?.start_time && session?.end_time
    ? `${formatTime(session.start_time)} - ${formatTime(session.end_time)}`
    : "";

  return (
    <Teacher_layout>
      <div style={{ maxWidth: "1100px", margin: "40px auto", fontFamily: "Inter, sans-serif", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ minWidth: "220px" }}>
            <h2 style={{ fontSize: "24px", color: "#701366", fontFamily: "Inter, sans-serif", margin: 0 }}>
              Attendance — {cls?.name}
            </h2>
            <p style={{ fontSize: "12px", color: "#b48ab0", margin: "4px 0 0" }}>
              {session?.session_date} {timeStr && `· ${timeStr}`}
            </p>
          </div>
          <div style={{ flex: 1 }} />
          <Buttons
            cancelPath="/Class_sessions_teacher"
            onSave={handleSave}
            saveLabel={saving ? "Saving..." : "Save"}
          />
        </div>

        {/* Success Banner */}
        {saved && (
          <div style={{ background: "#dcfce7", color: "#16a34a", padding: "12px 20px", borderRadius: "10px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            ✓ Attendance saved successfully! Redirecting…
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div style={{ background: "#fee2e2", color: "#dc2626", padding: "12px 20px", borderRadius: "10px", fontSize: "14px" }}>
            ⚠ {error}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {[
            { label: "Total",    value: students.length, color: "#701366" },
            { label: "Present",  value: presentCount,    color: "#16a34a" },
            { label: "Absent",   value: absentCount,     color: "#dc2626" },
            { label: "Unmarked", value: unmarkedCount,   color: "#6b7280" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: "white", border: "1px solid #f0d8ee", borderRadius: "14px",
              padding: "14px 22px", boxShadow: "0 1px 4px rgba(112,19,102,0.06)",
              flex: "1 1 auto", minWidth: "100px", textAlign: "center",
            }}>
              <p style={{ fontSize: "26px", fontWeight: 400, color, margin: 0 }}>{value}</p>
              <p style={{ fontSize: "12px", color: "#b48ab0", margin: "2px 0 0" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={() => markAll("present")}
            style={{ padding: "8px 16px", borderRadius: "9px", fontSize: "13px", border: "1.5px solid #16a34a", background: "#dcfce7", color: "#16a34a", cursor: "pointer", whiteSpace: "nowrap" }}>
            All Present
          </button>
          <button onClick={() => markAll("absent")}
            style={{ padding: "8px 16px", borderRadius: "9px", fontSize: "13px", border: "1.5px solid #dc2626", background: "#fee2e2", color: "#dc2626", cursor: "pointer", whiteSpace: "nowrap" }}>
            All Absent
          </button>
          <div style={{ minWidth: "220px", maxWidth: "280px", marginLeft: "auto" }}>
            <Searchbar placeholder="Search student..." showAdd={false} onSearchChange={val => setSearch(val)} />
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "white", borderRadius: "18px", boxShadow: "0 2px 12px rgba(112,19,102,0.08)", overflow: "hidden", border: "1px solid #f5e0f3" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "linear-gradient(90deg, #f8e0f8 0%, #fdf4fd 100%)", height: "52px" }}>
                {[
                  { label: "#",            width: "6%",  pl: "28px" },
                  { label: "Student Name", width: "46%" },
                  { label: "Present",      width: "24%" },
                  { label: "Absent",       width: "24%" },
                ].map(({ label, width, pl }) => (
                  <th key={label} style={{
                    width, paddingLeft: pl || "16px", paddingRight: "16px",
                    fontSize: "13px", fontWeight: 500, fontFamily: "Inter, sans-serif",
                    textAlign: "left", color: "#701366", letterSpacing: "0.04em", textTransform: "uppercase",
                  }}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: "center", padding: "40px", color: "#b48ab0", fontSize: "14px" }}>Loading students...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: "center", padding: "40px", color: "#b48ab0", fontSize: "14px" }}>No students found.</td></tr>
              ) : filtered.map((student, idx) => {
                const sid    = getStudentId(student);
                const name   = getStudentName(student);
                const status = attendance[sid];
                const rowBg  = status === "present" ? "#f0fdf4" : status === "absent" ? "#fff5f5" : "white";
                return (
                  <tr key={sid} style={{ height: "58px", borderBottom: "1px solid #faeaf9", background: rowBg, transition: "background 0.15s" }}>
                    <td style={{ paddingLeft: "28px", paddingRight: "16px", fontSize: "13px", color: "#c4a3c0" }}>{idx + 1}</td>
                    <td style={{ padding: "0 16px", fontSize: "14px", fontWeight: 400, color: "#701366" }}>{name || "—"}</td>

                    {/* Present */}
                    <td style={{ padding: "0 16px" }}>
                      <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", userSelect: "none" }}>
                        <div onClick={() => mark(sid, "present")} style={{
                          width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0,
                          border: `2px solid ${status === "present" ? "#16a34a" : "#d1d5db"}`,
                          background: status === "present" ? "#16a34a" : "white",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", transition: "all 0.15s",
                        }}>
                          {status === "present" && <span style={{ color: "white", fontSize: "13px" }}>✓</span>}
                        </div>
                        {status === "present" && <span style={{ fontSize: "12px", color: "#16a34a" }}>Present</span>}
                      </label>
                    </td>

                    {/* Absent */}
                    <td style={{ padding: "0 16px" }}>
                      <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", userSelect: "none" }}>
                        <div onClick={() => mark(sid, "absent")} style={{
                          width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0,
                          border: `2px solid ${status === "absent" ? "#dc2626" : "#d1d5db"}`,
                          background: status === "absent" ? "#dc2626" : "white",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", transition: "all 0.15s",
                        }}>
                          {status === "absent" && <span style={{ color: "white", fontSize: "13px" }}>✕</span>}
                        </div>
                        {status === "absent" && <span style={{ fontSize: "12px", color: "#dc2626" }}>Absent</span>}
                      </label>
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