import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Teacher_layout from "../../layouts/Teacher_layout";
import Searchbar from "../../components/Searchbar";
import { apiFetch } from "../../services/api";

const statusStyle = {
  "completed":     { background: "#dcfce7", color: "#16a34a" },
  "not_completed": { background: "#fee2e2", color: "#dc2626" },
  "scheduled":     { background: "#fef9c3", color: "#854d0e" },
};

const formatTime = (t) => t ? t.slice(0, 5) : "—";

export default function Class_sessions_teacher() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const cls        = state?.cls;

  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("All");

  useEffect(() => {
    if (!cls?.id) return;
    apiFetch(`/academic/sessions/?class_obj=${cls.id}`)
      .then(r => r.json())
      .then(data => setSessions(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cls?.id]);

  const filtered = sessions.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = (s.session_date || "").includes(q) || (s.status || "").toLowerCase().includes(q);
    const matchFilter = filter === "All" || s.status === filter;
    return matchSearch && matchFilter;
  });

  const completed    = sessions.filter(s => s.status === "completed").length;
  const notCompleted = sessions.filter(s => s.status !== "completed").length;

  return (
    <Teacher_layout>
      <div style={{ maxWidth: "1100px", margin: "40px auto", fontFamily: "Inter, sans-serif", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ minWidth: "180px" }}>
            <p
              onClick={() => navigate("/Classes_teacher")}
              style={{ fontSize: "14px", color: "#b48ab0", margin: "0 0 4px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
              onMouseEnter={e => e.currentTarget.style.color = "#701366"}
              onMouseLeave={e => e.currentTarget.style.color = "#b48ab0"}
            >
              ← My Classes
            </p>
            <h2 style={{ fontSize: "24px", color: "#701366", fontFamily: "Inter, sans-serif", margin: 0 }}>
              {cls?.name} — Sessions
            </h2>
            <p style={{ fontSize: "12px", color: "#b48ab0", margin: "3px 0 0" }}>
              {sessions.length} sessions total
            </p>
          </div>

          {/* Info Pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", flex: 1 }}>
            {[
              { label: "Language", value: cls?.language?.language_name ?? cls?.language },
              { label: "Level",    value: cls?.level?.level_name       ?? cls?.level    },
              { label: "Status",   value: cls?.status                                   },
            ].filter(p => p.value).map(({ label, value }) => (
              <div key={label} style={{
                background: "white", border: "1px solid #f0d8ee", borderRadius: "10px",
                padding: "6px 14px", fontSize: "13px", fontFamily: "Inter, sans-serif", color: "#701366",
                boxShadow: "0 1px 3px rgba(112,19,102,0.06)", display: "flex", alignItems: "center", gap: "6px",
              }}>
                <span style={{ color: "#b48ab0", fontSize: "11px" }}>{label}:</span>
                <span style={{ fontWeight: 400 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {[
            { label: "Total Sessions", value: sessions.length, color: "#701366" },
            { label: "Completed",      value: completed,        color: "#16a34a" },
            { label: "Remaining",      value: notCompleted,     color: "#dc2626" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: "white", border: "1px solid #f0d8ee", borderRadius: "14px",
              padding: "14px 22px", boxShadow: "0 1px 4px rgba(112,19,102,0.06)",
              flex: "1 1 auto", minWidth: "120px", textAlign: "center",
            }}>
              <p style={{ fontSize: "24px", fontWeight: 500, color, margin: 0 }}>{value}</p>
              <p style={{ fontSize: "12px", color: "#b48ab0", margin: "2px 0 0" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <Searchbar
          placeholder="Search by date or status..."
          filterOptions={["completed", "not_completed", "scheduled"]}
          showAdd={false}
          onSearchChange={val => setSearch(val)}
          onFilterChange={val => setFilter(val)}
        />

        {/* Table */}
        <div style={{ background: "white", borderRadius: "18px", boxShadow: "0 2px 12px rgba(112,19,102,0.08)", overflow: "hidden", border: "1px solid #f5e0f3" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "linear-gradient(90deg, #f8e0f8 0%, #fdf4fd 100%)", height: "52px" }}>
                {[
                  { label: "Date",      width: "20%", pl: "28px" },
                  { label: "Time",      width: "22%" },
                  { label: "Classroom", width: "20%" },
                  { label: "Status",    width: "20%" },
                  { label: "Action",    width: "18%" },
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
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#b48ab0", fontSize: "14px" }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#b48ab0", fontSize: "14px" }}>No sessions found.</td></tr>
              ) : filtered.map(session => {
                const st = statusStyle[session.status] ?? { background: "#f3f4f6", color: "#6b7280" };
                const timeStr = session.start_time && session.end_time
                  ? `${formatTime(session.start_time)} - ${formatTime(session.end_time)}`
                  : "—";
                return (
                  <tr
                    key={session.id}
                    style={{ height: "56px", borderBottom: "1px solid #faeaf9", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fdf6fd"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ paddingLeft: "28px", paddingRight: "16px", fontSize: "13px", color: "#701366" }}>
                      {session.session_date
                        ? new Date(session.session_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                    <td style={{ padding: "0 16px", fontSize: "13px", color: "#6b2163" }}>
                      <span style={{ background: "#fdf4fd", border: "1px solid #f0d8ee", borderRadius: "8px", padding: "3px 10px", fontSize: "12px" }}>
                        {timeStr}
                      </span>
                    </td>
                    <td style={{ padding: "0 16px", fontSize: "13px", color: "#6b2163" }}>
                      {session.classroom ?? "—"}
                    </td>
                    <td style={{ padding: "0 16px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600, ...st }}>
                        {session.status}
                      </span>
                    </td>
                    <td style={{ padding: "0 16px" }}>
                      <button
                        onClick={() => navigate("/Session_attendance_teacher", { state: { session, cls } })}
                        style={{
                          padding: "6px 16px", borderRadius: "9px", fontSize: "12px", fontWeight: 400,
                          border: "1.5px solid #701366", background: "white", color: "#701366",
                          cursor: "pointer", transition: "all 0.15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#701366"; }}
                      >
                        Attendance
                      </button>
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