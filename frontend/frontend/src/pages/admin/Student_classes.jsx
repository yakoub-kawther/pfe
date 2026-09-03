import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";
import { apiFetch } from "../../services/api";

const F = "Inter, sans-serif";
const thStyle = { padding: "0 16px", fontSize: "14px", fontWeight: 500, textAlign: "left", whiteSpace: "nowrap", color: "#701366", fontFamily: F };
const tdStyle = { padding: "0 16px", fontSize: "14px", color: "#701366", whiteSpace: "nowrap", fontFamily: F };
const statusColors = {
  confirmed : { bg: "#f3e8ff", color: "#701366" },
  promoted  : { bg: "#701366", color: "#fff"    },
  cancelled : { bg: "#fee2e2", color: "#dc2626" },
  repeated  : { bg: "#fef9c3", color: "#854d0e" },
};
const attColors = {
  present : { bg: "#dcfce7", color: "#16a34a" },
  absent  : { bg: "#fee2e2", color: "#dc2626" },
  late    : { bg: "#fef9c3", color: "#854d0e" },
};

const backBtnStyle = {
  width: "36px", height: "32px", flexShrink: 0,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  borderRadius: "8px", cursor: "pointer",
  border: "1px solid #701366", transition: "background 0.15s, color 0.15s",
  background: "white", color: "#701366",
};

