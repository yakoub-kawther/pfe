import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";
import { apiFetch } from "../../services/api";

const ReadField = ({ label, value, full = false }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px", ...(full ? { gridColumn: "1 / -1" } : {}), minWidth: 0 }}>
    {label ? <label style={{ fontSize: "13px", color: "#6b7280", fontFamily: "Inter, sans-serif" }}>{label}</label> : null}
    <div style={{
      width: "100%", border: "1px solid #e2d0e2", borderRadius: "8px",
      padding: "10px 14px", fontSize: "14px", color: "#701366",
      boxSizing: "border-box", fontFamily: "Inter, sans-serif",
      backgroundColor: "#faf5fa", minHeight: "40px",
    }}>
      {value || <span style={{ color: "#c9a8c9" }}>—</span>}
    </div>
  </div>
);

const Card = ({ title, children }) => (
  <div style={{ background: "white", borderRadius: "16px", border: "1px solid #f3f4f6", padding: "24px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", boxSizing: "border-box", width: "100%", minWidth: 0 }}>
    <h3 style={{ fontSize: "19px", fontWeight: 700, color: "#701366", fontFamily: "Inter, sans-serif", margin: "0 0 20px 0" }}>{title}</h3>
    {children}
  </div>
);

const STATUS_COLORS = {
  active:    { bg: "#e6f7ec", color: "#1a7f4b" },
  scheduled: { bg: "#eaf2fb", color: "#1d4ed8" },
  completed: { bg: "#f3e8ff", color: "#7c3aed" },
  cancelled: { bg: "#fdecea", color: "#c92c2c" },
};

const statusStyle = (status) => {
  const c = STATUS_COLORS[status] || { bg: "#f3f4f6", color: "#6b7280" };
  return {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    display: "inline-block",
    background: c.bg,
    color: c.color,
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

export default function Classe_information() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const cls       = state?.cls;

  const [info, setInfo] = useState({
    name:          cls?.name          || "",
    status:        cls?.status        || "",
    start_date:    cls?.start_date    || "",
    language_name: cls?.language_name || "",
    level_name:    cls?.level_name    || "",
    teacher_name:  cls?.teacher_name  || "",
  });

  const fetchClass = useCallback(async () => {
    if (!cls?.id) return;
    try {
      const res  = await apiFetch(`/academic/classes/${cls.id}/`);
      const data = await res.json();
      // The class endpoint returns flat fields — the id (e.g. "language")
      // plus its display name already resolved (e.g. "language_name") —
      // so we can use the names directly without cross-referencing the
      // separate languages/levels/teachers lists.
      setInfo({
        name:          data.name          || "",
        status:        data.status        || "",
        start_date:    data.start_date    || "",
        language_name: data.language_name || "",
        level_name:    data.level_name    || "",
        teacher_name:  data.teacher_name  || "",
      });
    } catch {}
  }, [cls]);

  useEffect(() => {
    fetchClass();
  }, [fetchClass]);

  const classTabs = [
    { name: "Details",  path: "/Classe_information", state: { cls } },
    { name: "Students", path: "/Classe_students",    state: { cls } },
    { name: "Sessions", path: "/Classe_sessions",     state: { cls } },
  ];

  const status = (info.status || "").toLowerCase();

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", minWidth: 0, boxSizing: "border-box" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "14px", direction: "ltr" }}>
          <button
            onClick={() => navigate("/Classes")}
            style={backBtnStyle}
            onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "white";   e.currentTarget.style.color = "#701366"; }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#701366", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Class Profile
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", width: "100%", flexShrink: 0, minWidth: 0 }}>
          <Tabs tabs={classTabs} />
        </div>

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start", minWidth: 0 }}>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
            <Card title="General Information">
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                <p style={{ color: "#701366", opacity: 0.75, fontFamily: "Inter, sans-serif", fontSize: "20px", fontWeight: 700, margin: 0 }}>
                  {info.name || "—"}
                </p>
                <span style={{ ...statusStyle(status), width: "fit-content" }}>
                  {status || "—"}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <ReadField label="Class Name" value={info.name} full />
                <ReadField label="Start Date" value={info.start_date} />
              </div>
            </Card>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
            <Card title="Academic Settings">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <ReadField label="Language" value={info.language_name} />
                <ReadField label="Level"    value={info.level_name} />
                <ReadField label="Teacher"  value={info.teacher_name} full />
              </div>
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}