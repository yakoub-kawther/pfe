import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock, CheckCircle, Loader2 } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";
import Searchbar from "../../components/Searchbar";
import { apiFetch } from "../../services/api";

const thStyle = {
  padding   : "12px 16px",
  fontSize  : "14px",
  fontWeight: 500,
  textAlign : "center",
  whiteSpace: "nowrap",
  color     : "#701366",
};

const tdStyle = {
  padding   : "12px 16px",
  fontSize  : "14px",
  color     : "#701366",
  whiteSpace: "nowrap",
  textAlign : "center",
};

const StatCard = ({ icon: Icon, label, value, iconBg, iconColor, valueColor }) => (
  <div style={{ flex: 1, background: "#fff", border: "1px solid #f3f4f6", borderRadius: "16px", padding: "18px 20px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", minWidth: 0 }}>
    <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon style={{ width: "19px", height: "19px", color: iconColor }} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: "12px", color: "#701366", opacity: 0.6, fontWeight: 500, marginBottom: "3px" }}>{label}</div>
      <div style={{ fontSize: "24px", fontWeight: 700, color: valueColor, lineHeight: 1 }}>{value}</div>
    </div>
  </div>
);

const statusStyle = (status) => {
  const isOk = status === "Completed" || status === "completed";
  return {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    display: "inline-block",
    background: isOk ? "#e6f7ec" : "#eaf2fb",
    color: isOk ? "#1a7f4b" : "#1d4ed8",
    textTransform: "capitalize",
  };
};

const formatDate = (value) => {
  if (!value) return "";
  // session_date may come back as a full ISO datetime (e.g. "2026-07-14T18:17:53-05:00")
  // — keep just the date part.
  return String(value).split("T")[0];
};

const backBtnStyle = {
  width: "36px", height: "32px", flexShrink: 0,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  borderRadius: "8px", cursor: "pointer",
  border: "1px solid #701366", transition: "background 0.15s, color 0.15s",
  background: "white", color: "#701366",
};

export default function Classe_sessions() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const cls       = state?.cls;

  const [search, setSearch] = useState("");

  // Cached per-class: revisiting this tab for the same class within
  // staleTime shows data instantly with no network request, instead of
  // refetching from scratch on every mount like the old useEffect version.
  const { data, isLoading, error } = useQuery({
    queryKey: ["sessions", cls?.id],
    queryFn: async () => {
      const res = await apiFetch(`/academic/sessions/?class_obj=${cls.id}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      return Array.isArray(json) ? json : (json.results ?? []);
    },
    enabled: !!cls?.id,
    staleTime: 5 * 60 * 1000,
  });

  const sessions = data ?? [];
  const loading  = isLoading;

  const classTabs = [
    { name: "Details",  path: "/Classe_information", state: { cls } },
    { name: "Students", path: "/Classe_students",    state: { cls } },
    { name: "Sessions", path: "/Classe_sessions",     state: { cls } },
  ];

  const filteredSessions = sessions.filter(s => {
    const q = search.toLowerCase();
    return formatDate(s.session_date).includes(q) || (s.status || "").toLowerCase().includes(q);
  });

  const completedCount = sessions.filter(s => s.status === "Completed" || s.status === "completed").length;
  const remainingCount = sessions.length - completedCount;

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

        {/* Stat cards */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <StatCard icon={BookOpen}    label="Total Sessions" value={sessions.length} iconBg="#F0E8F7" iconColor="#701366" valueColor="#701366" />
          <StatCard icon={CheckCircle} label="Completed"      value={completedCount}  iconBg="#e6f7ec" iconColor="#1a7f4b" valueColor="#1a7f4b" />
          <StatCard icon={Clock}       label="Remaining"      value={remainingCount}  iconBg="#eaf2fb" iconColor="#1d4ed8" valueColor="#1d4ed8" />
        </div>

        {/* Search */}
        <section className="flex items-center gap-4">
          <h2 style={{ fontSize: "18px", color: "#701366", fontWeight: "bold", margin: 0, flexShrink: 0 }}>
            Sessions ({filteredSessions.length})
          </h2>
          <Searchbar
            placeholder=" Search sessions..."
            showAdd={false}
            onSearchChange={(val) => setSearch(val)}
          />
        </section>

        {/* Table */}
        <div style={{ width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden", boxSizing: "border-box" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#F8E0F8", height: "48px" }}>
                <th style={{ ...thStyle, width: "50%" }}>Session Date</th>
                <th style={{ ...thStyle, width: "50%" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={2} style={{ textAlign: "center", padding: "32px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#701366", opacity: 0.6 }}>
                      <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                      <span style={{ fontSize: "14px" }}>Loading sessions...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={2} style={{ textAlign: "center", padding: "32px", color: "#dc2626", fontSize: "14px" }}>{error.message}</td>
                </tr>
              )}
              {!loading && !error && filteredSessions.length === 0 && (
                <tr>
                  <td colSpan={2} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5, fontSize: "14px" }}>No sessions found.</td>
                </tr>
              )}
              {!loading && !error && filteredSessions.map((s, i) => (
                <tr
                  key={i}
                  style={{ height: "48px", borderBottom: "1px solid #f8e0f8", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                  onMouseLeave={e => e.currentTarget.style.background = "white"}
                >
                  <td style={tdStyle}>{formatDate(s.session_date) || "---"}</td>
                  <td style={tdStyle}><span style={statusStyle(s.status)}>{s.status || "---"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
}