import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";
import { apiFetch } from "../../services/api";

const F = "Inter, sans-serif";
const thStyle = { padding: "0 16px", fontSize: "14px", fontWeight: 500, textAlign: "center", whiteSpace: "nowrap", color: "#701366", fontFamily: F };
const tdStyle = { padding: "0 16px", fontSize: "14px", color: "#701366", whiteSpace: "nowrap", textAlign: "center", fontFamily: F };

const attColors = {
  present : { bg: "#dcfce7", color: "#16a34a" },
  absent  : { bg: "#fee2e2", color: "#dc2626" },
  late    : { bg: "#fef9c3", color: "#854d0e" },
};

// Class status badge (active / completed), matching the style used on the Classes page
const classStatusStyle = (status) => {
  const s = (status ?? "").toLowerCase();
  let background = "#fdecea";
  let color      = "#c92c2c";
  if (s === "active") {
    background = "#e6f7ec";
    color      = "#1a7f4b";
  } else if (s === "completed") {
    background = "#f3e6fb";
    color      = "#701366";
  }
  return {
    padding: "2px 10px",
    borderRadius: "9999px",
    fontSize: "12px",
    fontWeight: 600,
    display: "inline-block",
    background,
    color,
    textTransform: "capitalize",
  };
};

const backBtnStyle = {
  width: "36px", height: "32px", flexShrink: 0,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  borderRadius: "8px", cursor: "pointer",
  border: "1px solid #701366", transition: "background 0.15s, color 0.15s",
  background: "white", color: "#701366",
};

const pageBtn = (active) => ({
  width: "32px", height: "32px",
  borderRadius: "8px", border: "1px solid #701366",
  background: active ? "#701366" : "white",
  color: active ? "white" : "#701366",
  fontSize: "13px", fontWeight: 600,
  cursor: "pointer", transition: "background 0.15s, color 0.15s",
});

const iconBtn = {
  width: "32px", height: "32px",
  borderRadius: "8px", border: "1px solid #701366",
  background: "white", color: "#701366",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", transition: "background 0.15s, color 0.15s",
};

const PAGE_SIZE = 5;

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
        <th style={{ ...thStyle, width: "20%" }}>Session</th>
        <th style={{ ...thStyle, width: "45%" }}>Date</th>
        <th style={{ ...thStyle, width: "35%" }}>Status</th>
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
            <td style={tdStyle}>{idx + 1}</td>
            <td style={tdStyle}>
              {a.session_date ? a.session_date.split("T")[0] : "—"}
            </td>
            <td style={tdStyle}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 12px", borderRadius: "9999px", fontSize: "12px", fontFamily: F, fontWeight: 600, background: ac.bg, color: ac.color }}>
                {a.status}
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
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const student    = state?.student;
  const studentId  = student?.person?.id;

  const studentTabs = [
    { name: "Profile",    path: "/Student_profile",    state: { student } },
    { name: "Classes",    path: "/Student_classes",    state: { student } },
    { name: "Payment",    path: "/Payment_student",    state: { student } },
    { name: "Attendance", path: "/Attendance_student", state: { student } },
  ];

  const [inscriptions,  setInscriptions]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [allRecords,    setAllRecords]    = useState({});
  const [allLoading,    setAllLoading]    = useState(false);
  const [page,          setPage]          = useState(1);

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

  const totalPages = Math.max(1, Math.ceil(inscriptions.length / PAGE_SIZE));
  const paginated  = inscriptions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const goTo = (p) => setPage(Math.min(Math.max(p, 1), totalPages));

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
              Attendance
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", width: "100%", flexShrink: 0, minWidth: 0 }}>
          <Tabs tabs={studentTabs} />
        </div>

        {loading || allLoading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#701366", opacity: 0.5, fontSize: "14px", fontFamily: F }}>Loading...</div>
        ) : inscriptions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#701366", opacity: 0.5, fontSize: "14px", fontFamily: F }}>No classes found.</div>
        ) : (
          <>
            {paginated.map((ins, idx) => {
              const cid  = ins.class_info?.id;
              const recs = allRecords[cid] ?? [];
              const { total: t, present: p, percent: pct } = getStats(recs);
              return (
                <div key={idx} style={{ background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid #f0e0ee" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <span style={{ fontWeight: 600, color: "#701366", fontFamily: F, fontSize: "15px" }}>{ins.class_info?.name ?? "—"}</span>
                      <span style={{ fontSize: "13px", color: "#701366", opacity: 0.6, fontFamily: F }}>{ins.class_info?.language} · {ins.class_info?.level}</span>
                      <span style={classStatusStyle(ins.class_info?.status)}>
                        {ins.class_info?.status ?? "—"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      {t > 0 && <span style={{ fontSize: "13px", color: "#701366", opacity: 0.6, fontFamily: F }}>{p}/{t} present ({pct}%)</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    <div style={{ flex: 2, minWidth: "320px", overflow: "hidden" }}>
                      <AttendanceTable recs={recs} loading={false} />
                    </div>
                    <div style={{ flex: 1, minWidth: "260px", borderLeft: "1px solid #f0e0ee" }}>
                      <Donut recs={recs} />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {inscriptions.length > PAGE_SIZE && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                fontSize: "13px", color: "#701366",
              }}>
                <span style={{ opacity: 0.6 }}>
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, inscriptions.length)} of {inscriptions.length}
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    onClick={() => goTo(page - 1)}
                    disabled={page === 1}
                    style={{ ...iconBtn, opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? "default" : "pointer" }}
                    onMouseEnter={e => { if (page !== 1) { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; } }}
                    onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#701366"; }}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce((acc, p, i, arr) => {
                      if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "..." ? (
                        <span key={`dots-${i}`} style={{ padding: "0 4px", opacity: 0.5 }}>…</span>
                      ) : (
                        <button key={p} onClick={() => goTo(p)} style={pageBtn(p === page)}>
                          {p}
                        </button>
                      )
                    )}

                  <button
                    onClick={() => goTo(page + 1)}
                    disabled={page === totalPages}
                    style={{ ...iconBtn, opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? "default" : "pointer" }}
                    onMouseEnter={e => { if (page !== totalPages) { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; } }}
                    onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#701366"; }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}