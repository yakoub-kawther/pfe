import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Teacher_layout from "../../layouts/Teacher_layout";
import Searchbar from "../../components/Searchbar";
import Buttons from "../../components/Buttons";

const sessionsData = [
  { id: 1, date: "2026-04-07", time: "10:00 - 11:30", topic: "Introduction & Vocabulary",  status: "Completed"     },
  { id: 2, date: "2026-04-09", time: "10:00 - 11:30", topic: "Grammar: Present Simple",    status: "Completed"     },
  { id: 3, date: "2026-04-14", time: "10:00 - 11:30", topic: "Reading Comprehension",      status: "Completed"     },
  { id: 4, date: "2026-04-16", time: "10:00 - 11:30", topic: "Writing Skills",             status: "Not Completed" },
  { id: 5, date: "2026-04-21", time: "10:00 - 11:30", topic: "Listening Exercises",        status: "Not Completed" },
  { id: 6, date: "2026-04-23", time: "10:00 - 11:30", topic: "Speaking Practice",          status: "Not Completed" },
];

const statusStyle = {
  "Completed":     { background: "#dcfce7", color: "#16a34a" },
  "Not Completed": { background: "#fee2e2", color: "#dc2626" },
};

export default function Class_sessions_teacher() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const cls        = state?.cls;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = sessionsData.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = s.topic.toLowerCase().includes(q) || s.date.includes(q);
    const matchFilter = filter === "All" || s.status === filter;
    return matchSearch && matchFilter;
  });

  const completed    = sessionsData.filter(s => s.status === "Completed").length;
  const notCompleted = sessionsData.filter(s => s.status === "Not Completed").length;

  return (
    <Teacher_layout>
      <div style={{ maxWidth: "1100px", margin: "40px auto",fontFamily: "Inter, sans-serif", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Header Row — title + info pills + buttons all +button back */}
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
    {sessionsData.length} sessions total
  </p>
</div>

          {/* Info Pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", flex: 1 }}>
            {[
              { label: "Lang", value: cls?.language },
              { label: "Level", value: cls?.level },
              { label: "Room", value: cls?.room },
              { label: "Schedule", value: cls?.schedule },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{
                background: "white", border: "1px solid #f0d8ee", borderRadius: "10px",
                padding: "6px 14px", fontSize: "13px",fontFamily: "Inter, sans-serif", color: "#701366",
                boxShadow: "0 1px 3px rgba(112,19,102,0.06)", display: "flex", alignItems: "center", gap: "6px",
              }}>
                <span>{icon}</span>
                <span style={{ color: "#b48ab0", fontSize: "11px" }}>{label}:</span>
                <span style={{ fontWeight: 400 }}>{value}</span>
              </div>
            ))}
          </div>
</div>

        {/* Stats Row */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {[
            { label: "Total Sessions", value: sessionsData.length, bg: "#fdf4fd", color: "#701366" },
            { label: "Completed",      value: completed,            bg: "#dcfce7", color: "#16a34a" },
            { label: "Not Completed",  value: notCompleted,         bg: "#fee2e2", color: "#dc2626" },
          ].map(({ label, value, bg, color }) => (
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

        {/* Search Bar */}
        <div>
          <Searchbar
            placeholder="Search by topic or date..."
            filterOptions={["Completed", "Not Completed"]}
            showAdd={false}
            onSearchChange={(val) => setSearch(val)}
            onFilterChange={(val) => setFilter(val)}
          />
        </div>

        {/* Table Card */}
        <div style={{ background: "white", borderRadius: "18px", boxShadow: "0 2px 12px rgba(112,19,102,0.08)", overflow: "hidden", border: "1px solid #f5e0f3" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "linear-gradient(90deg, #f8e0f8 0%, #fdf4fd 100%)", height: "52px" }}>
                {[
                  { label: "Date",   width: "16%", pl: "28px" },
                  { label: "Time",   width: "18%" },
                  { label: "Topic",  width: "34%" },
                  { label: "Status", width: "18%" },
                  { label: "Action", width: "14%" },
                ].map(({ label, width, pl }) => (
                  <th key={label} style={{
                    width, paddingLeft: pl || "16px", paddingRight: "16px",
                    fontSize: "13px", fontWeight: 500,fontFamily: "Inter, sans-serif", textAlign: "left",
                    color: "#701366", letterSpacing: "0.04em", textTransform: "uppercase",
                  }}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((session, idx) => {
                const st = statusStyle[session.status];
                return (
                  <tr
                    key={session.id}
                    style={{ height: "56px", borderBottom: "1px solid #faeaf9", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fdf6fd"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ paddingLeft: "28px", paddingRight: "16px", fontSize: "13px", fontWeight: 400, color: "#701366" }}>
                      {new Date(session.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "0 16px", fontSize: "13px", color: "#6b2163" }}>
                      <span style={{ background: "#fdf4fd", border: "1px solid #f0d8ee", borderRadius: "8px", padding: "3px 10px", fontSize: "12px" }}>
                        {session.time}
                      </span>
                    </td>
                    <td style={{ padding: "0 16px", fontSize: "14px", color: "#701366", fontWeight: 400 }}>{session.topic}</td>
                    <td style={{ padding: "0 16px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600, ...st }}>
                        {session.status === "Completed" } {session.status}
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
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#b48ab0", fontSize: "14px" }}>
                    No sessions found.
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