export default function Attendance_student() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const student   = state?.student;
  const studentId = student?.person?.id;

  const studentTabs = [
    { name: "Profile",    path: "/Student_profile",    state: { student } },
    { name: "Classes",    path: "/Student_classes",    state: { student } },
    { name: "Payment",    path: "/Payment_student",    state: { student } },
    { name: "Attendance", path: "/Attendance_student", state: { student } },
  ];

  const [selectedClass, setSelectedClass] = useState(null); // { id, name }

  // Cached per student — same pattern as the other pages.
  const { data: historyData, isLoading: loading } = useQuery({
    queryKey: ["inscriptions-history", studentId],
    queryFn: async () => {
      const res  = await apiFetch(`/inscriptions/student/${studentId}/history/`);
      const data = await res.json();
      return Array.isArray(data.history) ? data.history : [];
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });
  const inscriptions = historyData ?? [];

  // Cached per student+class — re-opening a class you've already viewed
  // this session shows the attendance records instantly, no refetch.
  const { data: recordsData, isLoading: attLoading } = useQuery({
    queryKey: ["attendance", studentId, selectedClass?.id],
    queryFn: async () => {
      const res  = await apiFetch(`/attendance/student/${studentId}/class/${selectedClass.id}/`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!studentId && !!selectedClass?.id,
    staleTime: 5 * 60 * 1000,
  });
  const records = recordsData ?? [];

  const handleOpen = (ins) => {
    const cid   = ins.class_info?.id;
    const cname = ins.class_info?.name ?? "Class";
    if (!cid) return;
    setSelectedClass({ id: cid, name: cname });
  };

  const goBackToList = () => setSelectedClass(null);

  // Stats
  const total   = records.length;
  const present = records.filter(r => r.status === "present").length;
  const percent = total > 0 ? Math.round((present / total) * 100) : 0;
  const radius  = 60, stroke = 12;
  const circ    = 2 * Math.PI * radius;
  const offset  = circ - (percent / 100) * circ;

  // ── DETAIL VIEW ──────────────────────────────────────────────
  if (selectedClass) return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", minWidth: 0, boxSizing: "border-box" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "14px", direction: "ltr" }}>
          <button
            onClick={() => navigate("/Students")}
            style={backBtnStyle}
            onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "white";   e.currentTarget.style.color = "#701366"; }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{
              fontSize: "32px",
              fontWeight: 700,
              color: "#701366",
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}>
              Attendance
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", width: "100%", flexShrink: 0, minWidth: 0 }}>
          <Tabs tabs={studentTabs} />
        </div>

        {/* In-page back to list */}
        

        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>

          {/* Table */}
          <div style={{ flex: 2, minWidth: "320px", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0e0ee", display: "flex", alignItems: "center", gap: "10px" }}>
  <button
  onClick={goBackToList}
  style={{
    background: "none", border: "none", cursor: "pointer",
    color: "#701366", fontSize: "18px", padding: "0", lineHeight: 1,
    display: "flex", alignItems: "center",
  }}
  aria-label="Back to classes"
>
  ‹
</button>
  <h3 style={{ fontSize: "15px", fontWeight: 500, color: "#701366", fontFamily: F, margin: 0 }}>
    Attendance Records
    {total > 0 && <span style={{ marginLeft: "10px", fontSize: "13px", fontWeight: 400, opacity: 0.6 }}>{present}/{total} present ({percent}%)</span>}
  </h3>
</div>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
  <thead>
    <tr style={{ background: "#F8E0F8", height: "34px" }}>
      <th style={{ ...thStyle, paddingLeft: "24px", width: "20%" }}>Session</th>
      <th style={{ ...thStyle, width: "40%" }}>Date</th>
      <th style={{ ...thStyle, width: "25%" }}>Status</th>
    </tr>
  </thead>
  <tbody>
    {attLoading ? (
      <tr><td colSpan={3} style={{ textAlign: "center", padding: "24px", color: "#701366", opacity: 0.5 }}>Loading...</td></tr>
    ) : records.length === 0 ? (
      <tr><td colSpan={3} style={{ textAlign: "center", padding: "24px", color: "#701366", opacity: 0.5 }}>No attendance records.</td></tr>
    ) : records.map((a, idx) => {
      const ac = attColors[a.status] ?? { bg: "#f3f4f6", color: "#6b7280" };
      return (
        <tr key={idx} style={{ height: "46px", borderBottom: "1px solid #f8e0f8" }}
          onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
          onMouseLeave={e => e.currentTarget.style.background = "white"}>
          <td style={{ ...tdStyle, paddingLeft: "24px" }}>{idx + 1}</td>
          <td style={tdStyle } >{a.session_date ? a.session_date.split("T")[0] : "—"}</td>
          <td style={tdStyle}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 12px", borderRadius: "9999px", fontSize: "12px", fontFamily: F, fontWeight: 600, background: ac.bg, color: ac.color , textalign: "center"}}>
               {a.status}
            </span>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>
          </div>

          {/* Donut */}
          <div style={{ flex: 1, minWidth: "260px", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", padding: "28px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <h3 style={{ color: "#701366", fontFamily: F, fontSize: "16px", marginBottom: "16px" }}>Attendance Rate</h3>
            <div style={{ display: "flex", gap: "16px", fontSize: "12px", marginBottom: "16px" }}>
              {[["#fde68a","Absent"],["#701366","Present"]].map(([bg,label]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", color: "#701366" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: bg, display: "inline-block" }}></span>{label}
                </div>
              ))}
            </div>
            <div style={{ position: "relative", width: "160px", height: "160px" }}>
              <svg style={{ width: "100%", height: "100%" }} viewBox="0 0 150 150">
                <circle cx="75" cy="75" r={radius} stroke="#fde68a" strokeWidth={stroke} fill="none" />
                <circle cx="75" cy="75" r={radius} stroke="#701366" strokeWidth={stroke} fill="none"
                  strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 75 75)" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "24px", color: "#701366", fontFamily: F }}>{percent}%</span>
                <span style={{ fontSize: "12px", color: "#701366", opacity: 0.7 }}>Present</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "24px", marginTop: "24px" }}>
              {[["Present", present], ["Absent", total - present], ["Total", total]].map(([label, val]) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "20px", color: "#701366", fontFamily: F, margin: 0 }}>{val}</p>
                  <p style={{ fontSize: "12px", color: "#701366", opacity: 0.6, margin: 0 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );

  // ── LIST VIEW ─────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", minWidth: 0, boxSizing: "border-box" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "14px", direction: "ltr" }}>
          <button
            onClick={() => navigate("/Students")}
            style={backBtnStyle}
            onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "white";   e.currentTarget.style.color = "#701366"; }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{
              fontSize: "32px",
              fontWeight: 700,
              color: "#701366",
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}>
              Classes
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", width: "100%", flexShrink: 0, minWidth: 0 }}>
          <Tabs tabs={studentTabs} />
        </div>

        {/* Table */}
        <div style={{ width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden", boxSizing: "border-box" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#F8E0F8", height: "48px" }}>
                <th style={{ ...thStyle, paddingLeft: "24px", width: "22%" }}>Language</th>
                <th style={{ ...thStyle, width: "16%" }}>Level</th>
                <th style={{ ...thStyle, width: "24%" }}>Class</th>
                <th style={{ ...thStyle, width: "18%" }}>Date</th>
                <th style={{ ...thStyle, width: "14%" }}>Status</th>
                <th style={{ ...thStyle, width: "6%" }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5, fontSize: "14px" }}>Loading...</td></tr>
              ) : inscriptions.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5, fontSize: "14px" }}>No classes found.</td></tr>
              ) : inscriptions.map((ins, idx) => {
                const sc = statusColors[ins.status] ?? { bg: "#f3f4f6", color: "#6b7280" };
                return (
                  <tr key={idx} onClick={() => handleOpen(ins)}
                    style={{ height: "50px", borderBottom: "1px solid #f8e0f8", cursor: "pointer", background: "white", transition: "background .1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}>
                    <td style={{ ...tdStyle, paddingLeft: "24px", fontWeight: 500 }}>{ins.class_info?.language ?? "—"}</td>
                    <td style={tdStyle}>{ins.class_info?.level ?? "—"}</td>
                    <td style={tdStyle}>{ins.class_info?.name  ?? "—"}</td>
                    <td style={tdStyle}>{ins.inscription_date?.split("T")[0] ?? "—"}</td>
                    <td style={tdStyle}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 12px", borderRadius: "9999px", fontSize: "12px", fontFamily: F, fontWeight: 600, background: sc.bg, color: sc.color }}>
                         {ins.status}
                      </span>
                    </td>
                    <td style={tdStyle}><span style={{ fontSize: "18px", color: "#d8b4d8" }}>›</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}