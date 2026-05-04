import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";
import Buttons from "../../components/Buttons";
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

// ── Helpers & sub-components declared OUTSIDE the main component ─────────────

const getStats = (recs) => {
  const total   = recs.length;
  const present = recs.filter(r => r.status === "present").length;
  const percent = total > 0 ? Math.round((present / total) * 100) : 0;
  const radius  = 60, stroke = 12;
  const circ    = 2 * Math.PI * radius;
  const offset  = circ - (percent / 100) * circ;
  return { total, present, percent, radius, stroke, circ, offset };
};

const AttendanceTable = ({ recs, loading }) => (
  <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
    <thead>
      <tr style={{ background: "#F8E0F8", height: "44px" }}>
        <th style={{ ...thStyle, paddingLeft: "24px", width: "40%" }}>Date</th>
        <th style={{ ...thStyle, width: "35%" }}>Session</th>
        <th style={{ ...thStyle, width: "25%" }}>Status</th>
      </tr>
    </thead>
    <tbody>
      {loading ? (
        <tr><td colSpan={3} style={{ textAlign: "center", padding: "24px", color: "#701366", opacity: 0.5 }}>Loading...</td></tr>
      ) : recs.length === 0 ? (
        <tr><td colSpan={3} style={{ textAlign: "center", padding: "24px", color: "#701366", opacity: 0.5 }}>No attendance records.</td></tr>
      ) : recs.map((a, idx) => {
        const ac = attColors[a.status] ?? { bg: "#f3f4f6", color: "#6b7280" };
        return (
          <tr key={idx} style={{ height: "46px", borderBottom: "1px solid #f8e0f8" }}
            onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
            onMouseLeave={e => e.currentTarget.style.background = "white"}>
            <td style={{ ...tdStyle, paddingLeft: "24px" }}>{a.date ?? a.session_date ?? "—"}</td>
            <td style={tdStyle}>{a.session ?? a.session_id ?? "—"}</td>
            <td style={tdStyle}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 12px", borderRadius: "9999px", fontSize: "12px", fontFamily: F, fontWeight: 600, background: ac.bg, color: ac.color }}>
                ● {a.status}
              </span>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

const Donut = ({ recs }) => {
  const { total, present, percent, radius, stroke, circ, offset } = getStats(recs);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px" }}>
      <div style={{ display: "flex", gap: "16px", fontSize: "12px", marginBottom: "16px" }}>
        {[["#fde68a", "Absent"], ["#701366", "Present"]].map(([bg, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", color: "#701366" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: bg, display: "inline-block" }}></span>{label}
          </div>
        ))}
      </div>
      <div style={{ position: "relative", width: "130px", height: "130px" }}>
        <svg style={{ width: "100%", height: "100%" }} viewBox="0 0 150 150">
          <circle cx="75" cy="75" r={radius} stroke="#fde68a" strokeWidth={stroke} fill="none" />
          <circle cx="75" cy="75" r={radius} stroke="#701366" strokeWidth={stroke} fill="none"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 75 75)" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "22px", color: "#701366", fontFamily: F }}>{percent}%</span>
          <span style={{ fontSize: "11px", color: "#701366", opacity: 0.7 }}>Present</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: "20px", marginTop: "16px" }}>
        {[["Present", present], ["Absent", total - present], ["Total", total]].map(([label, val]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <p style={{ fontSize: "18px", color: "#701366", fontFamily: F, margin: 0 }}>{val}</p>
            <p style={{ fontSize: "11px", color: "#701366", opacity: 0.6, margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

export default function Attendance_student() {
  const { state } = useLocation();
  const student   = state?.student;
  const studentId = student?.person?.id;

  const studentTabs = [
    { name: "Profile",    path: "/Student_profile",    state: { student } },
    { name: "Classes",    path: "/Student_classes",    state: { student } },
    { name: "Payment",    path: "/Payment_student",    state: { student } },
    { name: "Attendance", path: "/Attendance_student", state: { student } },
  ];

  const [inscriptions,  setInscriptions]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [records,       setRecords]       = useState([]);
  const [attLoading,    setAttLoading]    = useState(false);
  const [allRecords,    setAllRecords]    = useState({});
  const [allLoading,    setAllLoading]    = useState(false);

  useEffect(() => {
    if (!studentId) return;
    apiFetch(`/inscriptions/student/${studentId}/history/`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data.history) ? data.history : [];
        setInscriptions(list);
        setAllLoading(true);
        Promise.all(
          list.map(ins => {
            const cid = ins.class_info?.id;
            if (!cid) return Promise.resolve({ cid, data: [] });
            return apiFetch(`/attendance/student/${studentId}/class/${cid}/`)
              .then(r => r.json())
              .then(d => ({ cid, data: Array.isArray(d) ? d : [] }))
              .catch(() => ({ cid, data: [] }));
          })
        ).then(results => {
          const map = {};
          results.forEach(({ cid, data }) => { if (cid) map[cid] = data; });
          setAllRecords(map);
        }).finally(() => setAllLoading(false));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentId]);

  const handleOpen = (ins) => {
    const cid   = ins.class_info?.id;
    const cname = ins.class_info?.name ?? "Class";
    if (!cid) return;
    setSelectedClass({ id: cid, name: cname });
    setAttLoading(true);
    apiFetch(`/attendance/student/${studentId}/class/${cid}/`)
      .then(r => r.json())
      .then(data => setRecords(Array.isArray(data) ? data : []))
      .catch(() => setRecords([]))
      .finally(() => setAttLoading(false));
  };

  const { total, present, percent } = getStats(records);

  // ── DETAIL VIEW ─────────────────────────────────────────────
  if (selectedClass) return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-Inter" style={{ color: "#701366" }}>
          {selectedClass.name} — {student?.person?.first_name} {student?.person?.last_name}
        </h2>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Tabs tabs={studentTabs} />
          <Buttons cancelPath="/Students" showSave={false} />
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div style={{ flex: 2, background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0e0ee" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 500, color: "#701366", fontFamily: F, margin: 0 }}>
                Attendance Records
                {total > 0 && <span style={{ marginLeft: "10px", fontSize: "13px", fontWeight: 400, opacity: 0.6 }}>{present}/{total} present ({percent}%)</span>}
              </h3>
            </div>
            <AttendanceTable recs={records} loading={attLoading} />
          </div>
          <div style={{ flex: 1, background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
            <h3 style={{ color: "#701366", fontFamily: F, fontSize: "16px", margin: 0, padding: "16px 24px", borderBottom: "1px solid #f0e0ee" }}>Attendance Rate</h3>
            <Donut recs={records} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );

  // ── LIST VIEW ────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-Inter" style={{ color: "#701366" }}>
          Attendance — {student?.person?.first_name} {student?.person?.last_name}
        </h2>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Tabs tabs={studentTabs} />
          <Buttons cancelPath="/Students" showSave={false} />
        </div>

        {loading || allLoading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#701366", opacity: 0.5, fontSize: "14px", fontFamily: F }}>Loading...</div>
        ) : inscriptions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#701366", opacity: 0.5, fontSize: "14px", fontFamily: F }}>No classes found.</div>
        ) : inscriptions.map((ins, idx) => {
          const cid  = ins.class_info?.id;
          const recs = allRecords[cid] ?? [];
          const sc   = statusColors[ins.status] ?? { bg: "#f3f4f6", color: "#6b7280" };
          const { total: t, present: p, percent: pct } = getStats(recs);
          return (
            <div key={idx} style={{ background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid #f0e0ee", cursor: "pointer" }}
                onClick={() => handleOpen(ins)}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontWeight: 600, color: "#701366", fontFamily: F, fontSize: "15px" }}>{ins.class_info?.name ?? "—"}</span>
                  <span style={{ fontSize: "13px", color: "#701366", opacity: 0.6, fontFamily: F }}>{ins.class_info?.language} · {ins.class_info?.level}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 10px", borderRadius: "9999px", fontSize: "12px", fontFamily: F, fontWeight: 600, background: sc.bg, color: sc.color }}>
                    ● {ins.status}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  {t > 0 && <span style={{ fontSize: "13px", color: "#701366", opacity: 0.6, fontFamily: F }}>{p}/{t} present ({pct}%)</span>}
                  <span style={{ fontSize: "18px", color: "#d8b4d8" }}>›</span>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row">
                <div style={{ flex: 2, overflow: "hidden" }}>
                  <AttendanceTable recs={recs} loading={false} />
                </div>
                <div style={{ flex: 1, borderLeft: "1px solid #f0e0ee" }}>
                  <Donut recs={recs} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}